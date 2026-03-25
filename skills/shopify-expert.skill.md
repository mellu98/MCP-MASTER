# Skill: Shopify Expert

## Descrizione
Gestione completa dello store Shopify: creazione prodotti, upload template landing page, gestione immagini, configurazione header/logo, pubblicazione. Basata sul tema PagePilot e sulla struttura landing page testata e ottimizzata.

## Quando usarla
Per qualsiasi operazione su Shopify: creare prodotti, caricare template, gestire immagini, modificare il tema, pubblicare.

## Input richiesto
- `storeUrl`: dominio Shopify (es: `test-mcp-3.myshopify.com`)
- `accessToken`: token admin API (es: `shpat_xxxxx`)

## Dipendenze
- Node.js (fetch nativo)
- API version: `2024-10`

---

## ISTRUZIONI OPERATIVE

## 1. CREAZIONE PRODOTTO

```javascript
const res = await fetch(`https://${storeUrl}/admin/api/2024-10/products.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  },
  body: JSON.stringify({
    product: {
      title: productData.short_title || productData.title,
      body_html: productData.description,
      vendor: "Our Store",
      product_type: productData.category || "",
      tags: productData.category || "",
      status: "draft",  // SEMPRE draft inizialmente
      variants: [{
        price: productData.price?.toString().replace(/[^0-9.]/g, "") || "29.99",
        compare_at_price: productData.original_price?.toString().replace(/[^0-9.]/g, "") || null,
        inventory_management: null,
        requires_shipping: true,
      }],
      images: (productData.images || []).map(src => ({ src })),
      // URL ae01.alicdn.com sono accettati da Shopify
    },
  }),
});
const product = (await res.json()).product;
```

---

## 2. UPLOAD TEMPLATE LANDING PAGE

```javascript
// Step 1: Trova tema attivo
const themes = await (await fetch(`https://${storeUrl}/admin/api/2024-10/themes.json`, {
  headers: { "X-Shopify-Access-Token": accessToken }
})).json();
const themeId = themes.themes.find(t => t.role === "main").id;

// Step 2: Carica template
const res = await fetch(`https://${storeUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  },
  body: JSON.stringify({
    asset: {
      key: `templates/product.${templateName}.json`,
      value: JSON.stringify(templateJson, null, 2),
    },
  }),
});
```

---

## 3. ASSEGNA TEMPLATE AL PRODOTTO (GraphQL)

```javascript
const query = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id templateSuffix }
      userErrors { field message }
    }
  }
`;

const res = await fetch(`https://${storeUrl}/admin/api/2024-10/graphql.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  },
  body: JSON.stringify({
    query,
    variables: {
      input: {
        id: `gid://shopify/Product/${productId}`,
        templateSuffix: templateName,  // es: "landing-v6yk4w"
      }
    }
  }),
});
```

---

## 4. GESTIONE IMMAGINI PRODOTTO

### Upload immagine (base64)
```javascript
POST /admin/api/2024-10/products/{productId}/images.json
{ image: { attachment: base64, filename: "name.png", position: 1 } }
```

### Upload immagine (URL)
```javascript
POST /admin/api/2024-10/products/{productId}/images.json
{ image: { src: "https://url-immagine.jpg", position: 1 } }
```

### Riordina
```javascript
PUT /admin/api/2024-10/products/{productId}/images/{imageId}.json
{ image: { id: imageId, position: newPosition } }
```

### Elimina
```javascript
DELETE /admin/api/2024-10/products/{productId}/images/{imageId}.json
```

### Lista immagini
```javascript
GET /admin/api/2024-10/products/{productId}/images.json
```

---

## 5. IMMAGINI NELLE SEZIONI TEMPLATE

Le sezioni PagePilot richiedono il formato `shopify://shop_images/filename.png`.

**Flusso completo:**

```javascript
// 1. Carica come theme asset
PUT /themes/{themeId}/assets.json
{ asset: { key: "assets/my-image.png", attachment: base64 } }
// Restituisce public_url (CDN)

// 2. Registra nei Files Shopify
mutation { fileCreate(files: [{ originalSource: "CDN_URL", contentType: IMAGE }]) { files { id } } }

// 3. Nel template JSON usa:
"image": "shopify://shop_images/my-image.png"
```

