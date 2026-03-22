import { llm } from "../services/llm.js";

export async function inputNode(state) {
  const lastMessage = state.messages.at(-1)?.content;

  if (!lastMessage) return {};

  const res = await llm.invoke(`
Analyze input:

"${lastMessage}"

Return JSON:
{
  "intent": "...",
  "components": [],
  "missing": [],
  "isQuestion": true/false
}
`);

  let parsed = {};
  try {
    parsed = JSON.parse(res.content);
  } catch {}

  return {
    inputAnalysis: parsed,
  };
}