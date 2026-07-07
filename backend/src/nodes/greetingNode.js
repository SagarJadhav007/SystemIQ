export async function greetingNode(state) {

    console.log("\n========== GREETING ==========\n");

    if (state.interview.started) {

        console.log("Interview already started.");

        return {};

    }

    return {

        interview: {

            ...state.interview,

            started: true,

            stage: "Requirements",

            currentQuestion: "Requirement Clarification",

            currentObjective: "Gather Requirements"

        },

        messages: [

            {

                role: "assistant",

                content:
`Hi! I'm your interviewer today.

We'll be designing **${state.knowledge.problem.title}**.

Take a minute to understand the problem.

Whenever you're ready, start by asking any requirement clarification questions before jumping into the design.`

            }

        ]

    };

}