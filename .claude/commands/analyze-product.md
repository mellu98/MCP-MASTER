# Analyze AliExpress Product

Analizza un prodotto da un link AliExpress e estrai tutti i dati strutturati.

## Input
L'utente fornisce un URL AliExpress (es: `https://www.aliexpress.us/item/3256809187074714.html` o `https://it.aliexpress.com/item/...`).

## Step 1: Normalizza URL e scarica la pagina

1. Estrai l'item ID dall'URL con regex: `/\/item\/(\d+)\.html/`
2. Normalizza: sostituisci `aliexpress.us` con `aliexpress.com`
3. Segui il redirect con `fetch(url, { redirect: "manual" })` per ottenere l'URL reale (es: `it.aliexpress.com`)
4. Scarica la pagina HTML con User-Agent browser

## Step 2: Estrai dati dal HTML

- **og:title**: `html.match(/og:title"\s+content="(.*?)"/)`
- **og:image**: `html.match(/og:image"\s+content="(.*?)"/)`
- **Immagini prodotto**: tutte le URL `https://ae01.alicdn.com/kf/...` (escludi `_80x80` e `_50x50`)
- Usa `[...new Set(...)]` per deduplicare, prendi le prime 6

## Step 3: Arricchisci con OpenAI GPT-4o

Invia titolo + immagini a GPT-4o per ottenere JSON strutturato:

```json
{
  "title": "clean product title in English",
  "short_title": "3-5 word short title",
  "price": "estimated price",
  "original_price": "original price if available",
  "currency": "USD",
  "images": ["url1", "url2", ...],
  "description": "2-3 sentences description",
  "features": ["5-6 key features"],
  "specifications": {"key": "value"},
  "category": "product category",
  "shipping_info": "shipping details",
  "variants": ["color/size options"],
  "material": "material if mentioned",
  "target_audience": "ideal buyer"
}
```

## Step 4: Salva i dati

Salva il risultato in `service/.landing-state.json` sotto la chiave `productData`.

## Note importanti
- Le URL `aliexpress.us` fanno redirect, usa `redirect: "manual"` e segui il Location header
- Le immagini `ae01.alicdn.com` sono accettate da Shopify come URL diretti
- Se il fetch fallisce, prova con un User-Agent diverso
- NON inventare dati: se non trovi info nel HTML, lascia il campo vuoto
- Il file `service/openai-analyzer.js` contiene la funzione `extractProductData(url)` già pronta

## Uso tramite MCP
Se il server MCP è attivo, usa il tool `analyze_product` con il parametro `url`.

$ARGUMENTS
- url: URL del prodotto AliExpress da analizzare
