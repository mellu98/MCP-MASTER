# Generate Product Images

Genera immagini AI per il prodotto e caricale su Shopify nelle sezioni corrette.

## Prerequisito
- Prodotto analizzato con dati in `service/.landing-state.json`
- Variabile ambiente `OPENROUTER_API_KEY` configurata
- Prodotto già creato su Shopify (serve il product ID)

## Configurazione API
- **Provider**: OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- **Modello**: `google/gemini-3.1-flash-image-preview`
- **CRITICO**: includere `modalities: ["text", "image"]` nella request body
- **Risposta immagine**: in `data.choices[0].message.images[0].image_url.url` (base64 data URI)

## 6 Categorie di immagini

### 1. Product Photo
Packshot studio professionale, sfondo neutro (bianco o grigio chiaro), ombra morbida realistica. NO grafiche, NO testo, NO overlay. Il prodotto deve essere IDENTICO al riferimento.

### 2. Lifestyle
Prodotto in ambiente d'uso realistico, props minimi, illuminazione naturale o studio. Il prodotto deve essere nitido e fedele al riferimento.

### 3. Ingredients/Materials
Materiali/componenti flottanti o orbitanti attorno al prodotto, non coprire l'etichetta, mood premium, illuminazione beauty.

### 4. Infographic
4-6 callout box con features/benefici chiave, icone coerenti, layout pulito, alta leggibilità. Testo in italiano.

### 5. How To/Process
3-5 step per l'uso del prodotto, layout a pannelli o griglia, frecce o numerazione, istruzioni brevi per step. Testo in italiano.

### 6. Social Proof
Layout con recensione cliente, design card, rating stelle (4-5), nome autore italiano realistico. Testo in italiano.

## Prompt base per tutte le categorie
```
You are an Ecommerce Visual Art Director. Generate a high-conversion 1:1 square e-commerce image.
[CATEGORY PROMPT]
[PRODUCT CONTEXT]
Use the attached product image as the EXACT reference. Do NOT change shape, proportions, logo, label, colors or materials.
Remove original background if needed. No watermark. No random text. No extra incoherent objects.
Generate the image now.
```

## Flusso di generazione

1. Scarica la prima immagine prodotto come base64
2. Per ogni categoria, invia richiesta a OpenRouter con immagine di riferimento
3. Estrai base64 dalla risposta: `message.images[0].image_url.url.split(",")[1]`
4. Salva in `service/generated-images/`
5. Il file `service/image-generator.js` contiene le funzioni già pronte

## Piazzamento OBBLIGATORIO nelle sezioni landing page

| Sezione Template | Categoria Immagine |
|---|---|
| **Prima immagine prodotto** (position 1) | Infographic |
| **PP Image with Benefits** (`pp-image-with-benefits-v1-0-0`) | Product Photo |
| **PP Image with Text 1** (layout: `image_first`) | Lifestyle |
| **PP Image with Percentage** (`pp-image-with-percentage-v1-0-0`) | Social Proof |
| **PP Image with Text 2** (layout: `text_first`) | How To/Process |

## Upload su Shopify

1. Carica le immagini come immagini prodotto via REST API (`products/{id}/images.json` con `attachment` base64)
2. Riordina: infographic in posizione 1
3. Per le sezioni del template, usa il formato `shopify://shop_images/filename.png`
4. NON usare URL CDN diretti nel template (errore 422) — serve il formato `shopify://shop_images/`
5. Per caricare nei Files di Shopify, usa la mutation GraphQL `fileCreate` con l'URL CDN come `originalSource`

## Note
- Gemini potrebbe non generare trasparenza reale nei PNG — usa `sharp` per rimuovere lo sfondo se necessario
- Le immagini generate vengono salvate in `service/generated-images/`
- Genera tutte e 5 le categorie (escludi Ingredients a meno che non sia rilevante)

$ARGUMENTS
- categories: Categorie da generare (default: 1,2,4,5,6 = Product Photo, Lifestyle, Infographic, How To, Social Proof)
