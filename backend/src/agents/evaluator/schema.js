import { z } from "zod";

export const EvaluationSchema = z.object({

    answeredCurrentQuestion: z.boolean(),

    score: z.number().min(0).max(10),

    candidateLevel: z.enum([
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED",
        "STRONG"
    ]),

    strengths: z.array(z.string()),

    weaknesses: z.array(z.string()),

    coveredConcepts: z.array(z.string()),

    missingConcepts: z.array(z.string()),

    incorrectConcepts: z.array(z.string()),

    architectureChoices: z.array(z.string()),

    reasoning: z.string()

});