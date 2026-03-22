import { StateSchema, MessagesValue } from "@langchain/langgraph";
import { z } from "zod";

export const State = new StateSchema({
  messages: MessagesValue,

  problem: z.any().optional(),
  stage: z.string().optional(), 
  started: z.boolean().optional(),
});