import { Annotation, messagesStateReducer } from "@langchain/langgraph";

export const State = Annotation.Root({

  // ===========================
  // Conversation
  // ===========================

  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  nextNode: Annotation({
    reducer: (_, b) => b,
    default: () => "interviewer",
  }),
  // ===========================
  // Loaded Knowledge
  // ===========================

  knowledge: Annotation({
    reducer: (_, b) => b,
    default: () => null,
  }),

  // ===========================
  // Interview State
  // ===========================

  interview: Annotation({
    reducer: (a, b) => ({
      ...(a || {}),
      ...(b || {}),
    }),
    default: () => ({
      started: false,

      stage: "Requirements",

      currentQuestion: "",

      currentObjective: "",

      progress: 0,

      difficulty: "SDE1",

      completed: false,
    }),
  }),

  // ===========================
  // Candidate State
  // ===========================

  candidate: Annotation({
    reducer: (a, b) => ({
      ...(a || {}),
      ...(b || {}),
    }),
    default: () => ({
      latestMessage: "",

      intent: null,

      evaluation: null,

      strengths: [],

      weaknesses: [],

      coveredConcepts: [],

      missingConcepts: [],

      incorrectConcepts: [],

      architectureChoices: [],

      assumptions: [],

      level: "Unknown",
    }),
  }),

  // ===========================
  // Conversation Manager Output
  // ===========================

  conversation: Annotation({
    reducer: (a, b) => ({
      ...(a || {}),
      ...(b || {}),
    }),
    default: () => ({
      decision: null,

      objective: "",

      shouldRespond: true,
    }),
  }),

  // ===========================
  // Memory
  // ===========================

  memory: Annotation({
    reducer: (a, b) => ({
      ...(a || {}),
      ...(b || {}),
    }),
    default: () => ({
      summary: "",

      previousQuestions: [],

      importantFacts: [],

      interviewNotes: "",
    }),
  }),

  // ===========================
  // Whiteboard Graph
  // ===========================

  graph: Annotation({
    reducer: (a, b) => ({
      ...(a || {}),
      ...(b || {}),
    }),
    default: () => ({
      nodes: [],
      edges: [],
      analysis: null,
    }),
  }),

});