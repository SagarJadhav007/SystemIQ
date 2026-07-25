import "dotenv/config";
import express from "express";
import cors from "cors";
import reportRoutes from "./src/routes/report.routes.js";
import interviewRoutes from "./src/routes/interview.routes.js";
import historyRoutes from "./src/routes/history.routes.js";
import problemRoutes from "./src/routes/problem.routes.js";
import voiceRoutes from "./src/routes/voice.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/voice", voiceRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/problems", problemRoutes);

app.listen(5000, () => {

    console.log(

        "Server running on port 5000"

    );

});