# Skill: Create Landing Page

## Descrizione
Genera tutto il copy persuasivo in stile "Signora Market Copy" e il template Shopify JSON per una landing page di prodotto ad alta conversione. Il template è basato sul tema PagePilot con 12 sezioni.

## Quando usarla
Dopo aver analizzato il prodotto (dati in `service/.landing-state.json`), per generare copy + template.

## Input richiesto
- Dati prodotto (da `service/.landing-state.json` -> `productData`)
- Lingua (default: italiano)

## Dipendenze
- Node.js
- Pacchetto npm `openai`
- Variabile ambiente `OPENAI_API_KEY`

---

## ISTRUZIONI OPERATIVE

## PARTE 1: GENERAZIONE COPY

### Stile "Signora Market Copy"

Questo è lo stile di copywriting obbligatorio. Ogni testo generato DEVE seguire queste regole:

1. **Parla come parleresti a una cliente al mercato** — linguaggio colloquiale, diretto, zero formalità corporate
2. **Frasi corte, parole semplici** — niente giri di parole
3. **Benefici CONCRETI e SPECIFICI** — mai generici. "Solleva di una taglia" non "Migliora il look"
4. **Headline formula**: aggettivo + nome prodotto + funzione + valore aggiunto
5. **Mai esagerare, mai sembrare falso** — credibilità prima di tutto
6. **NON scrivere frasi vuote** — bandite: "Ottimo prodotto", "Molto soddisfatto", "Alta qualità". Scrivi COSA fa il prodotto concretamente

### Lunghezze e formato OBBLIGATORI per ogni campo

| Campo | Lunghezza | Esempio |
|---|---|---|
| `product_subtitle` | 1 frase specifica sul beneficio principale | "Sostegno discreto e effetto pushup per un profilo migliore sotto ogni abito" |
| `benefit_texts` (x4) | emoji + frase COMPLETA | "⬆️ Solleva di una taglia immediatamente sotto abiti attillati" |
| `inline_review_text` | 2 frasi DETTAGLIATE, esperienza d'uso concreta | "Questo prodotto aderisce alla pelle e resta discreto sotto i vestiti, offre un supporto invisibile..." |
| `inline_review_name` | Nome + iniziale | "Maria R." |
| `image_text_sections.heading` (x2) | 5-8 parole, beneficio specifico | "Niente spalline visibili sotto abiti attillati" |
| `image_text_sections.text` (x2) | 2-3 frasi RICCHE | "Aderisce alla pelle e resta discreto sotto vestiti sottili. Perfetto per camicie aderenti..." |
| `benefits_heading` | Titolo sezione | "Perché scegliere [prodotto]" |
| `benefits_subtitle` | Sottotitolo breve | "I vantaggi che fanno la differenza" |
| `benefit_cards.icon` (x4) | 1 emoji | "🧲" |
| `benefit_cards.title` (x4) | 1 parola | "Discrezione" |
| `benefit_cards.description` (x4) | 1 frase COMPLETA | "Rimane invisibile sotto camicie e giacche, senza spalline visibili." |
| `comparison_heading` | Frase con nome prodotto | "Perché [prodotto] si distingue" |
| `comparison_description` | 1-2 frasi | "Confronta le caratteristiche..." |
| `comparison_rows.feature` (x5) | 1 parola | "Adesione", "Comfort" |
| `percentage_heading` | Titolo | "Risultati che noti subito" |
| `percentage_stats` (x3) | numero (90-99) + 1 frase SPECIFICA | 98 + "Segnalato aumento immediato della definizione del décolleté" |
| `faq_items.question` (x4) | Domanda specifica | "Cosa significa taglia unica? Andrà bene per me?" |
| `faq_items.answer` (x4) | Risposta LUNGA con elenchi puntati | "Il nostro prodotto utilizza un tessuto ultra-elastico...\n\nAdatto per:\n\nCirconferenza: 65-85 cm..." |
| `cta_heading` | Frase con nome prodotto + garanzia | "Provalo senza rischi: 30 giorni soddisfatti o rimborsati" |
| `cta_text` | 2-3 frasi DETTAGLIATE garanzia | "Prova il [prodotto] per 30 giorni. Se non ti piace..." |
| `reviews` (x17) | name + rating (4-5) + 1-3 frasi SPECIFICHE | "All'inizio ero scettico, poi l'ho usato in macchina per una settimana..." |

### Prompt GPT-4o per generare il copy

