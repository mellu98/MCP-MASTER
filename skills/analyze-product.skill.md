# Skill: Analyze AliExpress Product

## Descrizione
Analizza un prodotto da un link AliExpress, estrai dati strutturati (titolo, prezzo, immagini, features, categoria) e salva il risultato per le fasi successive della pipeline landing page.

## Quando usarla
Quando l'utente fornisce un URL AliExpress e vuole estrarre i dati del prodotto.

## Input richiesto
- **url**: URL del prodotto AliExpress (es: `https://www.aliexpress.us/item/3256809187074714.html`)

## Dipendenze
- Node.js
- Pacchetto npm `openai`
- Variabile ambiente `OPENAI_API_KEY`

---

## ISTRUZIONI OPERATIVE

### Step 1: Normalizza l'URL

```javascript
const cleanUrl = url.split("?")[0]; // rimuovi query params
const itemIdMatch = cleanUrl.match(/\/item\/(\d+)\.html/);
if (!itemIdMatch) throw new Error("URL AliExpress non valido: manca l'item ID");

// Sostituisci .us con .com per evitare redirect loop
let realUrl = cleanUrl.replace("aliexpress.us", "aliexpress.com");
```

### Step 2: Segui il redirect

AliExpress fa redirect da `.com` a `it.aliexpress.com` o altra localizzazione. Usa `redirect: "manual"` per catturare il Location header.

```javascript
try {
  const redirectResp = await fetch(realUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    redirect: "manual",
  });
  const location = redirectResp.headers.get("location");
  if (location) {
    realUrl = location.startsWith("http") ? location : `https:${location}`;
    realUrl = realUrl.split("?")[0];
  }
} catch {
  // usa l'URL originale se il redirect fallisce
}
```

### Step 3: Scarica la pagina HTML

```javascript
const resp = await fetch(realUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
const html = await resp.text();
```

### Step 4: Estrai dati dal HTML

```javascript
// Open Graph tags
const ogTitle = html.match(/og:title"\s+content="(.*?)"/)?.[1] || "";
const ogImage = html.match(/og:image"\s+content="(.*?)"/)?.[1] || "";

// Tutte le immagini prodotto da alicdn (escludi thumbnail piccole)
const allImages = [...new Set(
  [...html.matchAll(/https:\/\/ae01\.alicdn\.com\/kf\/[^"'\s)]+/g)]
    .map(m => m[0])
    .filter(u => !u.includes("_80x80") && !u.includes("_50x50"))
)];
```

**IMPORTANTE**: Se `ogTitle` è vuoto, il fetch è fallito — riprova con un User-Agent diverso.

### Step 5: Arricchisci con GPT-4o

Invia il titolo e le immagini estratte a GPT-4o per ottenere dati strutturati.

**System prompt:**
```
You are a product data analyst. Given a product title and images from AliExpress, extract structured product information. Be accurate and concise.
```

**User prompt:**
```
Analyze this AliExpress product and return structured JSON data.

PRODUCT TITLE: {ogTitle}
PRODUCT IMAGES: {prime 6 immagini}
PRODUCT URL: {realUrl}

Return a JSON object:
{
  "title": "clean product title in English (fix any translation issues)",
  "short_title": "3-5 word short title",
  "price": "estimated price if visible, or empty string",
  "original_price": "original price if available, or empty string",
  "currency": "USD",
  "images": ["url1", "url2", ...max 6],
  "description": "product description based on title and category (2-3 sentences)",
  "features": ["5-6 key features based on the product title and type"],
  "specifications": {"key": "value pairs based on title info"},
  "category": "product category",
  "shipping_info": "standard AliExpress shipping",
  "orders_count": "",
  "review_summary": "",
  "variants": ["likely color/size options based on product type"],
  "material": "material from title if mentioned",
  "target_audience": "ideal buyer"
}

Return ONLY valid JSON.
```

### Step 6: Salva il risultato

Salva i dati estratti in `service/.landing-state.json`:

```javascript
const state = { productData: extractedData };
fs.writeFileSync("service/.landing-state.json", JSON.stringify(state, null, 2));
```

## Output atteso

Un oggetto JSON con tutti i campi del prodotto compilati. Le immagini `ae01.alicdn.com` sono URL validi che Shopify accetta direttamente.

## Errori comuni

| Errore | Causa | Soluzione |
|---|---|---|
| Redirect count exceeded | URL `.us` causa loop | Usa `redirect: "manual"` |
| ogTitle vuoto | Pagina non caricata | Cambia User-Agent |
| GPT inventa dati falsi | Web search unreliable | Usa SOLO dati dal HTML, GPT arricchisce ma non inventa |
| Immagini mancanti | Regex non matcha | Verifica pattern `ae01.alicdn.com/kf/` |

## File di riferimento
Il codice completo è in `service/openai-analyzer.js` nella funzione `extractProductData(url)`.
