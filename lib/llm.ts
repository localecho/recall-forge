// Single OpenRouter call, JSON-mode-by-convention (we ask for JSON-only and parse it).
// Isolated in one function so the demo has exactly one place to point at when explaining
// "here's the only line that talks to a model."

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.RECALL_FORGE_MODEL || "openai/gpt-4o-mini";

export async function callModelForJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Model did not return JSON: ${content.slice(0, 200)}`);
  }
  return JSON.parse(jsonMatch[0]) as T;
}
