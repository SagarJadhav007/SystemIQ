import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import speechService from "../services/speechService";
import { transcribeAudio } from "../services/voiceService";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------

  useEffect(() => {

    console.log("ChatPanel Mounted");

    speechService.init(

      async (blob: Blob) => {

        try {

          setThinking(true);

          const transcript = await transcribeAudio(blob);

          console.log("Transcript:", transcript);

          setInput(transcript);

        }

        catch (err) {

          console.error(err);

        }

        finally {

          setThinking(false);

        }

      },

      () => {

        speechService.stopSpeaking();

      },

      () => {}

    );

    socket.on("connect", () => {

      console.log("Socket Connected:", socket.id);

    });

    socket.on("ai_question", (msg: string) => {

      console.log("AI RECEIVED");

      console.log(msg);

      setThinking(false);

      setMessages(prev => {

        const next: Message[] = [

          ...prev,

          {

            role: "ai",

            text: msg

          }

        ];

        console.log("New Messages:", next);

        return next;

      });

      speechService.speak(msg);

    });

    socket.on("ai_error", (msg: string) => {

      setThinking(false);

      setMessages(prev => [

        ...prev,

        {

          role: "ai",

          text: `⚠️ ${msg}`

        } as Message

      ]);

    });

    socket.emit("ready");

    return () => {

      socket.off("connect");

      socket.off("ai_question");

      socket.off("ai_error");

    };

  }, []);

  // ------------------------------------------------------------
  // DEBUG
  // ------------------------------------------------------------

  useEffect(() => {

    console.log("Messages Updated");

    console.log(messages);

    bottomRef.current?.scrollIntoView({

      behavior: "smooth",

    });

  }, [messages]);

  // ------------------------------------------------------------
  // SEND
  // ------------------------------------------------------------

  function sendMessage() {

    const text = input.trim();

    if (!text) return;

    setMessages(prev => [

      ...prev,

      {

        role: "user",

        text

      }

    ]);

    socket.emit(

      "user_message",

      text

    );

    setInput("");

    setThinking(true);

  }

  // ------------------------------------------------------------
  // MIC
  // ------------------------------------------------------------

  async function toggleMic() {

    if (listening) {

      await speechService.stop();

      setListening(false);

      return;

    }

    setInput("");

    await speechService.start();

    setListening(true);

  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (

    <div className="flex flex-col h-full bg-gray-950 text-white">

      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {messages.map((m, i) => (

          <div

            key={i}

            className={`flex ${

              m.role === "user"

                ? "justify-end"

                : "justify-start"

            }`}

          >

            <div

              className={`

                px-4

                py-3

                rounded-xl

                whitespace-pre-wrap

                max-w-[75%]

                ${

                  m.role === "user"

                    ? "bg-indigo-600"

                    : "bg-gray-800"

                }

              `}

            >

              {m.text}

            </div>

          </div>

        ))}

        {thinking && (

          <div>

            AI Thinking...

          </div>

        )}

        <div ref={bottomRef} />

      </div>

      <div className="border-t border-gray-800 p-4 space-y-3">

        <textarea

          rows={5}

          value={input}

          onChange={(e) =>

            setInput(e.target.value)

          }

          placeholder="Type your answer or use the microphone..."

          className="

            w-full

            rounded-lg

            bg-gray-900

            border

            border-gray-700

            p-3

            resize-none

          "

        />

        <div className="flex gap-3">

          <button

            onClick={toggleMic}

            className="px-4 py-2 rounded-lg bg-gray-800"

          >

            {listening

              ? "Stop Mic"

              : "Start Mic"}

          </button>

          <button

            onClick={sendMessage}

            className="px-4 py-2 rounded-lg bg-indigo-600"

          >

            Send

          </button>

        </div>

      </div>

    </div>

  );

}