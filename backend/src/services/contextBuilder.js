export function buildIntentContext(state) {

    return {

        latestMessage:
            state.candidate.latestMessage,

        interviewStage:
            state.interview.stage,

    };

}

// ======================================================
// Evaluator
// ======================================================

export function buildEvaluatorContext(state) {

    return {

        problem:
            state.knowledge.problem,

        evaluationRubric:
            state.knowledge.evaluation,

        architectureKnowledge:
            state.knowledge.architecture,

        currentQuestion:
            state.interview.currentQuestion,

        currentStage:
            state.interview.stage,

        candidateAnswer:
            state.candidate.latestMessage,

        interviewSummary:
            state.memory.summary,

        graph:
            state.graph

    };

}

// ======================================================
// Conversation Manager
// ======================================================

export function buildConversationContext(state) {

    return {

        // --------------------------
        // Problem Knowledge
        // --------------------------

        problem:
            state.knowledge.problem,

        interviewGuide:
            state.knowledge.interview,

        // --------------------------
        // Interview Progress
        // --------------------------

        interview: {

            stage:
                state.interview.stage,

            currentQuestion:
                state.interview.currentQuestion,

            currentObjective:
                state.interview.currentObjective,

            progress:
                state.interview.progress,

            difficulty:
                state.interview.difficulty,

            completed:
                state.interview.completed

        },

        // --------------------------
        // Intent
        // --------------------------

        intent:
            state.candidate.intent,

        // --------------------------
        // Evaluation
        // --------------------------

        evaluation:
            state.candidate.evaluation,

        // --------------------------
        // Candidate Profile
        // --------------------------

        candidate: {

            latestMessage:
                state.candidate.latestMessage,

            strengths:
                state.candidate.strengths,

            weaknesses:
                state.candidate.weaknesses,

            coveredConcepts:
                state.candidate.coveredConcepts,

            missingConcepts:
                state.candidate.missingConcepts,

            incorrectConcepts:
                state.candidate.incorrectConcepts,

            architectureChoices:
                state.candidate.architectureChoices,

            assumptions:
                state.candidate.assumptions,

            level:
                state.candidate.level

        },

        // --------------------------
        // Memory
        // --------------------------

        memory: {

            summary:
                state.memory.summary,

            previousQuestions:
                state.memory.previousQuestions,

            importantFacts:
                state.memory.importantFacts,

            interviewNotes:
                state.memory.interviewNotes

        },

        // --------------------------
        // Whiteboard
        // --------------------------

        graph:
            state.graph

    };

}

// ======================================================
// Interviewer
// ======================================================

export function buildInterviewerContext(state) {

    return {

        problem:
            state.knowledge.problem,

        architecture:
            state.knowledge.architecture,

        interviewGuide:
            state.knowledge.interview,

        interview:
            state.interview,

        conversation:
            state.conversation,

        candidate:
            state.candidate,

        memory:
            state.memory,

        graph:
            state.graph

    };

}