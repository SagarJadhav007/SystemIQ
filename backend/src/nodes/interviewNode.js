import { generateInterviewerResponse } from "../agents/interviewer/agent.js";
import { buildInterviewerContext } from "../services/contextBuilder.js";

export async function interviewNode(state) {

    console.log("\n========== INTERVIEWER ==========");

    // Initial greeting
    if (!state.interview.started) {

        return {

            interview: {

                ...state.interview,

                started: true,

                stage: "Requirements",

                currentQuestion:
                    "Requirement Clarification"

            },

            messages: [

                {

                    role: "assistant",

                    content:
`Hi! I'm your interviewer today.

We'll be designing ${state.knowledge.problem.title}.

Whenever you're ready, begin by asking any requirement clarification questions before starting the design.`

                }

            ]

        };

    }

    const context =
        buildInterviewerContext(state);

    const result =
        await generateInterviewerResponse(context);

    console.log(result);

    console.log("===============================\n");

    return {

        messages: [

            {

                role: "assistant",

                content: result.response

            }

        ]

    };

}