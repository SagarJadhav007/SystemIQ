import { StateSchema, MessagesValue } from "@langchain/langgraph";
import { z } from "zod";

export const State = new StateSchema({
  messages: MessagesValue,

  problem: z.any(),

  stage: z.string(),
  started: z.boolean(),

  lastUserText: z.string().optional(),
  lastUserActivity: z.number().optional(),
  lastAIActivity: z.number().optional(),

  graph: z.any().optional(),

  readyAskedCount: z.number().optional(),
});