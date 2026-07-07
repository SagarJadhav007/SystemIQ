export async function orchestratorNode(state) {

    const action = state.candidate.intent?.nextAction;

    console.log("\n========== ORCHESTRATOR ==========");
    console.log("Intent :", state.candidate.intent?.intent);
    console.log("Action :", action);

    let nextNode = "interviewer";

    switch (action) {

        case "EVALUATE_ANSWER":
            nextNode = "evaluator";
            break;

        case "ANSWER_QUESTION":
            nextNode = "interviewer";
            break;

        case "ACKNOWLEDGE":
            nextNode = "interviewer";
            break;

        case "REPEAT_QUESTION":
            nextNode = "interviewer";
            break;

        case "END_INTERVIEW":
            nextNode = "interviewer";
            break;

        default:
            nextNode = "interviewer";
    }

    console.log("Next Node :", nextNode);
    console.log("===============================\n");

    return {
        nextNode
    };

}