import { decideConversation } from "../agents/conversation/agent.js";
import { buildConversationContext } from "../services/contextBuilder.js";
import { SessionManager } from "../services/sessionManager.js";

export async function conversationNode(state) {

    console.log("\n========== CONVERSATION ==========");

    try {

        const context = buildConversationContext(state);

        console.log("Building conversation decision...");

        const decision = await decideConversation(context);

        console.log(decision);

        console.log("==================================\n");

        return SessionManager.applyConversationDecision(
            state,
            decision
        );

    } catch (err) {

        console.error("[Conversation]", err);

        return SessionManager.applyConversationDecision(state, {

            decision: "FOLLOW_UP",

            targetTopic: "",

            objective: state.interview.currentObjective,

            nextQuestion: state.interview.currentQuestion,

            nextStage: state.interview.stage,

            reasoning: err.message,

            confidence: 0

        });

    }

}