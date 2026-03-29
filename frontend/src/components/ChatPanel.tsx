import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import speechService from "../services/speechService";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [isAIListening, setIsAIListening] = useState(false); // buffering voice
  const [isAIThinking, setIsAIThinking] = useState(false);   // waiting for LLM
  const [interimText, setInterimText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── SPEECH INIT ─────────────────────────────────────────────────────
    speechService.init(
      ({ final, interim }: { final: string; interim: string }) => {
        if (interim) setInterimText(interim);

        if (final && final.trim().length > 2) {
          setInterimText("");
          // Show user message immediately in UI
          setMessages((prev) => [...prev, { role: "user", text: final }]);
          // Send to backend — backend buffers, not frontend
          socket.emit("user_message", final);
        }
      },
      () => {
        // AI was speaking, user interrupted
        speechService.stopSpeaking();
      }
    );

    // ── SOCKET EVENTS ────────────────────────────────────────────────────

    // Backend is still accumulating voice fragments
    socket.on("ai_listening", (buffering: boolean) => {
      setIsAIListening(buffering);
      if (buffering) setIsAIThinking(false);
    });

    // AI response arrived
    socket.on("ai_question", (msg: string) => {
      setIsAIThinking(false);
      setIsAIListening(false);
      setMessages((prev) => [...prev, { role: "ai", text: msg }]);
      speechService.speak(msg);
    });

    // Error fallback
    socket.on("ai_error", (msg: string) => {
      setIsAIThinking(false);
      setIsAIListening(false);
      setMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${msg}` }]);
    });

    return () => {
      socket.off("ai_listening");
      socket.off("ai_question");
      socket.off("ai_error");
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAIListening, isAIThinking]);

  const toggleMic = () => {
    if (listening) {
      speechService.stop();
      setListening(false);
      setInterimText("");
    } else {
      speechService.start();
      setListening(true);
    }
  };

  const flushInput = () => {
    socket.emit("flush_input");
    setIsAIListening(false);
    setIsAIThinking(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold mr-2 shrink-0 mt-0.5">
                AI
              </div>
            )}
            <div
              className={`px-3 py-2 rounded-2xl text-sm max-w-[78%] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-100 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Interim voice text */}
        {interimText && (
          <div className="flex justify-end">
            <div className="px-3 py-2 rounded-2xl text-sm max-w-[78%] bg-indigo-900/50 text-indigo-300 italic border border-indigo-800">
              {interimText}
            </div>
          </div>
        )}

        {/* Status indicators */}
        {isAIListening && !isAIThinking && (
          <div className="flex justify-start items-center gap-2 pl-9">
            <div className="flex gap-1 items-center text-xs text-yellow-400">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Still listening...
            </div>
          </div>
        )}

        {isAIThinking && (
          <div className="flex justify-start items-center gap-2 pl-9">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── CONTROLS ── */}
      <div className="p-3 border-t border-gray-800 flex items-center gap-2">

        {/* Mic toggle */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            listening
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
        >
          <span>{listening ? "🔴" : "🎤"}</span>
          {listening ? "Stop" : "Start Mic"}
        </button>

        {/* Done explaining — force flush buffer */}
        {isAIListening && (
          <button
            onClick={flushInput}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
          >
            ✓ Done explaining
          </button>
        )}

        {/* Status pill */}
        <div className="ml-auto text-xs text-gray-500">
          {listening ? (
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Mic active
            </span>
          ) : (
            <span>Mic off</span>
          )}
        </div>
      </div>
    </div>
  );
}