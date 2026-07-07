import {
  runAgent,
  runGraphCheck,
  agent,
} from "../controllers/interview.controller.js";

const sessions = {};

export function interviewSocket(socket) {

  console.log("User connected:", socket.id);

  sessions[socket.id] = {
    graph: {
      nodes: [],
      edges: [],
    },
  };

  // ============================================================
  // FRONTEND READY
  // ============================================================

  socket.on("ready", async () => {
    await initializeInterview();
  });

  // ============================================================
  // INITIALIZE / RESTORE
  // ============================================================

  async function initializeInterview() {

    try {

      const state = await agent.getState({

        configurable: {

          thread_id: socket.id,

        },

      });

      const interview = state?.values?.interview;

      if (!interview?.started) {

        console.log("[socket] starting interview");

        await runAgent(socket, {

          graph: sessions[socket.id].graph,

        });

        return;

      }

      console.log("[socket] restoring interview");

      const lastMessage =
        state.values.messages?.at(-1);

      if (lastMessage?.content) {

        socket.emit(

          "ai_question",

          lastMessage.content

        );

      }

    }

    catch (err) {

      console.log("[socket] new session");

      await runAgent(socket, {

        graph: sessions[socket.id].graph,

      });

    }

  }

  // ============================================================
  // USER MESSAGE
  // ============================================================

  socket.on("user_message", async (text) => {

    if (!text?.trim()) return;

    console.log("\n============= USER =============\n");

    console.log(text);

    console.log("\n===============================\n");

    await runAgent(socket, {

      lastUserText: text,

      graph: sessions[socket.id].graph,

    });

  });

  // ============================================================
  // GRAPH UPDATE
  // ============================================================

  socket.on("graph_update", async (graph) => {

    sessions[socket.id].graph = graph;

    console.log(

      "[socket] graph updated:",

      graph?.nodes?.length ?? 0,

      "nodes"

    );

    await runGraphCheck(socket, {

      graph,

    });

  });

  // ============================================================
  // DISCONNECT
  // ============================================================

  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

    delete sessions[socket.id];

  });

}