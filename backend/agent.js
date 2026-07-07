import { StateGraph, START, END } from "@langchain/langgraph";

import { State } from "./src/state.js";

import { greetingNode } from "./src/nodes/greetingNode.js";
import { inputNode } from "./src/nodes/inputNode.js";
import { intentNode } from "./src/nodes/intentNode.js";
import { orchestratorNode } from "./src/nodes/orchestratorNode.js";
import { evaluatorNode } from "./src/nodes/evaluatorNode.js";
import { conversationNode } from "./src/nodes/conversationNode.js";
import { interviewNode } from "./src/nodes/interviewNode.js";

export function buildAgent(checkpointer) {

    const workflow = new StateGraph(State);

    // -----------------------------
    // Nodes
    // -----------------------------

    workflow.addNode("greeting", greetingNode);

    workflow.addNode("input", inputNode);

    workflow.addNode("intent", intentNode);

    workflow.addNode("orchestrator", orchestratorNode);

    workflow.addNode("evaluator", evaluatorNode);

    workflow.addNode("conversationManager", conversationNode);

    workflow.addNode("interviewer", interviewNode);

    // -----------------------------
    // Initial Greeting
    // -----------------------------

    workflow.addEdge(START, "greeting");

    workflow.addConditionalEdges(
        "greeting",
        (state) => {

            if (state.interview.started && !state.candidate.latestMessage) {
                return END;
            }

            return "input";
        },
        {
            input: "input",
            [END]: END,
        }
    );

    // -----------------------------
    // Normal Interview Flow
    // -----------------------------

    workflow.addEdge("input", "intent");

    workflow.addEdge("intent", "orchestrator");

    workflow.addConditionalEdges(
        "orchestrator",
        (state) => state.nextNode,
        {
            evaluator: "evaluator",
            interviewer: "interviewer",
        }
    );

    workflow.addEdge("evaluator", "conversationManager");

    workflow.addEdge("conversationManager", "interviewer");

    workflow.addEdge("interviewer", END);

    return workflow.compile({
        checkpointer,
    });
}