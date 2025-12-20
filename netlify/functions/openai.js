// netlify/functions/openai.js
// Netlify Functions (Node 18+) - OpenAI proxy
// Environment variables (Netlify UI -> Site settings -> Environment variables):
// - OPENAI_API_KEY=...
// Optional:
// - OPENAI_MODEL=gpt-5.2

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing on server" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const body = await request.json().catch(() => ({}));
  const userText = body.userText || "";
  const toolMode = body.toolMode || "chat";
  const model = process.env.OPENAI_MODEL || body.model || "gpt-5.2";

  // Basit tool promptları (istersen daha sonra iyileştiririz)
  const instructionsMap = {
    chat: "You are a friendly English conversation partner. Keep replies concise and encouraging.",
    interview: "You are an interviewer. Ask one question at a time and give short feedback.",
    grammar: "You are a grammar fixer. Correct the user's text and explain briefly.",
    tutor: "You are a language tutor. Explain clearly with examples."
  };

  const instructions = instructionsMap[toolMode] || instructionsMap.chat;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions,
      input: userText
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return new Response(JSON.stringify({ error: data }), {
      status: res.status,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Responses API: output_text alanı genelde hazır olur
  const text = data.output_text || (data.output?.[0]?.content?.[0]?.text ?? "");
  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
