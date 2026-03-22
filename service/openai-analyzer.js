import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeAliExpressProduct(url, copyInstructions = "") {
  const extractionResponse = await openai.responses.create({
    model: "gpt-4o",
    tools: [{ type: "web_search_preview" }],
    input: [
      {
        role: "user",
        content: `Analyze this AliExpress product page and extract ALL the following information in JSON format. Be thorough and accurate.

URL: ${url}

Return a JSON object with these fields:
{
  "title": "product title (clean, no store name)",
  "short_title": "short catchy title (3-5 words max)",
  "price": "price in USD",
  "original_price": "original/crossed out price if available",
  "currency": "USD",
  "images": ["array of all product image URLs"],
  "description": "full product description text",
  "features": ["array of key features/bullet points"],
  "specifications": {"key": "value pairs of product specs"},
  "category": "product category",
  "shipping_info": "shipping details if available",
  "seller_rating": "seller rating if available",
  "orders_count": "number of orders if visible",
  "review_summary": "summary of reviews if available",
  "variants": ["color/size options if available"],
  "material": "material info if available",
  "target_audience": "who this product is for"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.`,
      },
    ],
  });

  let productData;
  const outputText =
    extractionResponse.output_text || extractionResponse.choices?.[0]?.message?.content;
  try {
    const cleaned = outputText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    productData = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse product data from OpenAI: " + outputText?.slice(0, 200));
  }

  const copyResponse = await openai.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: `You are "Signora Market Copy" — a specialized direct-response copywriter focused on creating extremely high-converting landing pages for any type of offer: physical ecommerce products, digital products, services, subscriptions, lead generation, and info products.

You analyze product data and extract structural patterns, persuasive angles, emotional triggers, offer positioning, objection handling, and formatting logic.

You ALWAYS write in highly colloquial Italian, as if speaking to a middle-aged woman at a local market: simple, direct, concrete, persuasive, emotionally engaging, benefit-driven, and sharp. The tone NEVER becomes corporate, institutional, or academic, regardless of niche.

HEADLINE STRUCTURE: adjective + product/service name + primary function + strong added value. The tone must immediately capture attention and psychologically hook the reader.

SUBHEADLINES must reinforce the promise with specific mechanisms, numbers, outcomes, or concrete proof.

COPY RULES:
- Reduce cognitive load: short sentences, simple words, clear benefits
- Repetition of key outcomes
- Strong call to action with urgency
- Objection handling and persuasive reassurance
- Use negative reviews/objections to craft powerful headlines, mechanisms, differentiation, and objection-destroying sections
- All output must be long-form and structured to fully fill all necessary sections of a Shopify-style product landing page template
- Prioritize clarity, persuasion, psychological triggers, and conversion optimization above creativity
- No generic copy ever

${copyInstructions ? `ISTRUZIONI AGGIUNTIVE DALL'UTENTE:\n${copyInstructions}\n\nSegui queste istruzioni con precisione.` : ""}`,
      },
      {
        role: "user",
        content: `Basandoti su questi dati prodotto, genera TUTTO il copy necessario per una landing page Shopify ad alta conversione. Scrivi in italiano colloquiale, stile "Signora al mercato" — persuasivo, diretto, concreto.

DATI PRODOTTO:
${JSON.stringify(productData, null, 2)}

Genera un oggetto JSON con questi campi (TUTTO IN ITALIANO):
{
  "hero_headline": "Headline principale (potente, benefit-driven, usa <strong> per enfasi). Struttura: aggettivo + nome prodotto + funzione primaria + valore aggiunto forte",
  "hero_subheadline": "Sub-headline che rinforza la promessa con meccanismo specifico, numeri, risultati concreti",
  "hero_caption": "Caption breve/tagline sopra o sotto la headline",
  "product_description_html": "Descrizione prodotto HTML ricca e lunga per la sezione prodotto principale. Deve includere: agitazione del problema, soluzione, meccanismo, benefici concreti, prova sociale, stack dell'offerta, garanzia. Usa <p>, <strong>, <br/> per formattare. Deve essere LUNGA e persuasiva.",
  "benefit_cards": [
    {"title": "Titolo Beneficio", "description": "Descrizione beneficio 2-3 frasi, concreta e emotiva"},
    {"title": "Titolo Beneficio", "description": "Descrizione beneficio 2-3 frasi"},
    {"title": "Titolo Beneficio", "description": "Descrizione beneficio 2-3 frasi"},
    {"title": "Titolo Beneficio", "description": "Descrizione beneficio 2-3 frasi"},
    {"title": "Titolo Beneficio", "description": "Descrizione beneficio 2-3 frasi"},
    {"title": "Titolo Beneficio", "description": "Descrizione beneficio 2-3 frasi"}
  ],
  "feature_rows": [
    {"heading": "Titolo feature persuasivo", "text": "Paragrafo lungo che spiega il beneficio, agita il problema e posiziona la soluzione"},
    {"heading": "Titolo feature", "text": "Paragrafo descrittivo lungo"},
    {"heading": "Titolo feature", "text": "Paragrafo descrittivo lungo"},
    {"heading": "Titolo feature", "text": "Paragrafo descrittivo lungo"},
    {"heading": "Titolo feature", "text": "Paragrafo descrittivo lungo"}
  ],
  "comparison_rows": [
    {"benefit": "Punto di confronto (noi vs altri)", "us": true, "them": false},
    {"benefit": "Punto di confronto", "us": true, "them": false},
    {"benefit": "Punto di confronto", "us": true, "them": false},
    {"benefit": "Punto di confronto", "us": true, "them": true},
    {"benefit": "Punto di confronto", "us": true, "them": false},
    {"benefit": "Punto di confronto", "us": true, "them": false}
  ],
  "scrolling_text": "Testo breve e accattivante per il marquee scorrevole (es: ((Offerta Limitata)) [Ordina Ora] Prima Che Finisca)",
  "faq_items": [
    {"question": "Domanda FAQ che distrugge un'obiezione", "answer": "Risposta persuasiva che rassicura e spinge all'acquisto"},
    {"question": "Domanda FAQ", "answer": "Risposta"},
    {"question": "Domanda FAQ", "answer": "Risposta"},
    {"question": "Domanda FAQ", "answer": "Risposta"},
    {"question": "Domanda FAQ", "answer": "Risposta"}
  ],
  "reviews": [
    {"name": "Nome italiano L.", "date": "Mese Anno", "title": "Titolo recensione entusiasta", "text": "Testo recensione realistica in italiano, 2-3 frasi, come scriverebbe una persona vera", "rating": 5},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "Testo recensione", "rating": 5},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "Testo recensione", "rating": 5},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "Testo recensione", "rating": 4},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "Testo recensione", "rating": 5}
  ],
  "cta_text": "Testo call-to-action bottone (breve, urgente, in italiano)",
  "urgency_text": "Testo urgenza/scarsita (es: Ultimi pezzi disponibili - Offerta valida solo oggi!)",
  "seo_title": "Titolo SEO ottimizzato in italiano",
  "seo_description": "Meta description SEO in italiano"
}

Il copy deve essere LUNGO, persuasivo, emotivo, con trigger psicologici. Zero copy generico. Ogni sezione deve vendere.
IMPORTANT: Return ONLY valid JSON, no markdown.`,
      },
    ],
  });

  let copyData;
  const copyText =
    copyResponse.output_text || copyResponse.choices?.[0]?.message?.content;
  try {
    const cleaned = copyText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    copyData = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse copy data from OpenAI: " + copyText?.slice(0, 200));
  }

  return { productData, copyData };
}
