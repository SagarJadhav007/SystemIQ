import { handleStartInterview, handleUserMessage } from "../controllers/interview.controller.js";

export function interviewSocket(socket) {
  
  handleStartInterview(socket);

  socket.on("user_message", (text) => {
    handleUserMessage(socket, text);
  });
}