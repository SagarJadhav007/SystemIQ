import { llm } from "../services/llm.js";

export async function orchestratorNode(state) {
  const conversation = state.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const res = await llm.invoke(`
You are a FAANG-level system design interviewer.

STRICT RULES:
- You NEVER give full answers
- You ONLY ask questions
- You guide the candidate step-by-step
- You interrupt if needed
- You focus on weak areas
- You ask ONE question at a time
- Keep it SHORT (1-2 lines max)

If user asks a question:
- Answer VERY briefly (1 line hint)
- Then ask a follow-up question

-------------------------

Conversation:
${conversation}

User Analysis:
${JSON.stringify(state.inputAnalysis)}

Graph Analysis:
${JSON.stringify(state.graphAnalysis)}

-------------------------

Your job:
Decide the BEST next question to ask.

Return ONLY the question.
`);

  return {
    messages: [
      {
        role: "assistant",
        content: res.content,
      },
    ],
  };
}
