export const problems = {
  chat_app: {
    title: "Design a Chat Application like WhatsApp",
    description:
      "Users can send and receive messages in real-time. System should support millions of users.",
    core: [
      "API Gateway",
      "WebSocket Server",
      "Message Queue",
      "Message Storage",
      "User Presence"
    ],
    deep_dive: [
      "message ordering",
      "offline delivery",
      "scaling connections",
      "database schema"
    ]
  },

  url_shortener: {
    title: "Design a URL Shortener like Bitly",
    description:
      "Shorten long URLs and redirect users efficiently.",
    core: ["API", "DB", "Cache"],
    deep_dive: ["collision handling", "scaling reads"]
  }
};