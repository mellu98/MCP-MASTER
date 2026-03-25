import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { extractProductData, generateCopy } from "./openai-analyzer.js";
import { generateLandingTemplate } from "./template-generator.js";
import * as shopify from "./shopify-client.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, ".landing-state.json");

// Persistent state: current landing page being worked on
function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  }
  return null;
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

const server = new McpServer({
  name: "landing-page-generator",
  version: "2.0.0",
});

// ─── TOOL 1: Analizza prodotto AliExpress ───
server.tool(
  "analyze_product",
  "Analizza un prodotto AliExpress tramite URL. Estrae titolo, immagini, prezzo, features, specifiche. Usa questo come primo step.",
  {
    url: z.string().describe("URL del prodotto AliExpress"),
  },
  async ({ url }) => {
    try {
      const productData = await extractProductData(url);
      const state = loadState() || {};
      state.productData = productData;
      state.url = url;
      saveState(state);

      return {
        content: [
          {
            type: "text",
            text: `Prodotto analizzato con successo!\n\n**${productData.title}**\nPrezzo: ${productData.price}\nImmagini: ${productData.images?.length || 0}\nFeatures: ${productData.features?.length || 0}\nCategoria: ${productData.category || "N/A"}\n\nDati salvati. Ora puoi usare "generate_landing" per generare la landing page.`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Errore: ${err.message}` }] };
    }
  }
);

// ─── TOOL 2: Genera landing page completa ───
server.tool(
  "generate_landing",
  "Genera il copy e il template completo della landing page basandosi sul prodotto analizzato. Usa le istruzioni 'Signora Market Copy' per il copy in italiano.",
  {
    copy_instructions: z
      .string()
      .optional()
      .describe(
        "Istruzioni extra per il copy (es: target, tono, focus specifico)"
      ),
  },
  async ({ copy_instructions }) => {
    try {
      const state = loadState();
      if (!state?.productData) {
        return {
          content: [
            {
              type: "text",
              text: "Nessun prodotto analizzato. Usa prima 'analyze_product' con un URL AliExpress.",
            },
          ],
        };
      }

      const copyData = await generateCopy(
        state.productData,
        copy_instructions || ""
      );

      const { templateName, template } = generateLandingTemplate(
        state.productData,
        copyData
      );

      state.copyData = copyData;
      state.templateName = templateName;
      state.template = template;
      saveState(state);

      return {
        content: [
          {
            type: "text",
            text: `Landing page generata!\n\n**Subtitle:** ${copyData.product_subtitle}\n**CTA:** ${copyData.cta_heading}\n\n**Sezioni (come master):**\n1. Main product (4 benefit, review inline, buy button)\n2. Brand slider\n3. Immagine + testo 1\n4. ${copyData.benefit_cards?.length || 0} Benefit cards\n5. ${copyData.comparison_rows?.length || 0} Comparison rows\n6. Statistiche percentuali\n7. Immagine + testo 2\n8. Brand slider\n9. ${copyData.faq_items?.length || 0} FAQ\n10. Call to action\n11. ${copyData.reviews?.length || 0} Reviews\n12. Prodotti consigliati (disabled)\n\nTemplate: ${templateName}\n\nOra puoi:\n- Modificare sezioni con "update_section"\n- Pubblicare su Shopify con "push_to_shopify"`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Errore: ${err.message}` }] };
    }
  }
);

// ─── TOOL 3: Mostra stato corrente della landing ───
server.tool(
  "get_landing_status",
  "Mostra lo stato corrente della landing page: sezioni, copy, template name.",
  {},
  async () => {
    const state = loadState();
    if (!state?.template) {
      return {
        content: [
          {
            type: "text",
            text: "Nessuna landing page in lavorazione. Usa 'analyze_product' e poi 'generate_landing'.",
          },
        ],
      };
    }

    const sections = state.template.order.map((id, i) => {
      const sec = state.template.sections[id];
      return `${i + 1}. [${id}] tipo: ${sec.type}, blocchi: ${Object.keys(sec.blocks || {}).length}`;
    });

    return {
      content: [
        {
          type: "text",
          text: `**Landing Page: ${state.templateName}**\nProdotto: ${state.productData?.title || "N/A"}\n\n**Sezioni:**\n${sections.join("\n")}\n\n**Copy attuale:**\n- Subtitle: ${state.copyData?.product_subtitle || "N/A"}\n- CTA: ${state.copyData?.cta_heading || "N/A"}\n- Benefits: ${state.copyData?.benefit_texts?.length || 0}\n- Reviews: ${state.copyData?.reviews?.length || 0}`,
        },
      ],
    };
  }
);

