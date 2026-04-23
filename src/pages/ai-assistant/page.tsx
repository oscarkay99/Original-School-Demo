import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/feature/AppLayout";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const suggestions = [
  "Which students have attendance below 80%?",
  "Show me the top 5 performing students this term",
  "What is the current fee collection rate?",
  "List all upcoming events this month",
  "Which subjects have the lowest average scores?",
  "How many students have overdue fees?",
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hello Oscar! I'm your EduManage AI Assistant. I can help you analyze student performance, track attendance, review financials, and much more. What would you like to know today?",
    time: "Now",
  },
];

const mockResponses: Record<string, string> = {
  default: "I've analyzed the school data. Based on current records, I can see 12 active students across 4 grade levels. Would you like a more specific breakdown?",
  attendance: "Students with attendance below 80%:\n• Yaw Frimpong (Grade 10A) — 71%\n• Esi Bonsu (Grade 11C) — 78%\n\nI recommend scheduling parent meetings for these students immediately.",
  fee: "Current fee collection rate is 53% (GH₵18,000 of GH₵34,200 target).\n\nStudents with overdue fees:\n• Kweku Asante — GH₵2,000\n• Esi Bonsu — GH₵2,000\n\nWould you like me to generate reminder notices?",
  top: "Top 5 performing students this term:\n1. Efua Quaye — GPA 4.0 (Grade 8A)\n2. Akosua Boateng — GPA 3.9 (Grade 8C)\n3. Ama Owusu — GPA 3.8 (Grade 9A)\n4. Kwame Tetteh — GPA 3.8 (Grade 8B)\n5. Abena Darko — GPA 3.7 (Grade 9B)",
  events: "Upcoming events this month:\n• Parent-Teacher Conference — April 28, 2:00 PM\n• Science Fair 2026 — April 30, 10:00 AM\n• End of Term Examination — May 15, 8:00 AM\n• Annual Sports Day — May 22, 9:00 AM",
};

function getResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("attendance") || lower.includes("absent") || lower.includes("80%")) return mockResponses.attendance;
  if (lower.includes("fee") || lower.includes("collection") || lower.includes("overdue")) return mockResponses.fee;
  if (lower.includes("top") || lower.includes("perform") || lower.includes("best")) return mockResponses.top;
  if (lower.includes("event") || lower.includes("upcoming")) return mockResponses.events;
  return mockResponses.default;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim(), time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, role: "assistant", text: getResponse(text), time: "Just now" };
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
    }, 1200);
  };

  return (
    <AppLayout title="AI Assistant" subtitle="Powered by EduManage Intelligence">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
        {/* Sidebar suggestions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50">
                <i className="ri-sparkling-2-line text-violet-500 text-base"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Quick Prompts</p>
                <p className="text-[11px] text-slate-400">Click to ask</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-xs text-slate-600 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-violet-700 border border-transparent hover:border-violet-100 transition-all cursor-pointer leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-800 mb-3">Capabilities</p>
            <div className="space-y-2">
              {[
                { icon: "ri-user-3-line", label: "Student Analytics" },
                { icon: "ri-calendar-check-line", label: "Attendance Insights" },
                { icon: "ri-money-dollar-circle-line", label: "Finance Reports" },
                { icon: "ri-bar-chart-2-line", label: "Grade Analysis" },
                { icon: "ri-calendar-event-line", label: "Event Planning" },
                { icon: "ri-archive-drawer-line", label: "Inventory Alerts" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs text-slate-500">
                  <i className={`${c.icon} text-violet-400 text-sm`}></i>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600">
              <i className="ri-sparkling-2-line text-white text-base"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">EduManage AI</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-xs text-slate-400">Online — ready to help</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${m.role === "assistant" ? "bg-violet-600" : "bg-slate-800"}`}>
                  {m.role === "assistant"
                    ? <i className="ri-sparkling-2-line text-white text-xs"></i>
                    : <span className="text-white text-xs font-bold">ON</span>
                  }
                </div>
                <div className={`max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "assistant"
                      ? "bg-slate-50 text-slate-700 rounded-tl-sm border border-slate-100"
                      : "bg-violet-600 text-white rounded-tr-sm"
                  }`}>
                    {m.text}
                  </div>
                  <p className="text-[11px] text-slate-300 px-1">{m.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 flex-shrink-0">
                  <i className="ri-sparkling-2-line text-white text-xs"></i>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          <div className="px-5 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask anything about your school..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex-shrink-0"
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 text-center">AI responses are based on your school data</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
