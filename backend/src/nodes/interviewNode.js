import { llm } from "../services/llm.js";
import {
  extractTopicsFromText,
  extractTopicsFromGraph,
} from "../services/topicEngine.js";

export async function interviewNode(state) {
  const now = Date.now();

  const {
    problem,
    stage,
    started,
    lastUserText,
    lastUserActivity,
    lastAIActivity,
    graph,
  } = state;

  const textTopics = extractTopicsFromText(lastUserText, problem);
  const graphTopics = extractTopicsFromGraph(graph, problem);

  // mismatch detection
  const missingInGraph = textTopics.filter((t) => !graphTopics.includes(t));
  const unexplainedInGraph = graphTopics.filter((t) => !textTopics.includes(t));

  // -------------------------
  // 1. GREETING
  // -------------------------
  if (!started) {
    return {
      started: true,
      stage: "wait_ready",
      readyAskedCount: 0,
      lastAIActivity: now,
      messages: [
        {
          role: "assistant",
          content: `Hi, let's begin your system design interview.

Problem: ${problem.title}

${problem.description}

Are you ready to start?`,
        },
      ],
    };
  }

  // -------------------------
  // 2. WAIT READY
  // -------------------------
  if (stage === "wait_ready") {
    const text = lastUserText?.toLowerCase() || "";

    if (text.includes("yes") || text.includes("ready")) {
      return {
        stage: "requirements",
        lastAIActivity: now,
        messages: [
          {
            role: "assistant",
            content:
              "Great. What requirements or assumptions would you clarify?",
          },
        ],
      };
    }

    if (now - (lastAIActivity || 0) > 3000) {
      return {
        stage: "requirements",
        lastAIActivity: now,
        messages: [
          {
            role: "assistant",
            content: "Let's proceed. Start with requirements or assumptions.",
          },
        ],
      };
    }

    return {};
  }

  // -------------------------
  // 3. REQUIREMENTS
  // -------------------------
  if (stage === "requirements") {
    if (lastUserText) {
      return {
        stage: "hld",
        lastAIActivity: now,
        messages: [
          {
            role: "assistant",
            content:
              "Good. Now design the high-level architecture. You can also draw it.",
          },
        ],
      };
    }
  }

  // -------------------------
  // 4. HLD (MONITOR MODE)
  // -------------------------
  if (stage === "hld") {
    if (now - (lastUserActivity || 0) < 2000) return {};

    // 🔥 user talking but not drawing
    if (missingInGraph.length >= 2) {
      return {
        lastAIActivity: now,
        messages: [
          {
            role: "assistant",
            content:
              "You're mentioning components not present in your diagram. Can you add them?",
          },
        ],
      };
    }

    // 🔥 user drawing but not explaining
    if (unexplainedInGraph.length >= 2) {
      return {
        lastAIActivity: now,
        messages: [
          {
            role: "assistant",
            content: "Can you walk me through the components you've added?",
          },
        ],
      };
    }

    if (lastUserText && lastUserText.length < 20) {
      return await askLLM(state, "clarify");
    }

    if (lastUserText && lastUserText.length > 50) {
      return {
        stage: "lld",
        lastAIActivity: now,
        messages: [
          {
            role: "assistant",
            content:
              "Good. Let's dive deeper into storage, ordering, and scaling.",
          },
        ],
      };
    }

    return {};
  }

  // -------------------------
  // 5. LLD
  // -------------------------
  if (stage === "lld") {
    if (now - (lastUserActivity || 0) < 2000) return {};

    return await askLLM(state, "deep_dive");
  }

  // -------------------------
  // 6. WRAP
  // -------------------------
  if (stage === "wrap_up") {
    return {
      messages: [
        {
          role: "assistant",
          content:
            "Great discussion. Thank you. Your results will be generated shortly.",
        },
      ],
    };
  }

  return {};
}

// -------------------------
// LLM HELPER
// -------------------------
async function askLLM(state, reason) {
  const res = await llm.invoke([
    {
      role: "system",
      content: `
You are a FAANG system design interviewer.

Problem: ${state.problem.title}

Reason: ${reason}

Rules:
- Ask ONE sharp question
- Do NOT explain answers
- Keep it short
- Focus on depth
`,
    },
    ...state.messages,
  ]);

  return {
    messages: [res],
  };
}
