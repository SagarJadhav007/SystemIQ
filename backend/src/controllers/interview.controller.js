import { buildAgent } from "../../agent.js";
import { checkpointer } from "../services/memory.js";
import { loadKnowledge } from "../services/knowledgeLoader.js";

export const agent = buildAgent(checkpointer);

const knowledge = loadKnowledge("chat_app");

/**
 * Runs one interview turn.
 */
export async function runAgent(socket, update) {

  try {

    const result = await agent.invoke(

      {

        knowledge,

        candidate: {

          latestMessage: update.lastUserText ?? null,

        },

        graph: update.graph ?? null,

      },

      {

        configurable: {

          thread_id: socket.id,

        },

      }

    );

    console.log("\n========== FINAL STATE ==========\n");

    console.dir(result, {

      depth: null,

      colors: true,

    });

    console.log("\n=================================\n");

    const lastMessage = result.messages?.at(-1);

    console.log("Last message:", lastMessage);

    if (!lastMessage?.content) {

      console.warn("No AI response");

      return;

    }

    console.log("Sending:", lastMessage.content);

    socket.emit(

      "ai_question",

      lastMessage.content

    );

  }

  catch (err) {

    console.error(err);

    socket.emit(

      "ai_error",

      err.message

    );

  }

}

/**
 * Called whenever the whiteboard changes.
 *
 * For now we simply persist the graph inside the LangGraph state.
 * Later this function will invoke the Graph Analyzer and Conversation Manager
 * to generate proactive interview questions.
 */
export async function runGraphCheck(socket, { graph }) {
  try {
    await agent.invoke(
      {
        graph,
      },
      {
        configurable: {
          thread_id: socket.id,
        },
      }
    );

    console.log(
      `[Graph] Updated (${graph?.nodes?.length ?? 0} nodes)`
    );
  } catch (err) {
    console.error("[Graph]", err);
  }
}