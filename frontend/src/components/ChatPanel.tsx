import { useEffect, useState } from "react";
import { socket } from "../socket";
import speechService from "../services/speechService";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    // 🎤 INIT SPEECH
    speechService.init(
      ({ final }: any) => {
        if (final && final.trim().length > 3) {
          console.log("User:", final);

          setMessages((prev) => [
            ...prev,
            { role: "user", text: final },
          ]);

          socket.emit("user_message", final);
        }
      },
      () => {
        console.log("User interrupted AI");
      }
    );

    // 🤖 AI RESPONSE
    socket.on("ai_question", (msg: string) => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: msg },
      ]);

      speechService.speak(msg); // 🔥 SPEAK
    });

    return () => {
      socket.off("ai_question");
    };
  }, []);

  const toggleMic = () => {
    if (listening) {
      speechService.stop();
    } else {
      speechService.start();
    }
    setListening(!listening);
  };

  return (
    <div className="flex flex-col h-full">

      {/* CHAT */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-[70%] ${
              m.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* MIC CONTROL */}
      <div className="p-3 border-t flex justify-between">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded ${
            listening ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {listening ? "Stop Mic" : "Start Mic"}
        </button>
      </div>
    </div>
  );
}