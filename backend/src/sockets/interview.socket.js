import {
  handleStartInterview,
  handleUserMessage,
  runAgent,
} from "../controllers/interview.controller.js";
import { debounceTrigger } from "../utils/debounce.js";

const sessions = {};

export function interviewSocket(socket) {
  sessions[socket.id] = {
    lastUserText: "",
    graph: null,
  };

  runAgent(socket, {
    started: false,
    stage: "start",
  });

  socket.on("user_message", (text) => {
    sessions[socket.id].lastUserText = text;

    debounceTrigger(socket.id, () => {
      runAgent(socket, {
        lastUserText: text,
        lastUserActivity: Date.now(),
      });
    });
  });

  socket.on("graph_update", (graph) => {
    sessions[socket.id].graph = graph;

    debounceTrigger(socket.id, () => {
      runAgent(socket, {
        graph,
        lastUserActivity: Date.now(),
      });
    });
  });

  socket.on("disconnect", () => {
    delete sessions[socket.id];
  });
}
