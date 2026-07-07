import { classifyIntent } from "../agents/intent/agent.js";
import { SessionManager } from "../services/sessionManager.js";

export async function intentNode(state) {

    console.log("\n========== INTENT ==========");

    const result = await classifyIntent(
        state.candidate.latestMessage
    );

    console.log(result);

    console.log("============================\n");

    return SessionManager.setIntent(
        state,
        result
    );

}