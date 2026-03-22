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

app.post("/api/generate", async (req, res) => {
  const { url, copyInstructions, shopifyStoreUrl, shopifyAccessToken } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  if (!shopifyStoreUrl || !shopifyAccessToken) {
    return res.status(400).json({ error: "Shopify credentials are required" });
  }

  // SSE-style streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  function send(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  try {
    // Step 1-2: Analyze product and generate copy with OpenAI
    send({ step: 1, status: "active" });
    send({ step: 2, status: "active" });

    const { productData, copyData } = await analyzeAliExpressProduct(
      url,
      copyInstructions
    );

    send({ step: 1, status: "done" });
    send({ step: 2, status: "done" });

    // Step 3: Generate template
    send({ step: 3, status: "active" });
    const { templateName, template } = generateLandingTemplate(
      productData,
      copyData
    );
    send({ step: 3, status: "done" });

    // Step 4-5: Import to Shopify
    send({ step: 4, status: "active" });

    const result = await fullImport(
      shopifyStoreUrl,
      shopifyAccessToken,
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

// API endpoint to preview template without importing
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

    res.json({
      productData,
      copyData,
      templateName,
      template,
    });
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Landing Page Generator running at http://localhost:${PORT}`);
  console.log(`OpenAI API: ${process.env.OPENAI_API_KEY ? "configured" : "NOT SET"}`);
});
