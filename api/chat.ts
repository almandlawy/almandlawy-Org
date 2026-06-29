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
    console.warn("Serverless: Gemini Client is not initialized — GEMINI_API_KEY missing.");
    const lastUserMsg = (messages[messages.length - 1]?.content || "").toLowerCase();

    if (userLanguage === "ar") {
      if (lastUserMsg.includes("ضريبة") && (lastUserMsg.includes("ذهب") || lastUserMsg.includes("سبائك"))) {
        return res.status(200).json({
          text: "قد تختلف المعاملة الضريبية حسب نوع المنتج، حالة العميل، طريقة التسليم، والأنظمة المطبقة في دولة الإمارات. سيتم توضيح أي ضريبة أو رسوم ضمن عرض السعر النهائي قبل المتابعة.",
          isFallback: true,
        });
      }
      if (lastUserMsg.includes("إعادة الشراء") || lastUserMsg.includes("تضمنون")) {
        return res.status(200).json({
          text: "لا تقدم PGR UAE ضماناً لإعادة الشراء. يمكنك تقديم طلب عرض سعر لإعادة البيع (Request Sell-Back Quote)، وتخضع أي عملية لتحقق المنتج، فحوصات الامتثال، ظروف السوق، الرسوم، وتأكيد المكتب النهائي.",
          isFallback: true,
        });
      }
      return res.status(200).json({
        text: `شكراً لتواصلك مع PGR UAE. مساعد المنتجات وطلبات التسعير غير متصل حالياً. يرجى التواصل معنا عبر واتساب: +971559688837 لطلب عرض سعر مؤكد.`,
        isFallback: true,
      });
    }

    if (lastUserMsg.includes("buyback") || lastUserMsg.includes("guarantee")) {
      return res.status(200).json({
        text: "PGR UAE does not guarantee buyback. You may request a sell-back quote, subject to product verification, compliance checks, market conditions, fees, and final desk confirmation.",
        isFallback: true,
      });
    }

    return res.status(200).json({
      text: `Thank you for contacting PGR UAE. Our Product & Quote Assistant is currently offline. Please contact us on WhatsApp at +971559688837 to request a firm quote.`,
      isFallback: true,
    });
  }

  try {
    // Compile previous message format for Gemini
    const recentMessages = messages.slice(-6);
    const systemPrompt = `You are the Lead Product & Quote Assistant for PGR UAE Precious Metals & Bullion Quote Desk (pgruae.com), headquartered in Dubai, United Arab Emirates.
PGR UAE is a Physical Bullion Quote & Purchase Desk. We deal exclusively in physical Gold Bullion, Silver Bullion, Gold Coins, and Silver Coins.

PGR UAE is partnered with world-famous authorized brands including PAMP Suisse, Valcambi, Metalor, Argor-Heraeus, Perth Mint, Royal Canadian Mint, and the Royal Mint. We are a trusted bullion desk and delivery partner, not a manufacturer.

CRITICAL COMPLIANCE RULES:
1. You MUST NOT give investment advice, financial advisory statements, guaranteed returns, or financial promises of any kind.
2. You MUST NOT use terms like "trading platform", "trading application", "trading desk", "wallet", "cash balance", "investment account", "portfolio", "guaranteed profit", "fixed returns", "instant buy/sell", or "instant cash out".
3. Use only: Physical Bullion Quote & Purchase Desk, Request Firm Quote, Indicative Market Price, Final Desk Confirmation, Request Sell-Back Quote.
4. For VAT questions in Arabic: explain that tax treatment varies by product type, client status, delivery method, and UAE regulations. Final taxes/fees are confirmed in the firm quote before proceeding.
5. For buyback questions: PGR UAE does NOT guarantee buyback. Customers may request a sell-back quote subject to verification, compliance, market conditions, fees, and final desk confirmation.
6. Guide users to the Request Firm Quote form or WhatsApp (+971559688837).

Core Tenets:
1. Brand & Tone: Professional, elegant, precise, and helpful.
2. Dubai Advantage: Physical investment-grade gold bars (99.5%+ purity) may be subject to 0% VAT in the UAE under applicable guidelines — always note final terms are confirmed in the firm quote.
3. Capabilities: Quote requests, delivery, office collection, allocated storage requests, sell-back quote requests.
4. Response Language: Match the user's language with premium Gulf Arabic or refined business English.
5. Keep responses concise (2-3 paragraphs), well-structured Markdown.`;

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
