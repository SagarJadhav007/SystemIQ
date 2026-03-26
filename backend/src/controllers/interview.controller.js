import { buildAgent } from "../../agent.js";
import { checkpointer } from "../services/memory.js";
import { problems } from "../data/problems.js";

const DEFAULT_PROBLEM = problems.chat_app;

const agent = buildAgent(checkpointer);

export async function handleStartInterview(socket) {
  const result = await agent.invoke(
    {
      problem: DEFAULT_PROBLEM,
      messages: [],
      stage: "start",
      started: false,
    },
    {
      configurable: { thread_id: socket.id },
    },
  );

  const last = result.messages.at(-1);
  socket.emit("ai_question", last.content);
}

export async function handleUserMessage(socket, text) {
  const result = await agent.invoke(
    {
      problem: DEFAULT_PROBLEM, // ✅ FORCE inject
      messages: [{ role: "user", content: text }],
    },
    {
      configurable: { thread_id: socket.id },
    },
  );

  const last = result.messages.at(-1);
  socket.emit("ai_question", last.content);
}

export async function runAgent(socket, update) {
  const result = await agent.invoke(
    {
      ...update,
      problem: DEFAULT_PROBLEM,
    },
    {
      configurable: { thread_id: socket.id },
    },
  );

  const last = result.messages?.at(-1);

  if (last) {
    socket.emit("ai_question", last.content);
  }
}
