import { llm } from "../services/llm.js";

export async function interviewNode(state) {
  const { problem, stage = "start", messages = [] } = state;

  // 🔥 First message (start interview)
  if (!state.started) {
    return {
      started: true,
      stage: "greeting",
      messages: [
        {
          role: "assistant",
          content: `Hi, let's start the system design interview.

Problem: ${problem.title}

${problem.description}

Are you ready to begin?`
        }
      ]
    };
  }

  const conversation = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const res = await llm.invoke([
    {
      role: "system",
      content: `
You are a FAANG system design interviewer.

Problem:
${problem.title}

Core Components:
${problem.core.join(", ")}

Deep Dive Topics:
${problem.deep_dive.join(", ")}

Current Stage: ${stage}

Interview Flow Rules:
- Start with high-level design
- Then go deeper
- Then scaling
- Then wrap up
- Ask ONE question at a time
- NEVER give full answers
- Be sharp and concise

Stage Logic:
- greeting → ask first high-level question
- high_level → ask architecture questions
- deep_dive → ask DB, scaling
- wrap_up → conclude

DO NOT ask generic questions.
DO NOT restart interview.
      `
    },
    ...messages
  ]);

  return {
    messages: [res],
    stage: nextStage(stage, messages),
  };
}

// simple stage progression
function nextStage(stage, messages) {
  if (messages.length < 3) return "high_level";
  if (messages.length < 8) return "deep_dive";
  if (messages.length < 12) return "optimization";
  return "wrap_up";
}