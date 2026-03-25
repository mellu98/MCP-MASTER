# Landing Page Generator — Setup Guide

Sistema automatizzato per creare landing page e-commerce ad alta conversione partendo da un link AliExpress. Genera copy persuasivo, immagini AI e pubblica tutto su Shopify.

## Cosa fa

1. **Analizza** un prodotto da link AliExpress (estrae titolo, immagini, features, prezzo)
2. **Genera copy** persuasivo in stile "Signora Market Copy" (italiano colloquiale, benefici concreti)
3. **Crea template** Shopify landing page con 12 sezioni ottimizzate per conversione
4. **Genera 5 immagini AI** professionali (Product Photo, Lifestyle, Infographic, How To, Social Proof)
5. **Pubblica tutto** su Shopify: prodotto, template, immagini nelle sezioni corrette

---

## Requisiti

- **Node.js** v18+ (consigliato v20+)
- **Account OpenAI** con API key (per analisi prodotto e generazione copy)
- **Account OpenRouter** con API key (per generazione immagini AI con Gemini)
- **Store Shopify** con accesso admin API
- **Tema PagePilot** installato sullo store Shopify

---

## Setup passo per passo

### 1. Clona il progetto

```bash
git clone <repo-url>
cd landing-page-mcp
```

### 2. Installa dipendenze

```bash
cd service
npm install
```

### 3. Ottieni le API keys

#### OpenAI
1. Vai su https://platform.openai.com/api-keys
2. Crea una nuova API key
3. Copia la chiave `sk-proj-...`

#### OpenRouter
1. Vai su https://openrouter.ai/keys
2. Crea una nuova API key
3. Copia la chiave `sk-or-v1-...`

#### Shopify Admin Token
1. Vai nel tuo pannello Shopify: `Settings → Apps and sales channels → Develop apps`
2. Clicca `Create an app` → dai un nome (es: "Landing Page Generator")
3. Vai su `Configure Admin API scopes` e abilita:
   - `write_products` / `read_products`
   - `write_themes` / `read_themes`
   - `write_files` / `read_files`
   - `write_content` / `read_content`
4. Clicca `Install app`
5. Copia il token `shpat_...`

### 4. Configura le credenziali

Crea il file `.mcp.json` nella root del progetto.

**Opzione A — Server remoto (consigliato, usa il server su Render):**

```json
{
  "mcpServers": {
    "landing-page": {
      "type": "sse",
      "url": "https://TUO-SERVIZIO.onrender.com/sse"
    }
  }
}
```

**Opzione B — Server locale:**

```json
{
  "mcpServers": {
    "landing-page": {
      "command": "node",
      "args": ["service/mcp-server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-LA_TUA_CHIAVE_OPENAI",
        "OPENROUTER_API_KEY": "sk-or-v1-LA_TUA_CHIAVE_OPENROUTER"
      }
    }
  }
}
```

**IMPORTANTE**: Il file `.mcp.json` è nel `.gitignore` — le chiavi restano locali.

### 5. Verifica l'installazione

```bash
cd service
node -e "console.log('Node OK:', process.version)"
node -e "require('openai'); console.log('OpenAI SDK OK')"
node -e "require('sharp'); console.log('Sharp OK')"
```

---

## Come usare

### Con Claude Code (consigliato)

Le skill sono disponibili come slash commands:

```
/analyze-product    → Analizza prodotto da link AliExpress
/create-landing     → Genera copy + template landing page
/generate-images    → Genera immagini AI per il prodotto
/shopify-expert     → Gestione Shopify (prodotti, template, immagini)
```

Flusso tipico:
```
Tu: /analyze-product url=https://aliexpress.com/item/123456.html
Tu: /create-landing
Tu: /generate-images
Tu: /shopify-expert action=publish
```

### Con altri assistenti AI (Antigravity, Cursor, ecc.)

Usa i file nella cartella `skills/` come contesto. Carica il file `.skill.md` rilevante nella chat:

- `skills/analyze-product.skill.md`
- `skills/create-landing.skill.md`
- `skills/generate-images.skill.md`
- `skills/shopify-expert.skill.md`

Ogni skill contiene tutte le istruzioni, i prompt, il codice e le soluzioni agli errori comuni. L'assistente AI le segue come un playbook.

### Uso diretto via script Node

