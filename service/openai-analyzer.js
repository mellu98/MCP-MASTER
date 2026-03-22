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
- Prioritize clarity, persuasion, psychological triggers, and conversion optimization above creativity
- No generic copy ever

LUNGHEZZA COPY — Rispetta queste lunghezze dalla landing page di riferimento:
- Hero headline: 5-8 parole con <strong>, es: "<strong>Impara a Fare Vendite in Dropshipping</strong>"
- Hero subheadline: 3-6 parole, es: "<strong>[In Soli 7 Giorni]</strong>"
- Hero caption: 5-10 parole, es: "Presentazione del nuovo prodotto rivoluzionario"
- Product description: 2-3 frasi in un <p>, conciso ma persuasivo
- Benefit cards title: 2-4 parole max (es: "Spedizione Veloce")
- Benefit cards description: 1-2 frasi brevi (max 120 caratteri)
- Feature rows heading: 3-5 parole (es: "Esperienza Mobile Superiore")
- Feature rows text: 2-3 frasi in un paragrafo (max 200 caratteri)
- Comparison rows benefit: frase breve 3-6 parole (es: "Ottimizzato per le conversioni")
- Scrolling text: 5-10 parole (es: "Ordina il tuo ((fantastico)) prodotto [Ora]")
- FAQ domanda: 1 frase breve e diretta
- FAQ risposta: 2-3 frasi max
- Reviews text: 1-2 frasi come scriverebbe una persona vera
- CTA text: 2-4 parole (es: "Ordina Ora")
- Urgency text: 1 frase breve

${copyInstructions ? `ISTRUZIONI AGGIUNTIVE DALL'UTENTE:\n${copyInstructions}\n\nSegui queste istruzioni con precisione.` : ""}`,
      },
      {
        role: "user",
        content: `Basandoti su questi dati prodotto, genera TUTTO il copy necessario per una landing page Shopify ad alta conversione. Scrivi in italiano colloquiale, stile "Signora al mercato" — persuasivo, diretto, concreto. Rispetta le lunghezze indicate nelle regole.

DATI PRODOTTO:
${JSON.stringify(productData, null, 2)}

Genera un oggetto JSON con questi campi (TUTTO IN ITALIANO):
{
  "hero_headline": "<strong>Aggettivo + Nome Prodotto + Funzione</strong> (5-8 parole)",
  "hero_subheadline": "<strong>[Valore Aggiunto Forte]</strong> (3-6 parole)",
  "hero_caption": "Tagline breve 5-10 parole",
  "product_description_html": "<p>2-3 frasi concise e persuasive con <strong> per enfasi</p>",
  "benefit_cards": [
    {"title": "2-4 parole", "description": "1-2 frasi brevi max 120 caratteri"},
    {"title": "2-4 parole", "description": "1-2 frasi brevi"},
    {"title": "2-4 parole", "description": "1-2 frasi brevi"},
    {"title": "2-4 parole", "description": "1-2 frasi brevi"},
    {"title": "2-4 parole", "description": "1-2 frasi brevi"},
    {"title": "2-4 parole", "description": "1-2 frasi brevi"}
  ],
  "feature_rows": [
    {"heading": "3-5 parole", "text": "2-3 frasi max 200 caratteri"},
    {"heading": "3-5 parole", "text": "2-3 frasi"},
    {"heading": "3-5 parole", "text": "2-3 frasi"},
    {"heading": "3-5 parole", "text": "2-3 frasi"},
    {"heading": "3-5 parole", "text": "2-3 frasi"}
  ],
  "comparison_rows": [
    {"benefit": "Frase breve 3-6 parole", "us": true, "them": false},
    {"benefit": "Frase breve", "us": true, "them": false},
    {"benefit": "Frase breve", "us": true, "them": false},
    {"benefit": "Frase breve", "us": true, "them": true},
    {"benefit": "Frase breve", "us": true, "them": false},
    {"benefit": "Frase breve", "us": true, "them": false}
  ],
  "scrolling_text": "5-10 parole accattivanti",
  "faq_items": [
    {"question": "Domanda breve e diretta", "answer": "Risposta 2-3 frasi max"},
    {"question": "Domanda", "answer": "Risposta"},
    {"question": "Domanda", "answer": "Risposta"}
  ],
  "reviews": [
    {"name": "Nome italiano L.", "date": "Mese Anno", "title": "Titolo breve", "text": "1-2 frasi realistiche", "rating": 5},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "1-2 frasi", "rating": 5},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "1-2 frasi", "rating": 5},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "1-2 frasi", "rating": 4},
    {"name": "Nome L.", "date": "Mese Anno", "title": "Titolo", "text": "1-2 frasi", "rating": 5}
  ],
  "cta_text": "2-4 parole (es: Ordina Ora)",
  "urgency_text": "1 frase breve di urgenza",
  "seo_title": "Titolo SEO in italiano",
  "seo_description": "Meta description SEO in italiano"
}

Copy conciso ma persuasivo. Zero copy generico. Ogni parola deve vendere.
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
