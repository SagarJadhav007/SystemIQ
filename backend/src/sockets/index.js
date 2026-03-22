import { interviewSocket } from "./interview.socket.js";

export function initSockets(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    interviewSocket(socket);

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}