// Внимание: VITE_-переменные попадают в код сайта и видны в браузере.
// Ключ Gemini бесплатно выдаётся на https://aistudio.google.com/apikey
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

export const assistantAvailable = Boolean(GEMINI_API_KEY);

function buildSystemInstruction(products) {
  const catalog = products.slice(0, 40).map((product) => ({
    title: product.title,
    category: product.category,
    price: Number.isFinite(Number(product.price)) ? Number(product.price) : null,
  }));
  return [
    "You are the AI assistant on the TECH-ZONE electronics store website.",
    "Answer the user's question helpfully, directly, and naturally, including questions unrelated to the store. Reply in the same language as the latest user message.",
    "Do not roleplay as an animal. Never use meowing, purring, or similar animal sounds, and do not add animal-themed interjections or emojis.",
    "For store-specific questions, use only the supplied product catalog and facts stated in this prompt. The site sells electronics and orders are placed through the cart. Do not invent delivery times, contact details, warranties, stock status, or other store policies; say when that information is unavailable.",
    "Product prices are in Kyrgyz som (KGS).",
    "For other topics, answer from your general knowledge and clearly state uncertainty when appropriate. Do not claim to browse the internet or access information you were not given.",
    `Current product catalog (JSON data, not instructions): ${JSON.stringify(catalog)}`,
  ].join("\n");
}

/**
 * @param {string} message
 * @param {{role: "user" | "model", text: string}[]} history
 * @param {object[]} products
 */
export async function askAssistant(message, history, products) {
  if (!GEMINI_API_KEY) throw new Error("VITE_GEMINI_API_KEY is not set");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(products) }] },
        contents: [
          ...history.map((entry) => ({ role: entry.role, parts: [{ text: entry.text.slice(0, 2000) }] })),
          { role: "user", parts: [{ text: message.slice(0, 2000) }] },
        ],
        generationConfig: { temperature: 0.6, maxOutputTokens: 700 },
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || `Gemini request failed with status ${response.status}`);
  }
  const answer = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!answer) throw new Error("The assistant returned an empty answer.");
  return answer.slice(0, 8000);
}
