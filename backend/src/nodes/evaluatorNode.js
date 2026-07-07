import { evaluateAnswer } from "../agents/evaluator/agent.js";
import { buildEvaluatorContext } from "../services/contextBuilder.js";
import { SessionManager } from "../services/sessionManager.js";

export async function evaluatorNode(state) {

    console.log("\n========== EVALUATOR ==========");

    try {

        const context = buildEvaluatorContext(state);

        console.log("Evaluating answer...");

        const evaluation = await evaluateAnswer(context);

        console.log(evaluation);

        console.log("================================\n");

        return SessionManager.setEvaluation(
            state,
            evaluation
        );

    } catch (err) {

        console.error("[Evaluator]", err);

        return SessionManager.setEvaluation(state, {

            answeredCurrentQuestion: false,

            score: 0,

            candidateLevel: state.candidate.level,

            strengths: [],

            weaknesses: ["Evaluation failed"],

            coveredConcepts: [],

            missingConcepts: [],

            incorrectConcepts: [],

            architectureChoices: [],

            reasoning: err.message

        });

    }

}