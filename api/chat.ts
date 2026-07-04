import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK with custom User-Agent as requested by gemini-api skill
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Serverless: Gemini API Client initialized successfully.");
  } else {
    console.warn("Serverless: GEMINI_API_KEY is missing in environment variables.");
  }
} catch (error) {
  console.error("Serverless: Failed to initialize Gemini API client:", error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for serverless environment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { messages, userLanguage = "en" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Bespoke conversation context is required." });
  }

  // Fallback handler if Gemini SDK is not configured
  if (!ai) {
    console.warn("Serverless: Gemini Client is not initialized due to missing API key.");
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const responseText = userLanguage === "ar"
      ? `شكراً لتواصلك مع PGR ومقرنا في دبي. في الوقت الحالي، مساعد المنتجات وطلبات التسعير غير متصل مؤقتاً بالإنترنت. يرجى التواصل معنا مباشرة عبر الواتساب على 971559688837+ لتأكيد الأسعار وتفاصيل المنتجات.`
      : `Thank you for contacting PGR Precious Metals, Dubai. Our Product & Quote Assistant is currently offline. Please contact our support desk directly via WhatsApp at +971559688837 for instant product pricing and quote confirmations.`;
    
    return res.status(200).json({ text: responseText, isFallback: true });
  }

  try {
    // Compile previous message format for Gemini
    const recentMessages = messages.slice(-6);
    const systemPrompt = `You are the Lead Product & Quote Assistant for PGR UAE Precious Metals (pgruae.com), headquartered in Dubai, United Arab Emirates.
PGR UAE is an ultra-premium institution. We deal exclusively in physical Gold Bullion, Silver Bullion, Gold Coins, Silver Coins, and Wholesale Trading. 
Our target market consists of High-Net-Worth Individuals (HNWIs), institutional investors, corporate funds, and international wholesalers.

PGR UAE is a premium global wholesale trading house, partnered with world-famous authorized brands including PAMP Suisse, Valcambi, Metalor, Argor-Heraeus, Perth Mint, Royal Canadian Mint, and the Royal Mint. We are a trusted trading house and delivery partner, not a manufacturer.

CRITICAL COMPLIANCE RULES:
1. You MUST NOT give investment advice, financial advisory statements, guaranteed returns, or financial promises of any kind. 
2. You MUST NOT use terms like "guaranteed profit", "fixed returns", "investment guarantee", "risk-free", "insured investment".
3. You should only help with:
   * product details (purity, weight, brand, specs)
   * request quote (guiding them to the form)
   * WhatsApp contact (+971559688837)
   * delivery options (UAE and Iraq secured delivery)
   * price confirmation before payment (indicative reference pricing, confirmed before order settlement)

Core Tenets of PGR Assistant:
1. Brand & Tone: You speak with extreme elegance, professional composure, absolute integrity, and precision. You are sophisticated and prestigious, yet humble and helpful.
2. Dubai Advantage: Dubai is the 'City of Gold'. Inform clients that physical investment-grade gold bars (99.5%+ purity) are subject to 0% VAT in the UAE under local guidelines. UAE holds a major geopolitical and logistic advantage for secure transport.
3. Capabilities: We handle wholesale requests, secure shipping/courier handling, secure product storage options in Dubai, customs processing, and custom corporate orders.
4. Response Language: Match the user's language. If they query in Arabic, respond in immaculate, premium Gulf Arabic (الفصحى الراقية). If in English, use refined, elegant business English.
5. No fake data: We deal with real bullion transactions. If they ask to make a purchase, guide them to use our 'Request Quote' form or click 'WhatsApp Order' (+971559688837) to chat live with our desk.

Keep responses relatively concise (2-3 paragraphs), extremely elegant, well-structured, and formatted in clean Markdown.`;

    // Map conversation array to content parts
    const contents = recentMessages.map((msg: any) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        topP: 0.9,
      }
    });

    const outputText = response.text || "I apologize. I was unable to compile a product statement at this moment. Please connect with our Dubai office.";
    return res.status(200).json({ text: outputText });
  } catch (err: any) {
    console.error("Vercel Serverless AI Assistant generation error:", err);
    
    // Instead of breaking the UI with a 500 error, return a clean, polite message with HTTP 200
    const cleanErrorMsg = userLanguage === "ar"
      ? "شكراً لتواصلك مع PGR ومقرنا في دبي. نواجه حالياً ضغطاً في خدمات المساعد الرقمي. يرجى محاولة الاستعلام مجدداً بعد قليل أو التواصل معنا مباشرة عبر الواتساب على 971559688837+ لتأكيد الأسعار وتفاصيل المنتجات."
      : "Thank you for contacting PGR Precious Metals, Dubai. Our digital assistant is currently experiencing high demand. Please try again shortly or contact our trade desk directly via WhatsApp at +971559688837 for instant quote confirmations.";

    return res.status(200).json({ 
      text: cleanErrorMsg, 
      isFallback: true,
      error: err.message || String(err)
    });
  }
}
