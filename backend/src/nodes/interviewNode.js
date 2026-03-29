import { AIMessage } from "@langchain/core/messages";
import { llm } from "../services/llm.js";
import {
  extractTopicsFromText,
  extractTopicsFromGraph,
  updateTopicsCovered,
} from "../services/topicEngine.js";
import parseGraph from "../services/graphparser.js";

const WRAPUP_TRIGGERS = ["wrap up", "wrapup", "done", "finish", "end interview", "that's all", "thats all"];
const INTERVIEW_MAX_MS = 35 * 60 * 1000;

export async function interviewNode(state) {
  const now = Date.now();
  const { problem, started, lastUserText, graph, messages, topicsCovered, interviewStartTime } = state;

  console.log("[interviewNode] started:", started, "| lastUserText:", lastUserText?.slice(0, 60));

  // ── 1. GREETING — only fires when started is explicitly false ───────────
  if (!started) {
    console.log("[interviewNode] → sending greeting");
    return {
      started: true,
      interviewStartTime: now,
      lastAIActivity: now,
      messages: [
        new AIMessage(
          `Hi! Let's get started.\n\n**Problem: ${problem.title}**\n\n${problem.description}\n\nTake your time — walk me through your thinking whenever you're ready.`
        ),
      ],
    };
  }

  // ── GUARD — no user text means nothing to respond to ────────────────────
  if (!lastUserText?.trim()) {
    console.log("[interviewNode] → no user text, skipping LLM");
    return {};
  }

  // ── 2. WRAP-UP ───────────────────────────────────────────────────────────
  const isWrapupByUser = WRAPUP_TRIGGERS.some((t) => lastUserText?.toLowerCase().includes(t));
  const isWrapupByTime = interviewStartTime && now - interviewStartTime > INTERVIEW_MAX_MS;

  if (isWrapupByUser || isWrapupByTime) {
    return await runWrapup(state, messages, graph, problem, topicsCovered, now);
  }

  // ── 3. SILENT TOPIC TRACKER ──────────────────────────────────────────────
  const updatedTopics = updateTopicsCovered(topicsCovered, lastUserText, graph, problem);

  // ── 4. GRAPH ↔ SPEECH SYNC ──────────────────────────────────────────────
  const graphTopics = extractTopicsFromGraph(graph, problem);
  const textTopics = extractTopicsFromText(lastUserText, problem);
  const mentionedButNotDrawn = textTopics.filter((t) => !graphTopics.includes(t));
  const drawnButNotExplained = graphTopics.filter((t) => !textTopics.includes(t));
  const parsedGraph = graph?.nodes?.length ? parseGraph(graph) : null;

  // ── 5. OPEN FLOW — LLM decides what to ask ──────────────────────────────
  const systemPrompt = buildSystemPrompt(problem, updatedTopics, parsedGraph, mentionedButNotDrawn, drawnButNotExplained);

  // Build conversation: full history + current user turn as final message
  // This ensures the LLM always has the latest candidate input to respond to
  const historyMessages = messages.map((m) => ({
    role: m._getType?.() === "ai" ? "assistant" : "user",
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  }));

  // Ensure the very last message is the candidate's current input
  const lastIsUser = historyMessages.at(-1)?.role === "user";
  if (!lastIsUser && lastUserText?.trim()) {
    historyMessages.push({ role: "user", content: lastUserText });
  }

  console.log("[interviewNode] → calling LLM | msgs:", historyMessages.length, "| lastUserText:", lastUserText?.slice(0, 60));

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    ...historyMessages,
  ]);

  return {
    topicsCovered: updatedTopics,
    lastAIActivity: now,
    messages: [new AIMessage(response.content)],
  };
}

