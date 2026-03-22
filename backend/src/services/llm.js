import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

export const llm = new ChatOpenAI({
  model: "meta-llama/llama-3-8b-instruct",
  temperature: 0.3,
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});