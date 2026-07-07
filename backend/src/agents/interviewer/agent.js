import { llm } from "../../services/llm.js";
import { interviewerPrompt } from "./prompt.js";
import { InterviewerSchema } from "./schema.js";

const structured = llm.withStructuredOutput(
    InterviewerSchema
);

export async function generateInterviewerResponse(context) {

    const result = await structured.invoke([

        {
            role: "system",
            content: interviewerPrompt,
        },

        {
            role: "user",
            content: JSON.stringify({

                // -------------------------
                // Problem
                // -------------------------

                problem:
                    context.problem,

                architecture:
                    context.architecture,

                interviewGuide:
                    context.interviewGuide,

                // -------------------------
                // Current Interview State
                // -------------------------

                interview:
                    context.interview,

                // -------------------------
                // Conversation Manager Decision
                // -------------------------

                conversation:
                    context.conversation,

                // -------------------------
                // Candidate
                // -------------------------

                candidate:
                    context.candidate,

                // -------------------------
                // Memory
                // -------------------------

                memory:
                    context.memory,

                // -------------------------
                // Whiteboard
                // -------------------------

                graph:
                    context.graph

            }, null, 2)

        }

    ]);

    return result;

}