function buildSystemPrompt(problem, topicsCovered, parsedGraph, mentionedButNotDrawn, drawnButNotExplained) {
  const coveredList =
    Object.entries(topicsCovered || {})
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ") || "nothing yet";

  const graphSummary = parsedGraph
    ? `Nodes: ${parsedGraph.components.join(", ") || "none"} | Connections: ${parsedGraph.connections.join(", ") || "none"}`
    : "No diagram yet.";

  const syncIssues = [
    mentionedButNotDrawn.length > 0
      ? `Candidate mentioned verbally but NOT in diagram: ${mentionedButNotDrawn.join(", ")}`
      : null,
    drawnButNotExplained.length > 0
      ? `Candidate drew but has NOT explained: ${drawnButNotExplained.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are an INTERVIEWER at Google. You are conducting a system design interview.

YOUR ROLE: You ask short, sharp questions. You do NOT answer them. You do NOT design the system. The CANDIDATE designs it.

ABSOLUTE RULES:
1. You speak as the INTERVIEWER only. Never speak as the candidate.
2. Never say "I would use...", "I've drawn...", "I have these components..." — that is the candidate's job.
3. Never list components, draw diagrams, or explain architecture yourself.
4. Ask ONE question at a time. Maximum 2 sentences total.
5. If the candidate's last message was short (under 12 words) or trailing off, reply ONLY: "Go on."
6. Never tell the candidate what stage to cover next (no "let's discuss requirements" or "now do HLD").
7. If the candidate mentions something verbally not in their diagram, ask: "You mentioned [X] — is that in your diagram?"
8. If the candidate drew a node but hasn't explained it, ask: "Walk me through why you added [node]."
9. If an answer is vague, push back: "Why [X] specifically, rather than [alternative]?"

CONTEXT:
Problem: ${problem.title} — ${problem.description}
Diagram so far: ${graphSummary}
Topics candidate has touched: ${coveredList}
${syncIssues ? `Sync issues to probe: ${syncIssues}` : ""}

EXAMPLES OF CORRECT INTERVIEWER RESPONSES:
- Candidate: "I'd use a load balancer" → You: "What are you distributing load across, and why not DNS-based routing?"
- Candidate: "I need a database" → You: "SQL or NoSQL — and what's driving that choice for this use case?"
- Candidate: "so I was thinking about" → You: "Go on."
- Candidate draws Cache node but says nothing → You: "Walk me through why you added that cache."
- Candidate: "I'll handle scale with caching" → You: "What specifically are you caching, and what's your eviction policy?"

EXAMPLES OF WRONG RESPONSES (NEVER DO THIS):
- "I've drawn a high-level diagram with the following components: ..." ← WRONG, that's the candidate's job
- "Let's move on to the database layer" ← WRONG, never direct the flow
- "You should use Cassandra because..." ← WRONG, never give answers
- "Great approach! Now let's discuss..." ← WRONG, do not compliment and redirect

Now respond to the candidate's last message. One question only.`;
}

async function runWrapup(state, messages, graph, problem, topicsCovered, now) {
  const parsedGraph = graph?.nodes?.length ? parseGraph(graph) : null;

  const transcript = messages
    .map((m) => {
      const role = m._getType?.() === "ai" ? "Interviewer" : "Candidate";
      return `${role}: ${typeof m.content === "string" ? m.content : ""}`;
    })
    .join("\n");

  const graphSummary = parsedGraph
    ? `Nodes: ${parsedGraph.components.join(", ")} | Connections: ${parsedGraph.connections.join(", ")}`
    : "No diagram submitted.";

  const coveredSummary = Object.entries(topicsCovered || {})
    .map(([k, v]) => `${k}: ${v ? "✅ covered" : "❌ missed"}`)
    .join("\n");

  const response = await llm.invoke([
    {
      role: "system",
      content: `You are a senior staff engineer at Google. The system design interview has ended.
Generate a structured evaluation.

Problem: ${problem.title}
Topics coverage:\n${coveredSummary}
Final diagram: ${graphSummary}
Full transcript:\n${transcript}

Respond in this exact format:

**Overall Signal**: [Strong Hire / Hire / No Hire]

**Requirements Gathering**: Did the candidate clarify scope and scale before designing? One-line verdict with evidence.

**Design Coverage**: For each topic (real_time, components, scaling, db_schema, tradeoffs, offline_handling) — Covered / Partial / Missed with one sentence.

**Diagram vs Explanation**: Did their diagram match what they said verbally?

**2 Strongest Points**: Specific, citing what they actually said or drew.

**2 Biggest Gaps**: Direct. If they never clarified requirements, say it.

**One Thing to Work On**: Single most impactful advice for their next interview.`,
    },
    { role: "user", content: "Give me my evaluation." },
  ]);

  return {
    lastAIActivity: now,
    messages: [new AIMessage(`Thanks for walking me through your design. Here's your feedback:\n\n${response.content}`)],
  };
}