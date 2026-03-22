import { llm } from "../services/llm.js";

export async function graphNode(state) {
  if (!state.graph) return {};

  const res = await llm.invoke(`
Analyze graph:

${JSON.stringify(state.graph)}

Return JSON:
{
  "issues": [],
  "missing": []
}
`);

  let parsed = {};
  try {
    parsed = JSON.parse(res.content);
  } catch {}

  return {
    graphAnalysis: parsed,
  };
}