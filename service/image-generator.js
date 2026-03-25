import fs from "fs";
import path from "path";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-3.1-flash-image-preview";

const CATEGORIES = {
  1: "Product Photo",
  2: "Lifestyle",
  3: "Ingredients",
  4: "Infographic",
  5: "How To/Process",
  6: "Social Proof",
};

const CATEGORY_PROMPTS = {
  "Product Photo": `Generate a professional e-commerce product photo.
Rules: packshot studio style, neutral clean background (white or light gray), soft realistic shadow, NO graphics, NO text, NO overlays.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials, logo, label.
High quality, sharp, 1:1 square format, optimized for Shopify product page.`,

  "Lifestyle": `Generate a lifestyle e-commerce image showing the product in a realistic usage environment.
Rules: realistic setting coherent with the product category, minimal props, natural or studio-realistic lighting, product must be sharp and faithful to the reference.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
Any text must be in Italian. High quality, sharp, 1:1 square format.`,

  "Infographic": `Generate an infographic-style e-commerce image for the product.
Rules: 4-6 callout boxes highlighting key features/benefits, coherent icons, clean layout, high readability.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Use realistic benefits based on the product type.
Headline max 6 words. Benefits max 5 words each.
High quality, sharp, 1:1 square format.`,

  "How To/Process": `Generate a how-to/process image showing 3-5 steps for using the product.
Rules: panel or grid layout, arrows or step numbering, brief instructions per step.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Steps max 6 words each.
High quality, sharp, 1:1 square format.`,

  "Social Proof": `Generate a social proof image with a customer review layout.
Rules: review card design, star rating (4-5 stars), realistic Italian author name, trustworthy look, clean design.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Review text max 20 words. Author name realistic Italian.
High quality, sharp, 1:1 square format.`,

  "Ingredients": `Generate an ingredients/materials showcase image.
Rules: materials/components floating or orbiting around the product, don't cover the product label, premium mood, soft beauty lighting, clear benefits.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Benefits max 5 words each.
High quality, sharp, 1:1 square format.`,
};

// Scarica immagine e convertila in base64
async function imageUrlToBase64(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
  const buffer = await resp.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

// Genera immagine con OpenRouter + Gemini
export async function generateImage(productImageUrl, category, productInfo = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY non configurata");
  }

  const categoryName = CATEGORIES[category] || category;
  const categoryPrompt = CATEGORY_PROMPTS[categoryName];
  if (!categoryPrompt) {
    throw new Error(`Categoria non valida: ${category}. Categorie: ${Object.values(CATEGORIES).join(", ")}`);
  }

  // Scarica immagine prodotto come base64
  console.log(`Scaricando immagine: ${productImageUrl.slice(0, 60)}...`);
  const imageBase64 = await imageUrlToBase64(productImageUrl);
  const mimeType = productImageUrl.includes(".png") ? "image/png" : "image/jpeg";

  // Costruisci il prompt con info prodotto
  const productContext = productInfo.title
    ? `\nProduct: ${productInfo.title}\nCategory: ${productInfo.category || ""}\nFeatures: ${(productInfo.features || []).join(", ")}`
    : "";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      modalities: ["text", "image"],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an Ecommerce Visual Art Director. Generate a high-conversion 1:1 square e-commerce image.

${categoryPrompt}
${productContext}

Use the attached product image as the EXACT reference. Do NOT change shape, proportions, logo, label, colors or materials. Remove original background if needed. No watermark. No random text. No extra incoherent objects.

Generate the image now.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  if (!message) {
    throw new Error("Nessuna risposta dal modello: " + JSON.stringify(data).slice(0, 500));
  }

  // Immagine in message.images[0].image_url.url (data URI base64)
  let generatedImageBase64 = null;

  if (message.images && Array.isArray(message.images) && message.images.length > 0) {
    const imgUrl = message.images[0]?.image_url?.url || "";
    if (imgUrl.startsWith("data:image")) {
      generatedImageBase64 = imgUrl.split(",")[1];
    }
  }

  if (!generatedImageBase64) {
    throw new Error("Nessuna immagine nella risposta. Keys: " + Object.keys(message).join(", "));
  }

  // Salva immagine localmente
  const outputDir = path.join(process.cwd(), "generated-images");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `${categoryName.toLowerCase().replace(/[\s\/]+/g, "-")}-${Date.now()}.png`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, Buffer.from(generatedImageBase64, "base64"));

  console.log(`Immagine salvata: ${filepath}`);
  return { filepath, filename, category: categoryName, base64: generatedImageBase64 };
}

// Upload immagine generata su Shopify come product image
export async function uploadImageToShopify(storeUrl, accessToken, productId, imageBase64, filename, position) {
  const resp = await fetch(`https://${storeUrl}/admin/api/2024-10/products/${productId}/images.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      image: {
        attachment: imageBase64,
        filename: filename,
        position: position || 1,
      },
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Shopify image upload error: ${JSON.stringify(data)}`);
  }
  return data.image;
}

// Genera set completo di immagini per landing page
export async function generateImageSet(productImageUrl, productInfo, categories) {
  const results = [];
  for (const cat of categories) {
    try {
      console.log(`\nGenerando immagine: ${CATEGORIES[cat] || cat}...`);
      const result = await generateImage(productImageUrl, cat, productInfo);
      results.push(result);
      console.log(`OK: ${result.category}`);
    } catch (e) {
      console.error(`ERRORE ${cat}: ${e.message}`);
      results.push({ category: CATEGORIES[cat] || cat, error: e.message });
    }
  }
  return results;
}

export { CATEGORIES };
