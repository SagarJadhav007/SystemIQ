import { runAgent } from "../controllers/interview.controller.js";
import { debounceTrigger, cancelDebounce } from "../utils/debounce.js";

const sessions = {};

export function interviewSocket(socket) {
  sessions[socket.id] = { pendingBuffer: "", graph: null, started: false };

  // Start interview on connect — explicit started:false to trigger greeting
  runAgent(socket, { started: false });

  // ── VOICE INPUT ──────────────────────────────────────────────────────────
  socket.on("user_message", (text) => {
    if (!text?.trim()) return;

    const session = sessions[socket.id];
    if (!session) return;

    session.pendingBuffer = ((session.pendingBuffer || "") + " " + text).trim();
    socket.emit("ai_listening", true);

    // Debounce: wait for 2.5s pause then always flush — no word count gate
    // (word gate was blocking short but complete thoughts like "I'd use WebSockets")
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
        graph: session.graph, // always pass latest graph with voice input
      });
    }, 2500);
  });

  // ── GRAPH UPDATE ─────────────────────────────────────────────────────────
  // Store graph in session only — do NOT call runAgent at all.
  // Graph is passed to agent next time user speaks via lastGraph in session.
  // This completely prevents the greeting-repeat bug caused by runAgent
  // receiving started:undefined (which LangGraph defaults to false).
  socket.on("graph_update", (graph) => {
    const session = sessions[socket.id];
    if (!session) return;
    session.graph = graph;
    console.log("[socket] graph updated silently, nodes:", graph?.nodes?.length ?? 0);
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