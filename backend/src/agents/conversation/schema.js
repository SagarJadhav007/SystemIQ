import { z } from "zod";

export const ConversationSchema = z.object({

    decision: z.enum([

        "ANSWER_CANDIDATE",

        "PROBE_DEEPER",

        "MOVE_FORWARD",

        "REPEAT_QUESTION",

        "WRAP_UP"

    ]),

    nextStage: z.string(),

    objective: z.string(),

    nextQuestion: z.string(),

    targetTopic: z.string(),

    reasoning: z.string(),

    confidence: z.number().min(0).max(1)

});