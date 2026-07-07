export class SessionManager {

    // ==========================================================
    // Candidate
    // ==========================================================

    static setCandidateMessage(state, message) {

        return {

            candidate: {

                ...state.candidate,

                latestMessage: message

            }

        };

    }

    static setIntent(state, intent) {

        return {

            candidate: {

                ...state.candidate,

                intent

            }

        };

    }

    static setEvaluation(state, evaluation) {

        return {

            candidate: {

                ...state.candidate,

                evaluation,

                strengths: evaluation.strengths ?? [],

                weaknesses: evaluation.weaknesses ?? [],

                coveredConcepts: evaluation.coveredConcepts ?? [],

                missingConcepts: evaluation.missingConcepts ?? [],

                incorrectConcepts: evaluation.incorrectConcepts ?? [],

                architectureChoices: evaluation.architectureChoices ?? [],

                assumptions: evaluation.assumptions ?? state.candidate.assumptions,

                level: evaluation.candidateLevel ?? state.candidate.level

            }

        };

    }

    // ==========================================================
    // Conversation
    // ==========================================================

    static applyConversationDecision(state, decision) {

        return {

            conversation: {

                ...state.conversation,

                ...decision

            },

            interview: {

                ...state.interview,

                stage:
                    decision.nextStage ??
                    state.interview.stage,

                currentObjective:
                    decision.objective ??
                    state.interview.currentObjective,

                currentQuestion:
                    decision.nextQuestion ??
                    state.interview.currentQuestion

            }

        };

    }

    // ==========================================================
    // Interview
    // ==========================================================

    static updateInterview(state, updates) {

        return {

            interview: {

                ...state.interview,

                ...updates

            }

        };

    }

    // ==========================================================
    // Memory
    // ==========================================================

    static updateMemory(state, updates) {

        return {

            memory: {

                ...state.memory,

                ...updates

            }

        };

    }

    // ==========================================================
    // Graph
    // ==========================================================

    static setGraph(state, graph) {

        return {

            graph

        };

    }

}