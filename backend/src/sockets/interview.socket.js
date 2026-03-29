import { runAgent, runGraphCheck } from "../controllers/interview.controller.js";
import { debounceTrigger, cancelDebounce } from "../utils/debounce.js";
import { agent } from "../controllers/interview.controller.js";

const sessions = {};

export function interviewSocket(socket) {
  sessions[socket.id] = { pendingBuffer: "", graph: null };

  // Kick off the interview. We check existing LangGraph state first —
  // if this thread_id already has a started:true state (e.g. page refresh),
  // we don't send started:false which would re-trigger the greeting.
  kickoffInterview(socket);

  async function kickoffInterview(socket) {
    try {
      const existing = await agent.getState({
        configurable: { thread_id: socket.id },
      });
      const alreadyStarted = existing?.values?.started === true;

      if (!alreadyStarted) {
        // Fresh session — trigger greeting
        runAgent(socket, { started: false });
      } else {
        // Reconnect — just re-emit the last AI message so UI isn't blank
        const lastMsg = existing.values?.messages?.at(-1);
        if (lastMsg?._getType?.() === "ai" && lastMsg.content) {
          socket.emit("ai_question", lastMsg.content);
        }
      }
    } catch {
      // No existing state — fresh start
      runAgent(socket, { started: false });
    }
  }

  // ── VOICE INPUT ──────────────────────────────────────────────────────────
  socket.on("user_message", (text) => {
    if (!text?.trim()) return;

    const session = sessions[socket.id];
    if (!session) return;

    session.pendingBuffer = ((session.pendingBuffer || "") + " " + text).trim();
    socket.emit("ai_listening", true);

    // Cancel any pending graph-triggered response — user speech takes priority
    cancelDebounce(socket.id + "_graph");

    debounceTrigger(socket.id, () => {
      const session = sessions[socket.id];
      if (!session) return;

      const buffer = session.pendingBuffer.trim();
      if (!buffer) return;

      session.pendingBuffer = "";
      socket.emit("ai_listening", false);

      console.log("[socket] flushing voice buffer to agent:", buffer);

      runAgent(socket, {
        lastUserText: buffer,
        lastUserActivity: Date.now(),
        graph: session.graph,
      });
    }, 2500);
  });

  // ── GRAPH UPDATE ─────────────────────────────────────────────────────────
  // Store graph in session. Then, after a quiet period with no voice input,
  // trigger a proactive graph-check so the AI can ask about unexaplained nodes.
  socket.on("graph_update", (graph) => {
    const session = sessions[socket.id];
    if (!session) return;

    const prevNodeCount = session.graph?.nodes?.length ?? 0;
    const newNodeCount = graph?.nodes?.length ?? 0;
    session.graph = graph;

    console.log("[socket] graph updated silently, nodes:", newNodeCount);

    // Only trigger proactive check when a NEW node is added (not on every edge/move)
    if (newNodeCount <= prevNodeCount) return;

    // Don't interrupt if the user is currently speaking / AI is responding
    if (session.pendingBuffer?.trim()) return;

    // Debounce: wait 4s after last graph change before proactively asking
    // This prevents rapid-fire questions while the user is still dragging nodes
    debounceTrigger(socket.id + "_graph", () => {
      const session = sessions[socket.id];
      if (!session) return;

      // If user started speaking while we were waiting, bail out
      if (session.pendingBuffer?.trim()) return;

      console.log("[socket] proactive graph check triggered");
      runGraphCheck(socket, {
        graph: session.graph,
      });
    }, 4000);
  });

  socket.on("flush_input", () => {
    cancelDebounce(socket.id);
    const session = sessions[socket.id];
    if (!session) return;

    const buffer = session.pendingBuffer.trim();
    if (!buffer) return;

    session.pendingBuffer = "";
    socket.emit("ai_listening", false);

    runAgent(socket, {
      lastUserText: buffer,
      lastUserActivity: Date.now(),
      graph: session.graph,
    });
  });

  socket.on("disconnect", () => {
    cancelDebounce(socket.id);
    cancelDebounce(socket.id + "_graph");
    delete sessions[socket.id];
  });
}