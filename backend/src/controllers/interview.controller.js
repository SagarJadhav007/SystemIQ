import { buildAgent } from "../../agent.js";
import { checkpointer } from "../services/memory.js";
import { problems } from "../data/problems.js";
import { llm } from "../services/llm.js";
import parseGraph from "../services/graphparser.js";
import { extractTopicsFromGraph, extractTopicsFromText } from "../services/topicEngine.js";

const DEFAULT_PROBLEM = problems.chat_app;

export const agent = buildAgent(checkpointer);

export async function runAgent(socket, update) {
  try {
    const result = await agent.invoke(
      {
        ...update,
        problem: DEFAULT_PROBLEM,
      },
      {
        configurable: { thread_id: socket.id },
      }
    );

    const last = result.messages?.at(-1);

    if (!last?.content?.trim()) {
      console.warn("[runAgent] LLM returned empty response — skipping emit");
      return;
    }

    socket.emit("ai_question", last.content);
  } catch (err) {
    console.error("Agent error:", err);
    socket.emit("ai_error", "Something went wrong. Please try again.");
  }
}

/**
 * Proactive graph check — called when the user adds nodes to their diagram
 * but hasn't verbally explained them yet. Runs OUTSIDE the LangGraph agent
 * so it doesn't corrupt the message history with synthetic user turns.
 *
 * Uses a targeted system prompt focused purely on graph-vs-speech sync.
 */
export async function runGraphCheck(socket, { graph }) {
  if (!graph?.nodes?.length) return;

  const problem = DEFAULT_PROBLEM;

  // Retrieve current LangGraph state to know what's been explained verbally
  let currentState = null;
  try {
    currentState = await agent.getState({
      configurable: { thread_id: socket.id },
    });
  } catch (err) {
    console.warn("[runGraphCheck] Could not retrieve state:", err.message);
    return;
  }

  const state = currentState?.values;
  if (!state?.started) {
    // Interview hasn't started yet — don't probe
    return;
  }

  const parsedGraph = parseGraph(graph);
  const graphTopics = extractTopicsFromGraph(graph, problem);
  const topicsCovered = state.topicsCovered || {};

  // Find nodes that exist in the diagram but whose topic hasn't been verbally covered
  const drawnButUnexplained = graph.nodes.filter((node) => {
    const topic = problem.node_to_topic?.[node.type];
    if (!topic) return false; // unknown node type — skip
    return !topicsCovered[topic]; // drawn but not talked about
  });

  if (!drawnButUnexplained.length) {
    console.log("[runGraphCheck] No unexplained nodes — skipping proactive question");
    return;
  }

  // Pick the single most important unexplained node to ask about
  const target = drawnButUnexplained[0];
  const nodeLabel = getNodeLabel(target.type);

  // Get recent conversation context (last 6 messages) so the question feels natural
  const recentMessages = (state.messages || []).slice(-6).map((m) => ({
    role: m._getType?.() === "ai" ? "assistant" : "user",
    content: typeof m.content === "string" ? m.content : "",
  }));

  try {
    const response = await llm.invoke([
      {
        role: "system",
        content: `You are a Google system design INTERVIEWER. The candidate has added a "${nodeLabel}" to their diagram but has not verbally explained it yet.

YOUR ONLY JOB: Ask ONE short, sharp question about this specific node. Maximum 2 sentences.

Rules:
- Ask about the "${nodeLabel}" specifically — why it's there, what role it plays, or how it fits the design.
- Do NOT list other nodes or suggest what to design next.
- Do NOT say "I notice you added..." — just ask naturally as an interviewer would.
- If the conversation is mid-flow, make the question feel like a natural follow-up.

Diagram so far: Nodes: ${parsedGraph.components.join(", ")} | Connections: ${parsedGraph.connections.join(", ") || "none yet"}

Good examples:
- "Walk me through why you added the ${nodeLabel} — what problem does it solve here?"
- "You've got a ${nodeLabel} in your diagram — what's it handling in this design?"

Ask the question now. One question only.`,
      },
      ...recentMessages,
    ]);

    const content = response.content?.trim();
    if (!content) {
      console.warn("[runGraphCheck] Empty response from LLM");
      return;
    }

    console.log("[runGraphCheck] Proactive question about:", nodeLabel);

    // Inject this as an AI message into the LangGraph state so history stays consistent
    await agent.invoke(
      {
        messages: [{ role: "assistant", content }],
        // Don't touch lastUserText — we're not responding to a user turn
      },
      { configurable: { thread_id: socket.id } }
    );

    socket.emit("ai_question", content);
  } catch (err) {
    console.error("[runGraphCheck] LLM error:", err);
  }
}

function getNodeLabel(type) {
  const labels = {
    api: "API Gateway",
    db: "Database",
    cache: "Cache",
    lb: "Load Balancer",
    queue: "Message Queue",
    cdn: "CDN",
    websocket_server: "WebSocket Server",
    notification_service: "Notification Service",
  };
  return labels[type] || type;
}