```bash
cd service

# Analizza prodotto
node --input-type=module -e "
import { extractProductData } from './openai-analyzer.js';
const data = await extractProductData('https://aliexpress.com/item/123456.html');
console.log(JSON.stringify(data, null, 2));
"

# Genera copy
node --input-type=module -e "
import { generateCopy } from './openai-analyzer.js';
import fs from 'fs';
const state = JSON.parse(fs.readFileSync('.landing-state.json','utf8'));
const copy = await generateCopy(state.productData);
console.log(JSON.stringify(copy, null, 2));
"

# Genera template
node --input-type=module -e "
import { generateLandingTemplate } from './template-generator.js';
import fs from 'fs';
const state = JSON.parse(fs.readFileSync('.landing-state.json','utf8'));
const { templateName, template } = generateLandingTemplate(state.productData, state.copyData);
console.log('Template:', templateName);
"
```

---

## Struttura progetto

```
landing-page-mcp/
├── .mcp.json                    # Config MCP con API keys (gitignored)
├── .claude/commands/            # Slash commands per Claude Code
│   ├── analyze-product.md
│   ├── create-landing.md
│   ├── generate-images.md
│   └── shopify-expert.md
├── skills/                      # Skill esportabili per qualsiasi AI
│   ├── analyze-product.skill.md
│   ├── create-landing.skill.md
│   ├── generate-images.skill.md
│   └── shopify-expert.skill.md
├── master-template.json         # Template master di riferimento per le landing
├── service/
│   ├── mcp-server.js            # Server MCP (stdio transport)
│   ├── openai-analyzer.js       # Analisi prodotto + generazione copy
│   ├── template-generator.js    # Generatore template Shopify JSON
│   ├── image-generator.js       # Generazione immagini AI (OpenRouter)
│   ├── shopify-client.js        # Client Shopify API
│   ├── render.yaml              # Config deploy Render.com
│   ├── .env.example             # Template variabili ambiente
│   └── package.json
└── README.md
```

---

## Credenziali Shopify per richiesta

Le credenziali Shopify non sono hardcoded. Vengono passate come parametri:

```javascript
// Ogni funzione accetta storeUrl e accessToken
createProduct(storeUrl, accessToken, productData, copyData)
createProductTemplate(storeUrl, accessToken, templateName, templateJson)
assignTemplateToProduct(storeUrl, accessToken, productId, templateSuffix)
```

Questo permette di lavorare su **più store** senza cambiare configurazione.

---

## Schema colori landing page

Il template usa uno schema colori nero (professionale, adatto a qualsiasi prodotto):

| Elemento | Colore |
|---|---|
| Pulsanti sfondo | `#000000` |
| Pulsanti testo | `#ffffff` |
| Brand color | `#000000` |
| Container border | `#000000` |
| Container border mobile | `#e0e0e0` |
| Stelle review | `#facc15` |

---

## Piazzamento immagini AI nelle sezioni

Ogni immagine generata va in una sezione specifica:

| Sezione | Immagine |
|---|---|
| Prima immagine prodotto | Infographic |
| PP Image with Benefits | Product Photo |
| PP Image with Text 1 | Lifestyle |
| PP Image with Percentage | Social Proof |
| PP Image with Text 2 | How To/Process |

---

## Lingue supportate

Il copy di default è in italiano. Per creare versioni in altre lingue:

1. Genera la versione italiana
2. Traduci il template JSON nella lingua desiderata
3. Salva con suffisso lingua (es: `landing-xxxxx-DE` per tedesco)
4. Cambia `date_locale` (es: `de-DE`, `fr-FR`, `en-US`)

---

## Troubleshooting

| Problema | Soluzione |
|---|---|
| `OPENAI_API_KEY` non trovata | Verifica `.mcp.json` o esporta come variabile ambiente |
| AliExpress redirect loop | Usa `redirect: "manual"` nel fetch |
| Shopify 422 "image does not point to resource" | Usa `shopify://shop_images/` nel template, non URL CDN |
| Logo senza trasparenza | Usa `sharp` per rimuovere sfondo bianco |
| Template non si aggiorna via MCP | Riavvia VS Code o usa script node diretti |
| Gemini restituisce solo testo | Aggiungi `modalities: ["text", "image"]` alla request |
| `fileCreate` access denied | Token manca scope `write_files` — ricrea il token con gli scope corretti |

---

## Tema Shopify richiesto

Il template è progettato per il tema **PagePilot**. Sezioni utilizzate:

- `main-product` (nativo Shopify)
- `brands` (PagePilot)
- `pp-image-with-text-v1-0-0`
- `pp-image-with-benefits-v1-0-0`
- `pp-differences-v1-0-0`
- `pp-image-with-percentage-v1-0-0`
- `pp-faqs-v1-0-0`
- `pp-call-to-action-v1-0-0`
- `pp-review-grid-v1-0-0`
- `pp-recommended-products-v1-0-0`

Se usi un tema diverso, queste sezioni non saranno disponibili e il template non funzionerà.