**System prompt:**
```
Sei un copywriter esperto per e-commerce italiano. Scrivi copy di vendita in italiano colloquiale e diretto, orientato ai benefici concreti del prodotto.

STILE "SIGNORA MARKET COPY":
- Parla come parleresti a una cliente al mercato
- Frasi corte, parole semplici, benefici CONCRETI e SPECIFICI
- Headline: aggettivo + nome prodotto + funzione + valore aggiunto
- Mai esagerare, mai sembrare falso
- Ogni frase deve descrivere un beneficio REALE e TANGIBILE, non generico
- NON scrivere frasi vuote tipo "Ottimo prodotto" o "Molto soddisfatto" - scrivi COSA fa il prodotto concretamente

LUNGHEZZE E STILE:
[inserisci tutta la tabella lunghezze sopra con gli esempi]
```

**User prompt:**
```
Genera TUTTO il copy per la landing page di questo prodotto. Tutto in italiano.

PRODOTTO:
{JSON productData}

Rispondi con ESATTAMENTE questo JSON:
{vedi struttura completa sotto}

Rispondi SOLO con JSON valido, niente markdown, niente commenti.
```

### Struttura JSON copy completa

```json
{
  "product_subtitle": "frase",
  "benefit_texts": ["emoji + beneficio x4"],
  "inline_review_text": "testo testimonial",
  "inline_review_name": "Nome C.",
  "image_text_sections": [
    {"heading": "titolo", "text": "testo"},
    {"heading": "titolo", "text": "testo"}
  ],
  "benefits_heading": "titolo",
  "benefits_subtitle": "sottotitolo",
  "benefit_cards": [
    {"icon": "emoji", "title": "Parola", "description": "frase"},
    {"icon": "emoji", "title": "Parola", "description": "frase"},
    {"icon": "emoji", "title": "Parola", "description": "frase"},
    {"icon": "emoji", "title": "Parola", "description": "frase"}
  ],
  "comparison_heading": "Perché [prodotto] si distingue",
  "comparison_description": "descrizione",
  "comparison_rows": [
    {"feature": "Parola"},
    {"feature": "Parola"},
    {"feature": "Parola"},
    {"feature": "Parola"},
    {"feature": "Parola"}
  ],
  "percentage_heading": "titolo",
  "percentage_stats": {
    "percentage_1": 98, "text_1": "frase",
    "percentage_2": 97, "text_2": "frase",
    "percentage_3": 96, "text_3": "frase"
  },
  "faq_heading": "Domande frequenti sul [prodotto]",
  "faq_description": "sottotitolo",
  "faq_items": [
    {"question": "domanda", "answer": "risposta lunga"},
    {"question": "domanda", "answer": "risposta lunga"},
    {"question": "domanda", "answer": "risposta lunga"},
    {"question": "domanda", "answer": "risposta lunga"}
  ],
  "cta_heading": "frase CTA",
  "cta_text": "testo garanzia",
  "reviews": [
    {"name": "Nome C.", "rating": 4, "text": "recensione specifica"},
    ... // 17 totali, rating misto 4-5
  ]
}
```

---

## PARTE 2: GENERAZIONE TEMPLATE SHOPIFY

### Struttura template (12 sezioni, ordine ESATTO)

Il template è un JSON Shopify con `sections` e `order`. Ogni sezione ha `type`, `blocks`, `block_order`, `settings`.

#### Sezione 1: main (type: `main-product`)
Blocchi nell'ordine:
1. `pp_review_numbers` — rating: 5, stars_color: "#facc15", review_count: 343, review_text: "recensioni"
2. `title` — title_size: 28, title_height: 120, text_transform: "none"
3. `pp_text` (subtitle) — text: `<strong>{product_subtitle}</strong>`, text_style: "subtitle"
4. `price` — price_style: "price", price_size: 20, badge settings, sale/regular price colors
5. `pp_divider` (disabled)
6. `pp_text` x4 — i 4 benefit_texts, text_style: "body"
7. `fomo` — "(x) Visitatori", pill_color: "#000000", min: 5, max: 9
8. `pp_divider` (disabled)
9. `quantity_selector` (disabled) — BUNDLE & SAVE config completa
10. `variant_picker` (disabled) — picker_type: "button"
11. `buy_buttons` — lm_main_button: "#000000", lm_main_text: "#ffffff", animation: "ripple", skip_cart: true
12. `payment` — visa, master, paypal, apple_pay, shopify-pay, google-pay
13. `shipping` — ship_days: 2, text: "Ordina in (timer) per riceverlo (date)", date_locale: "it-IT"
14. `pp_icons_with_text` — truck/Spedizione veloce, box/Resi gratuiti, heart/Garanzia 30 giorni
15. `pp_divider`
16. `pp_review_block` — inline review (text + name)
17. `pp_divider`
18. `pp_expandable_text` x2 — Spedizione + Reso

