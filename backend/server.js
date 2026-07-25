import "dotenv/config";
import express from "express";
import cors from "cors";
import reportRoutes from "./src/routes/report.routes.js";
import interviewRoutes from "./src/routes/interview.routes.js";
import historyRoutes from "./src/routes/history.routes.js";
import problemRoutes from "./src/routes/problem.routes.js";
import voiceRoutes from "./src/routes/voice.routes.js";

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://system-iq.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/api/voice", voiceRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/problems", problemRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});