// ─── TOOL 4: Modifica una sezione specifica ───
server.tool(
  "update_section",
  "Modifica il copy o le impostazioni di una sezione specifica della landing page. Puoi cambiare headline, testi, FAQ, reviews, cards, ecc.",
  {
    section_type: z
      .enum([
        "hero_headline",
        "hero_subheadline",
        "hero_caption",
        "product_description",
        "scrolling_text",
        "cta_text",
        "urgency_text",
        "benefit_card",
        "feature_row",
        "comparison_row",
        "faq_item",
        "review",
      ])
      .describe("Tipo di sezione da modificare"),
    index: z
      .number()
      .optional()
      .describe(
        "Indice dell'elemento da modificare (per cards, rows, faq, reviews). Parte da 0."
      ),
    new_value: z
      .string()
      .describe(
        "Nuovo valore. Per elementi composti usa JSON: {\"title\": \"...\", \"description\": \"...\"}"
      ),
  },
  async ({ section_type, index, new_value }) => {
    try {
      const state = loadState();
      if (!state?.template || !state?.copyData) {
        return {
          content: [
            { type: "text", text: "Nessuna landing in lavorazione." },
          ],
        };
      }

      let parsed;
      try {
        parsed = JSON.parse(new_value);
      } catch {
        parsed = new_value;
      }

      switch (section_type) {
        case "hero_headline":
          state.copyData.hero_headline = new_value;
          updateHeroInTemplate(state, "headline", new_value);
          break;
        case "hero_subheadline":
          state.copyData.hero_subheadline = new_value;
          updateHeroInTemplate(state, "subheadline", new_value);
          break;
        case "hero_caption":
          state.copyData.hero_caption = new_value;
          updateHeroInTemplate(state, "caption", new_value);
          break;
        case "product_description":
          state.copyData.product_description_html = new_value;
          break;
        case "scrolling_text":
          state.copyData.scrolling_text = new_value;
          updateScrollingText(state, new_value);
          break;
        case "cta_text":
          state.copyData.cta_text = new_value;
          updateCtaButtons(state, new_value);
          break;
        case "urgency_text":
          state.copyData.urgency_text = new_value;
          break;
        case "benefit_card":
          if (index != null && state.copyData.benefit_cards?.[index]) {
            state.copyData.benefit_cards[index] =
              typeof parsed === "object"
                ? { ...state.copyData.benefit_cards[index], ...parsed }
                : { ...state.copyData.benefit_cards[index], title: new_value };
            updateCardsInTemplate(state);
          }
          break;
        case "feature_row":
          if (index != null && state.copyData.feature_rows?.[index]) {
            state.copyData.feature_rows[index] =
              typeof parsed === "object"
                ? { ...state.copyData.feature_rows[index], ...parsed }
                : {
                    ...state.copyData.feature_rows[index],
                    heading: new_value,
                  };
            updateMultirowInTemplate(state);
          }
          break;
        case "comparison_row":
          if (index != null && state.copyData.comparison_rows?.[index]) {
            state.copyData.comparison_rows[index] =
              typeof parsed === "object"
                ? { ...state.copyData.comparison_rows[index], ...parsed }
                : {
                    ...state.copyData.comparison_rows[index],
                    benefit: new_value,
                  };
            updateComparisonInTemplate(state);
          }
          break;
        case "faq_item":
          if (index != null && state.copyData.faq_items?.[index]) {
            state.copyData.faq_items[index] =
              typeof parsed === "object"
                ? { ...state.copyData.faq_items[index], ...parsed }
                : {
                    ...state.copyData.faq_items[index],
                    question: new_value,
                  };
            updateFaqInTemplate(state);
          }
          break;
        case "review":
          if (index != null && state.copyData.reviews?.[index]) {
            state.copyData.reviews[index] =
              typeof parsed === "object"
                ? { ...state.copyData.reviews[index], ...parsed }
                : { ...state.copyData.reviews[index], text: new_value };
            updateReviewsInTemplate(state);
          }
          break;
      }

      // Regenerate template from updated copy
      const { template } = generateLandingTemplate(
        state.productData,
        state.copyData
      );
      state.template = template;
      saveState(state);

      return {
        content: [
          {
            type: "text",
            text: `Sezione "${section_type}"${index != null ? ` [${index}]` : ""} aggiornata con successo.`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Errore: ${err.message}` }] };
    }
  }
);

// ─── TOOL 5: Pubblica su Shopify ───
server.tool(
  "push_to_shopify",
  "Pubblica la landing page su Shopify: crea il prodotto, carica il template nel tema attivo, e assegna il template al prodotto.",
  {
    store_url: z
      .string()
      .describe("URL dello store Shopify (es: tuostore.myshopify.com)"),
    access_token: z
      .string()
      .describe("Access token Shopify (shpat_...)"),
  },
  async ({ store_url, access_token }) => {
    try {
      const state = loadState();
      if (!state?.template || !state?.productData || !state?.copyData) {
        return {
          content: [
            {
              type: "text",
              text: "Nessuna landing pronta. Genera prima con 'analyze_product' e 'generate_landing'.",
            },
          ],
        };
      }

      const result = await shopify.fullImport(
        store_url,
        access_token,
        state.productData,
        state.copyData,
        state.templateName,
        state.template
      );

      state.shopifyProduct = result.product;
      state.shopifyUrl = result.productUrl;
      state.adminUrl = result.adminUrl;
      saveState(state);

      return {
        content: [
          {
            type: "text",
            text: `Landing page pubblicata su Shopify!\n\n**Prodotto:** ${result.product.title}\n**Admin:** ${result.adminUrl}\n**URL:** ${result.productUrl}\n**Template:** ${state.templateName}\n**Stato:** Draft (puoi attivarlo dall'admin)`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Errore Shopify: ${err.message}` }] };
    }
  }
);

// ─── TOOL 6: Esporta template JSON ───
server.tool(
  "export_template",
  "Esporta il template JSON della landing page corrente. Utile per salvarlo o ispezionarlo.",
  {},
  async () => {
    const state = loadState();
    if (!state?.template) {
      return {
        content: [{ type: "text", text: "Nessuna landing in lavorazione." }],
      };
    }

    const outputPath = join(__dirname, `template-${state.templateName}.json`);
    writeFileSync(outputPath, JSON.stringify(state.template, null, 2), "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Template esportato in: ${outputPath}`,
        },
      ],
    };
  }
);

// ─── TOOL 7: Reset ───
server.tool(
  "reset_landing",
  "Cancella la landing page corrente e ricomincia da zero.",
  {},
  async () => {
    if (existsSync(STATE_FILE)) {
      writeFileSync(STATE_FILE, "{}", "utf-8");
    }
    return {
      content: [
        {
          type: "text",
          text: "Landing page resettata. Puoi iniziare una nuova con 'analyze_product'.",
        },
      ],
    };
  }
);

// ─── Helper functions per aggiornare il template ───
function updateHeroInTemplate(state, field, value) {
  // Will be regenerated from copyData
}
function updateScrollingText(state, value) {}
function updateCtaButtons(state, value) {}
function updateCardsInTemplate(state) {}
function updateMultirowInTemplate(state) {}
function updateComparisonInTemplate(state) {}
function updateFaqInTemplate(state) {}
function updateReviewsInTemplate(state) {}

// ─── Start HTTP/SSE server ───
const PORT = process.env.PORT || 3000;
const transports = {};

const httpServer = createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === "/" || url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", name: "landing-page-generator", version: "2.0.0" }));
    return;
  }

  // SSE endpoint — client connects here with GET
  if (url.pathname === "/sse" && req.method === "GET") {
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    transport.onclose = () => {
      delete transports[transport.sessionId];
    };
    await server.connect(transport);
    await transport.start();
    return;
  }

  // Messages endpoint — client sends JSON-RPC messages here with POST
  if (url.pathname === "/messages" && req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = transports[sessionId];
    if (!transport) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid or missing sessionId" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        await transport.handlePostMessage(req, res, JSON.parse(body));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP SSE server running on http://0.0.0.0:${PORT}`);
  console.log(`SSE endpoint: /sse`);
  console.log(`Messages endpoint: /messages`);
});
