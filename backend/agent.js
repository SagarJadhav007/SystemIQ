import { StateGraph, START } from "@langchain/langgraph";
import { State } from "./state.js";
import { interviewNode } from "./src/nodes/interviewNode.js";

export function buildAgent(checkpointer) {
  const builder = new StateGraph(State);

  builder.addNode("interview", interviewNode);

  builder.addEdge(START, "interview");

  return builder.compile({
    checkpointer,
  });
}