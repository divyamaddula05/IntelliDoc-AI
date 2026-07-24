import { useEffect, useRef, useState } from "react";
import { FiSend, FiUser } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import { askQuestion } from "../api/chat";
import { getChatHistory } from "../api/history";
interface Document {
  id: number;
  filename: string;
}

interface Props {
  document: Document | null;
}

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWindow({ document }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);
  useEffect(() => {
    setMessages([]);
    }, [document]);
    useEffect(() => {
    if (!document) return;

    const loadHistory = async () => {
        const res = await getChatHistory(document.id);

        const history: Message[]=[];

        for (const chat of res.data) {
            history.push({
                sender: "user",
                text: chat.question,
            });

            history.push({
                sender: "ai",
                text: chat.answer,
            });
        }

        setMessages(history);
    };

    loadHistory().catch((err) => {
    console.error(err);
});
}, [document]);
  const sendMessage = async () => {
    if (!document) {
      alert("Please select a document first.");
      return;
    }

    if (!question.trim()) return;

    const userQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const response = await askQuestion(
        document.id,
        userQuestion
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            response.data.answer ??
            response.data.response ??
            "No response received.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Unable to get a response from the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg h-[750px] flex flex-col">

      {/* Header */}

      <div className="border-b p-5">

        <h2 className="text-2xl font-bold text-gray-800">
          🤖 IntelliDoc AI Assistant
        </h2>

        {document ? (
        <div className="mt-2">
            <p className="text-blue-600 font-semibold">
            📄 {document.filename}
            </p>
            <p className="text-gray-500 text-sm">
            Ask anything about this document.
            </p>
        </div>
        ) : (
        <p className="text-gray-500 mt-2">
            Please select a document from the left panel.
        </p>
        )}

      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {messages.length === 0 && !loading && (

          <div className="flex flex-col items-center justify-center h-full text-center">

            <BsRobot
              size={70}
              className="text-blue-600 mb-5"
            />

            <h2 className="text-3xl font-bold text-gray-700">

              Welcome to IntelliDoc AI

            </h2>

            <p className="text-gray-500 mt-3 max-w-md">

              Upload a PDF, choose it from the
              document list, and ask questions
              naturally.

            </p>

            <div className="mt-8 text-left space-y-2 text-gray-600">

              <p>📄 Upload your PDF</p>

              <p>✅ Select a document</p>

              <p>💬 Ask questions naturally</p>

              <p>⚡ Powered by Gemini + RAG</p>

            </div>

          </div>

        )}

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`flex gap-3 max-w-[80%] ${
                msg.sender === "user"
                  ? "flex-row-reverse"
                  : ""
              }`}
            >

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  msg.sender === "user"
                    ? "bg-blue-600"
                    : "bg-green-600"
                }`}
              >

                {msg.sender === "user"
                  ? <FiUser />
                  : <BsRobot />}

              </div>

              <div
                className={`rounded-2xl px-5 py-4 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >

                <ReactMarkdown>

                  {msg.text}

                </ReactMarkdown>

              </div>

            </div>

          </div>

        ))}

        {loading && (

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">

              <BsRobot />

            </div>

            <div className="bg-gray-100 rounded-xl px-5 py-4">

              <div className="flex gap-2">

                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>

                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>

                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>

              </div>

            </div>

          </div>

        )}

        <div ref={bottomRef}></div>

      </div>

      {/* Input */}

      <div className="border-t p-5 flex gap-3">

        <input
          type="text"
          value={question}
          placeholder="Ask a question about your PDF..."
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !loading
            ) {
              sendMessage();
            }
          }}
          className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 rounded-xl flex items-center gap-2 transition"
        >

          <FiSend />

          Send

        </button>

      </div>

    </div>
  );
}