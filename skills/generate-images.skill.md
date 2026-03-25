# Skill: Generate Product Images

## Descrizione
Genera immagini AI professionali per e-commerce usando OpenRouter + Gemini, partendo da un'immagine di riferimento del prodotto. Carica le immagini su Shopify e assegnale alle sezioni corrette della landing page.

## Quando usarla
Dopo aver creato il prodotto su Shopify, per generare e caricare le immagini AI nelle sezioni della landing page.

## Input richiesto
- URL immagine prodotto di riferimento (dalla prima immagine del prodotto)
- Product ID Shopify
- Credenziali Shopify (storeUrl, accessToken)

## Dipendenze
- Node.js
- Pacchetto npm `sharp` (per rimozione sfondo se necessario)
- Variabile ambiente `OPENROUTER_API_KEY`

---

## ISTRUZIONI OPERATIVE

### Configurazione API

```
Provider: OpenRouter
Endpoint: https://openrouter.ai/api/v1/chat/completions
Modello: google/gemini-3.1-flash-image-preview
```

**CRITICO**: La request DEVE includere `modalities: ["text", "image"]` altrimenti ricevi solo testo.

### Struttura request

```javascript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-3.1-flash-image-preview",
    modalities: ["text", "image"],  // OBBLIGATORIO
    messages: [{
      role: "user",
      content: [
        { type: "text", text: PROMPT },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ]
    }]
  }),
});
```

### Estrazione immagine dalla risposta

```javascript
const data = await response.json();
const message = data.choices?.[0]?.message;

// L'immagine è in message.images[0].image_url.url come data URI base64
if (message.images && message.images.length > 0) {
  const imgUrl = message.images[0]?.image_url?.url || "";
  if (imgUrl.startsWith("data:image")) {
    const base64 = imgUrl.split(",")[1];
    // Salva come PNG
    fs.writeFileSync(filepath, Buffer.from(base64, "base64"));
  }
}
```

---

## LE 6 CATEGORIE

### Ruolo base (prefisso per tutti i prompt)
```
You are an Ecommerce Visual Art Director. Generate a high-conversion 1:1 square e-commerce image.
```

### Suffisso base (per tutti i prompt)
```
Use the attached product image as the EXACT reference. Do NOT change shape, proportions, logo, label, colors or materials. Remove original background if needed. No watermark. No random text. No extra incoherent objects.
Generate the image now.
```

### 1. Product Photo
```
Generate a professional e-commerce product photo.
Rules: packshot studio style, neutral clean background (white or light gray), soft realistic shadow, NO graphics, NO text, NO overlays.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials, logo, label.
High quality, sharp, 1:1 square format, optimized for Shopify product page.
```

### 2. Lifestyle
```
Generate a lifestyle e-commerce image showing the product in a realistic usage environment.
Rules: realistic setting coherent with the product category, minimal props, natural or studio-realistic lighting, product must be sharp and faithful to the reference.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
Any text must be in Italian. High quality, sharp, 1:1 square format.
```

### 3. Ingredients/Materials
```
Generate an ingredients/materials showcase image.
Rules: materials/components floating or orbiting around the product, don't cover the product label, premium mood, soft beauty lighting, clear benefits.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Benefits max 5 words each.
High quality, sharp, 1:1 square format.
```

### 4. Infographic
```
Generate an infographic-style e-commerce image for the product.
Rules: 4-6 callout boxes highlighting key features/benefits, coherent icons, clean layout, high readability.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Use realistic benefits based on the product type.
Headline max 6 words. Benefits max 5 words each.
High quality, sharp, 1:1 square format.
```

### 5. How To/Process
```
Generate a how-to/process image showing 3-5 steps for using the product.
Rules: panel or grid layout, arrows or step numbering, brief instructions per step.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Steps max 6 words each.
High quality, sharp, 1:1 square format.
```

### 6. Social Proof
```
Generate a social proof image with a customer review layout.
Rules: review card design, star rating (4-5 stars), realistic Italian author name, trustworthy look, clean design.
The product must be the EXACT same product from the reference image - same shape, proportions, colors, materials.
ALL text MUST be in Italian. Review text max 20 words. Author name realistic Italian.
High quality, sharp, 1:1 square format.
```

### Contesto prodotto (aggiungere al prompt se disponibile)
```
Product: {title}
Category: {category}
Features: {features.join(", ")}
```

---

## PIAZZAMENTO OBBLIGATORIO NELLE SEZIONI

Questa mappatura è FISSA e non va cambiata:

| Posizione | Categoria | Perché |
|---|---|---|
| **Prima immagine prodotto** (position 1) | **Infographic** | Mostra features a colpo d'occhio nella gallery |
| **PP Image with Benefits** (`pp-image-with-benefits-v1-0-0`) | **Product Photo** | Prodotto pulito accanto ai benefit cards |
| **PP Image with Text 1** (layout: `image_first`) | **Lifestyle** | Contesto d'uso accanto al testo descrittivo |
| **PP Image with Percentage** (`pp-image-with-percentage-v1-0-0`) | **Social Proof** | Recensione visiva accanto alle percentuali |
| **PP Image with Text 2** (layout: `text_first`) | **How To/Process** | Istruzioni accanto al testo |

---

## UPLOAD SU SHOPIFY

### 1. Upload come immagine prodotto

```javascript
// POST /admin/api/2024-10/products/{productId}/images.json
{
  image: {
    attachment: base64,  // base64 senza prefisso data:
    filename: "category-timestamp.png",
    position: 1  // infographic sempre position 1
  }
}
```

### 2. Upload nei Files di Shopify (per sezioni template)

```javascript
// Step 1: Carica come theme asset
PUT /themes/{themeId}/assets.json
{ asset: { key: "assets/filename.png", attachment: base64 } }

// Step 2: Crea nei Files con GraphQL
mutation { fileCreate(files: [{ originalSource: "CDN_URL", contentType: IMAGE }]) { ... } }

// Step 3: Usa nel template come
"shopify://shop_images/filename.png"
```

**ATTENZIONE**: Nel template JSON le immagini DEVONO usare il formato `shopify://shop_images/filename.png`. URL CDN diretti causano errore 422.

### 3. Riordino immagini prodotto

```javascript
// PUT /admin/api/2024-10/products/{productId}/images/{imageId}.json
{ image: { id: imageId, position: 1 } }  // infographic sempre prima
```

---

## RIMOZIONE SFONDO (per loghi o immagini che necessitano trasparenza)

I modelli AI NON generano vera trasparenza PNG. Per rimuovere lo sfondo:

```javascript
const sharp = require('sharp');

const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const threshold = 215;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i+1], b = data[i+2];
  if (r > threshold && g > threshold && b > threshold) {
    data[i+3] = 0; // trasparente
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(outputPath);
```

---

## Categorie consigliate per default

Genera sempre queste 5 (escludi Ingredients a meno che non sia un prodotto cosmetico/alimentare):
- 1 = Product Photo
- 2 = Lifestyle
- 4 = Infographic
- 5 = How To/Process
- 6 = Social Proof

## File di riferimento
- `service/image-generator.js` — funzioni `generateImage()`, `generateImageSet()`, `uploadImageToShopify()`
