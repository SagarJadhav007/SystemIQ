import { buildAgent } from "../../agent.js";
import { checkpointer } from "../services/memory.js";
import { problems } from "../data/problems.js";

const DEFAULT_PROBLEM = problems.chat_app;

const agent = buildAgent(checkpointer);

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

    if (last) {
      socket.emit("ai_question", last.content);
    }
  } catch (err) {
    console.error("Agent error:", err);
    socket.emit("ai_error", "Something went wrong. Please try again.");
  }
}