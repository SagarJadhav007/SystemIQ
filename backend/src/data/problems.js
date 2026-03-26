export const problems = {
  chat_app: {
    title: "Design a Chat Application like WhatsApp",
    description: "Real-time messaging for 500M DAU, 1:1 and group chats, media sharing.",

    topics: {
      real_time_delivery: {
        label: "Real-time delivery",
        stage: "high_level",
        key_factors: [
          "transport protocol choice (WebSocket / SSE / polling)",
          "connection management at scale",
          "reconnection and heartbeat handling"
        ]
      },

      message_persistence: {
        label: "Message storage",
        stage: "deep_dive",
        key_factors: [
          "database choice with justification",
          "schema design for 1:1 vs group",
          "pagination and ordering"
        ]
      },

      offline_delivery: {
        label: "Offline delivery",
        stage: "deep_dive",
        key_factors: [
          "queue for undelivered messages",
          "push notifications (APNs / FCM)",
          "deduplication on retry"
        ]
      },

      scaling: {
        label: "Scaling and bottlenecks",
        stage: "deep_dive",
        key_factors: [
          "caching strategy and what to cache",
          "database sharding approach",
          "fan-out for group messages"
        ]
      },

      non_functional: {
        label: "Non-functional requirements",
        stage: "high_level",
        key_factors: [
          "latency targets",
          "consistency vs availability tradeoff",
          "fault tolerance"
        ]
      },

      requirements_gathering: {
        label: "Requirements gathering",
        stage: "requirements",
        key_factors: [
          "asks about scale before designing",
          "clarifies scope (groups? media?)",
          "states assumptions explicitly"
        ]
      }
    },

    node_to_topic: {
      cache:             "scaling",
      message_queue:     "offline_delivery",
      websocket_server:  "real_time_delivery",
      cdn:               "scaling",
      notification_service: "offline_delivery"
    }
  },

  url_shortener: {
    title: "Design a URL Shortener like Bitly",
    description:
      "Shorten long URLs and redirect users efficiently.",
    core: ["API", "DB", "Cache"],
    deep_dive: ["collision handling", "scaling reads"]
  }
};