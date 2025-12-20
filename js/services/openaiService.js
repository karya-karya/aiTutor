// js/services/openaiService.js
import { OPENAI_PROXY_URL, OPENAI_MODEL } from "../config/env.js";

// Önerilen kullanım: OPENAI_PROXY_URL (Netlify Function) üzerinden çağır.
// Çünkü OpenAI API key tarayıcıya koymak güvenli değil.
// (OpenAI docs: API key secret, client-side'a koyma.)
export async function callOpenAI({ toolMode, userText }) {
  const payload = {
    toolMode,
    userText,
    model: OPENAI_MODEL
  };

  // Proxy varsa onu kullan
  if (OPENAI_PROXY_URL) {
    const res = await fetch(OPENAI_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI proxy error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data.text ?? "No response.";
  }

  throw new Error("OPENAI_PROXY_URL tanımlı değil.");
}
