import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { analyzeAliExpressProduct } from "./openai-analyzer.js";
import { generateLandingTemplate } from "./template-generator.js";
import { fullImport } from "./shopify-client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// Check config on startup
const missingVars = [];
if (!process.env.OPENAI_API_KEY) missingVars.push("OPENAI_API_KEY");
if (!process.env.SHOPIFY_STORE_URL) missingVars.push("SHOPIFY_STORE_URL");
if (!process.env.SHOPIFY_ACCESS_TOKEN) missingVars.push("SHOPIFY_ACCESS_TOKEN");

app.get("/api/status", (req, res) => {
  res.json({
    openai: !!process.env.OPENAI_API_KEY,
    shopify: !!process.env.SHOPIFY_STORE_URL && !!process.env.SHOPIFY_ACCESS_TOKEN,
    storeUrl: process.env.SHOPIFY_STORE_URL || null,
  });
});

app.post("/api/generate", async (req, res) => {
  const { url, copyInstructions } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
    return res.status(400).json({ error: "Configura SHOPIFY_STORE_URL e SHOPIFY_ACCESS_TOKEN nel file .env" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  function send(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  try {
    send({ step: 1, status: "active" });
    send({ step: 2, status: "active" });

    const { productData, copyData } = await analyzeAliExpressProduct(
      url,
      copyInstructions
    );

    send({ step: 1, status: "done" });
    send({ step: 2, status: "done" });

    send({ step: 3, status: "active" });
    const { templateName, template } = generateLandingTemplate(
      productData,
      copyData
    );
    send({ step: 3, status: "done" });

    send({ step: 4, status: "active" });

    const storeUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    const result = await fullImport(
      storeUrl,
      accessToken,
      productData,
      copyData,
      templateName,
      template
    );

    send({ step: 4, status: "done" });
    send({ step: 5, status: "active" });
    send({ step: 5, status: "done" });

    send({
      result: {
        productTitle: result.product.title,
        productUrl: result.productUrl,
        adminUrl: result.adminUrl,
        templateName: templateName,
      },
    });
  } catch (err) {
    console.error("Generation error:", err);
    send({ error: err.message });
  } finally {
    res.end();
  }
});

app.post("/api/preview", async (req, res) => {
  const { url, copyInstructions } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const { productData, copyData } = await analyzeAliExpressProduct(
      url,
      copyInstructions
    );
    const { templateName, template } = generateLandingTemplate(
      productData,
      copyData
    );

    res.json({ productData, copyData, templateName, template });
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Landing Page Generator`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  OpenAI:  ${process.env.OPENAI_API_KEY ? "OK" : "MANCANTE"}`);
  console.log(`  Shopify: ${process.env.SHOPIFY_STORE_URL || "MANCANTE"}`);
  console.log(`  Token:   ${process.env.SHOPIFY_ACCESS_TOKEN ? "OK" : "MANCANTE"}`);
  if (missingVars.length) {
    console.log(`\n  Configura nel .env: ${missingVars.join(", ")}\n`);
  }
});
