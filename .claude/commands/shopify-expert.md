# Shopify Expert

Gestisci il tema Shopify, i prodotti e le landing page. Questo comando ti rende un esperto del nostro setup Shopify specifico.

## Il nostro stack
- **Tema**: PagePilot (export da theme-export-toolorastore)
- **Template landing**: Basato su `main-product` + sezioni PagePilot
- **API**: Shopify Admin REST API 2024-10 + GraphQL Admin API
- **Struttura credenziali**: `storeUrl` + `accessToken` (shpat_...) per ogni store

## Operazioni disponibili

### 1. Crea prodotto su Shopify
```javascript
// POST /admin/api/2024-10/products.json
{
  product: {
    title: productData.short_title,
    body_html: copyData.product_description_html,
    status: "draft",  // sempre draft inizialmente
    variants: [{ price: "29.99", compare_at_price: "49.99" }],
    images: productData.images.map(src => ({ src }))  // URL alicdn accettati
  }
}
```

### 2. Upload template landing page
```javascript
// PUT /admin/api/2024-10/themes/{themeId}/assets.json
{
  asset: {
    key: "templates/product.{templateName}.json",
    value: JSON.stringify(templateJson)
  }
}
```

### 3. Assegna template al prodotto (GraphQL)
```graphql
mutation productUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product { id templateSuffix }
    userErrors { field message }
  }
}
# variables: { input: { id: "gid://shopify/Product/{id}", templateSuffix: "{templateName}" } }
```

### 4. Gestione immagini prodotto
- **Upload**: POST `/products/{id}/images.json` con `{ image: { attachment: base64, filename, position } }`
- **Riordina**: PUT `/products/{id}/images/{imageId}.json` con `{ image: { position: N } }`
- **Elimina**: DELETE `/products/{id}/images/{imageId}.json`

### 5. Gestione template
- **Lista assets**: GET `/themes/{themeId}/assets.json`
- **Elimina template**: DELETE `/themes/{themeId}/assets.json?asset[key]=templates/product.{name}.json`
- **Trova tema attivo**: GET `/themes.json` -> `themes.find(t => t.role === "main")`

### 6. Upload immagini nei Files (per sezioni template)
```javascript
// Le immagini nelle sezioni template richiedono formato shopify://shop_images/
// 1. Carica come theme asset
PUT /themes/{themeId}/assets.json -> { asset: { key: "assets/file.png", attachment: base64 } }
// 2. Crea nei Files con fileCreate mutation
mutation { fileCreate(files: [{ originalSource: "CDN_URL", contentType: IMAGE }]) { files { id } } }
// 3. Usa nel template come: "shopify://shop_images/file.png"
```

### 7. Modifica header/logo
```javascript
// Il logo è in sections/header-group.json
GET /themes/{themeId}/assets.json?asset[key]=sections/header-group.json
// Modifica: headerGroup.sections.header.settings.logo = "shopify://shop_images/logo.png"
PUT /themes/{themeId}/assets.json -> { asset: { key: "sections/header-group.json", value: JSON.stringify(headerGroup) } }
```

### 8. Pubblica/Attiva prodotto (GraphQL)
```graphql
mutation productUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product { id status }
    userErrors { field message }
  }
}
# variables: { input: { id: "gid://shopify/Product/{id}", status: "ACTIVE" } }
```

## Struttura template landing (12 sezioni)

1. `main-product` — Info prodotto (blocchi: review_numbers, title, pp_text subtitle, price, 4x pp_text benefits, fomo, quantity_selector disabled, variant_picker disabled, buy_buttons, payment, shipping, pp_icons_with_text, pp_divider, pp_review_block, pp_expandable_text x2)
2. `brands` — Logo Slider 1
3. `pp-image-with-text-v1-0-0` — Image+Text 1 (layout: image_first)
4. `pp-image-with-benefits-v1-0-0` — Benefits (4 cards)
5. `pp-differences-v1-0-0` — Comparison table (5 rows)
6. `pp-image-with-percentage-v1-0-0` — Stats percentuali (3 stats)
7. `pp-image-with-text-v1-0-0` — Image+Text 2 (layout: text_first)
8. `brands` — Logo Slider 2
9. `pp-faqs-v1-0-0` — FAQ (4 items)
10. `pp-call-to-action-v1-0-0` — CTA (heading + text + button)
11. `pp-review-grid-v1-0-0` — Review Grid (fino a 17 reviews)
12. `pp-recommended-products-v1-0-0` — Prodotti consigliati (disabled)

## Schema colori standard
- Pulsanti e accenti: `#000000` (nero)
- Testo pulsanti: `#ffffff`
- Container border desktop: `#000000`
- Container border mobile: `#e0e0e0`
- Brand color: `#000000`
- Stelle: `#facc15`

## Piazzamento immagini nelle sezioni
| Sezione | Immagine AI |
|---|---|
| Prima immagine prodotto | Infographic |
| PP Image with Benefits | Product Photo |
| PP Image with Text 1 | Lifestyle |
| PP Image with Percentage | Social Proof |
| PP Image with Text 2 | How To/Process |

## File di riferimento nel progetto
- `service/shopify-client.js` — Client API (createProduct, createProductTemplate, assignTemplateToProduct, fullImport)
- `service/template-generator.js` — Generatore template JSON
- `service/openai-analyzer.js` — Analisi prodotto + copy
- `service/image-generator.js` — Generazione immagini AI
- `service/mcp-server.js` — Server MCP per Claude Code
- `service/.landing-state.json` — Stato corrente (productData, copyData)

## Errori comuni e soluzioni
- **"Setting 'image' does not point to an applicable resource"**: Usa `shopify://shop_images/` non URL CDN
- **Immagini mancanti nel picker Files**: Serve `fileCreate` mutation, non solo theme asset upload
- **Template non aggiornato**: Il server MCP ha cache moduli — riavvia VS Code o usa script diretti con `node`
- **422 su creazione prodotto**: Verifica che `images` sia array di oggetti `{ src: url }`
- **Logo senza trasparenza**: I modelli AI non generano vera trasparenza — usa `sharp` per rimuovere sfondo bianco

$ARGUMENTS
- action: Azione da eseguire (create-product, upload-template, assign-template, manage-images, update-header, publish)