**NON usare URL CDN diretti nel template** → errore 422: "Setting 'image' does not point to an applicable resource"

---

## 6. MODIFICA HEADER E LOGO

```javascript
// 1. Leggi header-group.json
const res = await fetch(`https://${storeUrl}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=sections/header-group.json`, {
  headers: { "X-Shopify-Access-Token": accessToken }
});
const headerGroup = JSON.parse((await res.json()).asset.value);

// 2. Modifica logo
headerGroup.sections.header.settings.logo = "shopify://shop_images/logo.png";
headerGroup.sections.header.settings.logo_width = 150;

// 3. Salva
await fetch(`https://${storeUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
  body: JSON.stringify({
    asset: { key: "sections/header-group.json", value: JSON.stringify(headerGroup, null, 2) }
  })
});
```

**NOTA**: Il logo deve essere caricato anche nei Files (vedi sezione 5) perché l'header usa `shopify://shop_images/`.

---

## 7. PUBBLICA PRODOTTO

```javascript
// GraphQL
mutation productUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product { id status }
    userErrors { field message }
  }
}
// variables: { input: { id: "gid://shopify/Product/{id}", status: "ACTIVE" } }
```

---

## 8. GESTIONE TEMPLATE

### Lista tutti i template
```javascript
GET /themes/{themeId}/assets.json
// Filtra: assets.filter(a => a.key.startsWith("templates/product.") && a.key.endsWith(".json"))
```

### Elimina template
```javascript
DELETE /themes/{themeId}/assets.json?asset[key]=templates/product.{name}.json
```

---

## 9. QUERY FILES SHOPIFY (per verificare immagini caricate)

```graphql
{
  files(first: 10, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        ... on MediaImage {
          id
          image { url altText }
        }
      }
    }
  }
}
```

---

## STRUTTURA LANDING PAGE (riferimento rapido)

| # | Sezione | Type | Immagine AI |
|---|---|---|---|
| 1 | Info prodotto | `main-product` | — (gallery prodotto) |
| 2 | Logo Slider 1 | `brands` | — |
| 3 | Image+Text 1 | `pp-image-with-text-v1-0-0` (image_first) | Lifestyle |
| 4 | Benefits | `pp-image-with-benefits-v1-0-0` | Product Photo |
| 5 | Differences | `pp-differences-v1-0-0` | — |
| 6 | Percentage | `pp-image-with-percentage-v1-0-0` | Social Proof |
| 7 | Image+Text 2 | `pp-image-with-text-v1-0-0` (text_first) | How To/Process |
| 8 | Logo Slider 2 | `brands` | — |
| 9 | FAQ | `pp-faqs-v1-0-0` | — |
| 10 | CTA | `pp-call-to-action-v1-0-0` | — |
| 11 | Reviews | `pp-review-grid-v1-0-0` | — |
| 12 | Recommended | `pp-recommended-products-v1-0-0` (disabled) | — |

## SCHEMA COLORI STANDARD

```
Pulsanti sfondo:          #000000
Pulsanti testo:           #ffffff
Brand color:              #000000
Container border desktop: #000000
Container border mobile:  #e0e0e0
Pill FOMO:                #000000
Stelle review:            #facc15
Heading/Body color:       #000000
```

---

## ERRORI COMUNI E SOLUZIONI

| Errore | Causa | Soluzione |
|---|---|---|
| 422 "Setting 'image' does not point to applicable resource" | URL CDN nel template | Usa `shopify://shop_images/` |
| 422 su creazione prodotto | images non è array di `{src}` | Verifica formato `images: [{src: url}]` |
| Logo non appare nel picker | Solo in theme assets, non in Files | Usa `fileCreate` mutation |
| Logo senza trasparenza | AI non genera vera trasparenza | Usa `sharp` per rimuovere sfondo |
| Template non si aggiorna | Cache moduli MCP server | Riavvia VS Code o usa script node diretti |
| Access denied stagedUploadsCreate | Token senza scope write_files | Usa `fileCreate` con URL CDN come workaround |

## File di riferimento
- `service/shopify-client.js` — createProduct, createProductTemplate, assignTemplateToProduct, fullImport
- `service/template-generator.js` — generateLandingTemplate(productData, copyData)
- `service/image-generator.js` — generateImage, uploadImageToShopify
- `service/mcp-server.js` — Server MCP per Claude Code
