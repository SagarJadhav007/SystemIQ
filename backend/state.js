import { Annotation, messagesStateReducer } from "@langchain/langgraph";

export const State = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  problem: Annotation({ reducer: (_, b) => b, default: () => null }),
  started: Annotation({ reducer: (_, b) => b, default: () => false }),
  interviewStartTime: Annotation({ reducer: (_, b) => b, default: () => null }),

  // Silent topic tracker — never surfaced to user
  topicsCovered: Annotation({
    reducer: (a, b) => ({ ...(a || {}), ...(b || {}) }),
    default: () => ({
      requirements: false,
      components: false,
      scaling: false,
      db_schema: false,
      tradeoffs: false,
      offline_handling: false,
      real_time: false,
    }),
  }),

  lastUserText: Annotation({ reducer: (_, b) => b, default: () => "" }),
  lastUserActivity: Annotation({ reducer: (_, b) => b, default: () => 0 }),
  lastAIActivity: Annotation({ reducer: (_, b) => b, default: () => 0 }),
  graph: Annotation({ reducer: (_, b) => b, default: () => null }),
});