**Settings main section:**
```json
{
  "enable_sticky_info": true,
  "show_container": true,
  "container_radius": 10,
  "container_padding": 30,
  "container_color": "#ffffff",
  "container_border_color": "#000000",
  "container_border_color_mb": "#e0e0e0",
  "pp_brand_color": "#000000",
  "pp_button_background_color": "#000000",
  "pp_button_text_color": "#ffffff",
  "pp_border_radius": 16,
  "gallery_layout": "stacked",
  "media_fit": "contain",
  "image_zoom": "none",
  "show_full_image": true,
  "first_image_size": 100
}
```

#### Sezione 2: brands1 (type: `brands`)
Logo Slider con 3 blocchi `image` (logo_image_width: 200). scroll_speed: 15.

#### Sezione 3: imgText1 (type: `pp-image-with-text-v1-0-0`)
Layout: `image_first`. Blocchi: heading, text, button ("Lo voglio", scroll_to_top).

#### Sezione 4: benefits (type: `pp-image-with-benefits-v1-0-0`)
4 blocchi `benefit` con icon, title, description. image_rounded_type: "circle".

#### Sezione 5: differences (type: `pp-differences-v1-0-0`)
5 blocchi `comparison_item` con feature, product_has_feature: true, competitor_has_feature: false.
product_title dal prodotto, competitor_title: "Altri". Button: "Aggiungi al carrello".

#### Sezione 6: percentage (type: `pp-image-with-percentage-v1-0-0`)
Blocchi: heading, percentage_items (3 stats con color_end: "#d1d5db"), button (disabled).

#### Sezione 7: imgText2 (type: `pp-image-with-text-v1-0-0`)
Layout: `text_first`. Stessa struttura di imgText1 ma layout invertito.

#### Sezione 8: brands2 (type: `brands`)
Identico a brands1.

#### Sezione 9: faqs (type: `pp-faqs-v1-0-0`)
4 blocchi `faq_item` con question + answer.

#### Sezione 10: cta (type: `pp-call-to-action-v1-0-0`)
Blocchi: heading, text, button. guarantee_icon: "certification", icon_size: 72.

#### Sezione 11: reviews (type: `pp-review-grid-v1-0-0`)
Fino a 17 blocchi `review` con name, verified_text: "Acquirente Verificato", rating, review_text.

#### Sezione 12: recommended (type: `pp-recommended-products-v1-0-0`)
Disabled. heading: "Prodotti consigliati".

### Schema colori (OBBLIGATORIO)
```
Pulsanti sfondo:        #000000
Pulsanti testo:         #ffffff
Brand color:            #000000
Container border:       #000000
Container border mobile: #e0e0e0
Pill FOMO:              #000000
Stelle:                 #facc15
Heading color:          #000000
Body color:             #000000
```

### Padding standard per tutte le sezioni PagePilot
```json
{
  "padding_top": 30, "padding_bottom": 30,
  "padding_top_mobile": 30, "padding_bottom_mobile": 30,
  "margin_top": 30, "margin_bottom": 30,
  "margin_top_mobile": 30, "margin_bottom_mobile": 30
}
```

---

## PARTE 3: TRADUZIONE (opzionale)

Per creare una versione in altra lingua:
1. Prendi il template JSON italiano completo
2. Estrai tutte le stringhe di testo (escludi colori, URL, tipi sezione, nomi layout, icone)
3. Traduci con GPT-4o mantenendo tono marketing persuasivo
4. Reinserisci le traduzioni nel JSON
5. Cambia `date_locale` (es: "de-DE" per tedesco)
6. Salva con suffisso lingua nel nome: `landing-xxxxx-DE`

---

## Output atteso
- `copyData` JSON con tutto il copy
- Template JSON Shopify pronto per upload
- Entrambi salvati in `service/.landing-state.json`

## File di riferimento
- `service/openai-analyzer.js` -> `generateCopy(productData, copyInstructions)`
- `service/template-generator.js` -> `generateLandingTemplate(productData, copyData)`
