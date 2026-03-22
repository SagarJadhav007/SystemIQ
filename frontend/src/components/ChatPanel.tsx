import { useEffect, useState } from "react";
import { socket } from "../socket";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("ai_question", (msg: string) => {
      console.log("AI:", msg);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: msg },
      ]);
    });

    return () => {
      socket.off("ai_question");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    // ✅ Add user message to UI
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
    ]);

    // ✅ Send to backend
    socket.emit("user_message", input);

    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* CHAT MESSAGES */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded shadow max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT BOX */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Explain your design..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}