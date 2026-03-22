import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { initSockets } from "./src/sockets/index.js";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ delegate everything
initSockets(io);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});