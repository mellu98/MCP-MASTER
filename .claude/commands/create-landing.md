# Create Landing Page

Genera il copy e il template Shopify per una landing page di prodotto ad alta conversione.

## Prerequisito
Il prodotto deve essere stato analizzato prima (dati in `service/.landing-state.json` sotto `productData`). Se non ci sono dati prodotto, chiedi all'utente di eseguire prima `/analyze-product`.

## Step 1: Genera il copy con stile "Signora Market Copy"

Usa GPT-4o (`service/openai-analyzer.js` -> `generateCopy()`) con queste regole fondamentali:

### STILE "SIGNORA MARKET COPY"
- Parla come parleresti a una cliente al mercato
- Frasi corte, parole semplici, benefici CONCRETI e SPECIFICI
- Headline: aggettivo + nome prodotto + funzione + valore aggiunto
- Mai esagerare, mai sembrare falso
- Ogni frase deve descrivere un beneficio REALE e TANGIBILE, non generico
- NON scrivere frasi vuote tipo "Ottimo prodotto" o "Molto soddisfatto"

### LUNGHEZZE OBBLIGATORIE (dal template master)
- **product_subtitle**: 1 frase specifica sul beneficio principale (es: "Sostegno discreto e effetto pushup per un profilo migliore sotto ogni abito")
- **benefit_texts**: emoji + frase COMPLETA (es: "⬆️ Solleva di una taglia immediatamente sotto abiti attillati"). Esattamente 4.
- **inline_review_text**: 2 frasi DETTAGLIATE e naturali di un cliente soddisfatto con esperienza d'uso concreta
- **image_text_sections heading**: 5-8 parole che descrivono un beneficio specifico
- **image_text_sections text**: 2-3 frasi RICCHE che spiegano il beneficio in dettaglio
- **benefit_cards title**: 1 parola (es: "Discrezione", "Sostegno")
- **benefit_cards description**: 1 frase COMPLETA con dettaglio
- **comparison_rows feature**: 1 parola (es: "Adesione", "Comfort")
- **percentage_stats text**: 1 frase SPECIFICA con risultato concreto
- **faq_items question**: domanda specifica del cliente
- **faq_items answer**: risposta LUNGA e dettagliata con elenchi puntati se serve
- **reviews text**: 1-3 frasi SPECIFICHE e naturali, con dettagli d'uso concreti
- **cta_heading**: frase con nome prodotto e garanzia
- **cta_text**: 2-3 frasi DETTAGLIATE sulla garanzia
- **reviews**: esattamente 17 recensioni con nomi italiani realistici, rating 4-5, testo specifico

### JSON copy richiesto
Il copy deve produrre ESATTAMENTE questo JSON (tutti i campi obbligatori):
```
product_subtitle, benefit_texts[4], inline_review_text, inline_review_name,
image_text_sections[2] (heading + text), benefits_heading, benefits_subtitle,
benefit_cards[4] (icon + title + description), comparison_heading, comparison_description,
comparison_rows[5] (feature), percentage_heading, percentage_stats (3x percentage + text),
faq_heading, faq_description, faq_items[4] (question + answer),
cta_heading, cta_text, reviews[17] (name + rating + text)
```

## Step 2: Genera il template Shopify

Usa `service/template-generator.js` -> `generateLandingTemplate(productData, copyData)`.

Il template ha questa struttura ESATTA (12 sezioni nell'ordine):
1. **main** (type: `main-product`) - Info prodotto con blocchi: review_numbers, title, subtitle, price, dividers, 4x benefit text, fomo, quantity_selector (disabled), variant_picker (disabled), buy_buttons, payment, shipping, icons, review_block, 2x expandable_text
2. **brands1** (type: `brands`) - Logo Slider con 3 immagini
3. **imgText1** (type: `pp-image-with-text-v1-0-0`) - layout: image_first
4. **benefits** (type: `pp-image-with-benefits-v1-0-0`) - 4 benefit cards
5. **differences** (type: `pp-differences-v1-0-0`) - 5 comparison rows
6. **percentage** (type: `pp-image-with-percentage-v1-0-0`) - 3 stats
7. **imgText2** (type: `pp-image-with-text-v1-0-0`) - layout: text_first
8. **brands2** (type: `brands`) - Logo Slider con 3 immagini
9. **faqs** (type: `pp-faqs-v1-0-0`) - 4 FAQ items
10. **cta** (type: `pp-call-to-action-v1-0-0`) - heading + text + button
11. **reviews** (type: `pp-review-grid-v1-0-0`) - fino a 17 reviews
12. **recommended** (type: `pp-recommended-products-v1-0-0`) - disabled

### Schema colori
- Tutti i colori accento sono NERI (#000000), non rosa
- Pulsanti: sfondo nero, testo bianco
- Brand color: #000000
- Container border: #000000 (desktop), #e0e0e0 (mobile)

## Step 3: Salva lo state

Salva `copyData` e il template generato in `service/.landing-state.json`.

## Uso tramite MCP
Se il server MCP è attivo, usa il tool `generate_landing` per generare copy + template.

## Lingue
Il copy di default e' in italiano. Per altre lingue, dopo aver creato la versione italiana, traduci il template completo nella lingua desiderata mantenendo la stessa struttura JSON. Usa il suffisso lingua nel nome template (es: `landing-xxxx-DE` per tedesco).

$ARGUMENTS
- language: Lingua del copy (default: italiano). Opzioni: it, de, en, fr, es
