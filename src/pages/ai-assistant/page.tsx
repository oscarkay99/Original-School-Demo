import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import AppLayout from "@/components/feature/AppLayout";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
  actions?: ActionNotice[];
  suggestions?: string[];
  status?: string;
  streaming?: boolean;
}

interface ActionNotice {
  name: string;
  summary: string;
}

interface GeneratedReport {
  headline: string;
  summary: string;
  generatedAt: string;
  cards: Array<{ label: string; value: string; tone: "neutral" | "positive" | "warning" }>;
  sections: Array<{ title: string; items: string[] }>;
}

// ─── constants ────────────────────────────────────────────────────────────────

const suggestions = [
  "Which students have attendance below 80%?",
  "Show me the top 5 performing students this term",
  "What is the current fee collection rate?",
  "List all upcoming events this month",
  "Which subjects have the lowest average scores?",
  "How many students have overdue fees?",
];

const capabilityActions = [
  { icon: "ri-user-3-line", label: "Student Analytics", prompt: "Give me a student performance overview." },
  { icon: "ri-calendar-check-line", label: "Attendance Insights", prompt: "Give me an attendance overview and flag students below 80%." },
  { icon: "ri-money-dollar-circle-line", label: "Finance Reports", prompt: "Summarize the current fee collection and outstanding balances." },
  { icon: "ri-bar-chart-2-line", label: "Grade Analysis", prompt: "Show me the current academic performance summary and weakest subjects." },
  { icon: "ri-calendar-event-line", label: "Event Planning", prompt: "List the next upcoming events and any scheduling priorities." },
  { icon: "ri-archive-drawer-line", label: "Inventory Alerts", prompt: "What inventory items need urgent attention right now?" },
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "Good day! I'm here to help you review attendance, academics, fees, events, and day-to-day school operations. I can also take actions — record payments, schedule events, send notifications, and more. How can I assist you today?",
    time: "Now",
  },
];

const toneColors: Record<string, { bg: string; text: string; bar: string }> = {
  neutral: { bg: "#f8fafc", text: "#1e293b", bar: "#94a3b8" },
  positive: { bg: "#f0fdf4", text: "#15803d", bar: "#22c55e" },
  warning: { bg: "#fffbeb", text: "#b45309", bar: "#f59e0b" },
};

const ACTION_ICONS: Record<string, string> = {
  create_notification: "ri-notification-3-line",
  flag_student: "ri-flag-line",
  record_payment: "ri-bank-card-line",
  schedule_event: "ri-calendar-event-line",
};

// ─── session id ───────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem("edu_ai_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("edu_ai_session_id", sid);
  }
  return sid;
}

// ─── report helpers ───────────────────────────────────────────────────────────

function buildPrintHtml(report: GeneratedReport, query: string): string {
  const formattedDate = new Date(report.generatedAt).toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const cardsHtml = report.cards
    .map((card) => {
      const c = toneColors[card.tone] ?? toneColors.neutral;
      return `<div style="flex:1;min-width:140px;background:${c.bg};border-radius:12px;padding:16px 18px;border-top:3px solid ${c.bar};">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:6px;">${card.label}</div>
        <div style="font-size:22px;font-weight:700;color:${c.text};">${card.value}</div>
      </div>`;
    })
    .join("");
  const sectionsHtml = report.sections
    .map(
      (sec) => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;">
        <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #f1f5f9;">${sec.title}</div>
        <ul style="margin:0;padding:0;list-style:none;">
          ${sec.items.map((item) => `<li style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;font-size:12px;color:#475569;line-height:1.6;"><span style="color:#7c3aed;margin-top:3px;flex-shrink:0;">&#9679;</span>${item}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${report.headline}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;}@media print{body{background:#fff;}}</style>
  </head><body><div style="max-width:900px;margin:0 auto;padding:40px 32px;">
  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:16px;padding:28px 32px;color:#fff;margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
      <div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;opacity:.7;margin-bottom:6px;">Executive Report</div>
      <div style="font-size:22px;font-weight:800;">${report.headline}</div>
      <div style="font-size:13px;opacity:.8;margin-top:8px;">${report.summary}</div></div>
      <div style="text-align:right;flex-shrink:0;"><div style="font-size:10px;opacity:.6;margin-bottom:4px;">Generated</div><div style="font-size:12px;font-weight:600;">${formattedDate}</div></div>
    </div>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.2);">
      <span style="font-size:10px;opacity:.6;text-transform:uppercase;letter-spacing:.06em;">In response to &nbsp;</span>
      <span style="font-size:12px;font-style:italic;opacity:.9;">"${query}"</span>
    </div>
  </div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:24px;">${cardsHtml}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px;">${sectionsHtml}</div>
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;">
    <span style="font-size:11px;color:#94a3b8;">EduManage Intelligence — Confidential</span>
    <span style="font-size:11px;color:#94a3b8;">${formattedDate}</span>
  </div></div></body></html>`;
}

function getReportCardPrompt(label: string) {
  const map: Record<string, string> = {
    Students: "Give me a student overview with any important concerns.",
    Attendance: "Give me a detailed attendance breakdown and highlight students at risk.",
    "Fee Collection": "Give me a detailed finance update on collections and balances.",
    "Outstanding Fees": "List the students with outstanding fees and the most urgent follow-up cases.",
  };
  return map[label] ?? `Expand on this report metric: ${label}.`;
}

function getReportSectionPrompt(title: string) {
  const map: Record<string, string> = {
    "Academic Highlights": "Expand the academic highlights and identify the top performers and weakest subjects.",
    "Attendance Watchlist": "Expand the attendance watchlist and tell me who needs intervention first.",
    "Finance Snapshot": "Expand the finance snapshot and show the most urgent fee follow-up items.",
    Operations: "Expand the operations summary and show upcoming events and inventory priorities.",
  };
  return map[title] ?? `Expand this report section: ${title}.`;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [reportQuery, setReportQuery] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getOrCreateSessionId());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim(), time: "Just now" };
    const streamId = Date.now() + 1;
    const streamingMsg: Message = { id: streamId, role: "assistant", text: "", time: "Just now", streaming: true };

    setMessages((prev) => [...prev, userMsg, streamingMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/grok-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          session_id: sessionId.current,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const pendingActions: ActionNotice[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              content?: string;
              data?: GeneratedReport;
              name?: string;
              summary?: string;
              message?: string;
            };

            if (event.type === "report" && event.data) {
              setReport(event.data);
              setReportQuery(text.trim());
            } else if (event.type === "action" && event.name && event.summary) {
              pendingActions.push({ name: event.name, summary: event.summary });
            } else if (event.type === "token" && event.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamId
                    ? { ...m, text: m.text + event.content, status: undefined }
                    : m,
                ),
              );
            } else if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== streamId) return m;
                  // Parse and strip FOLLOW_UPS line from displayed text
                  const followMatch = m.text.match(/\nFOLLOW_UPS:\s*(.+)$/s);
                  const suggestions = followMatch
                    ? followMatch[1].split("|").map((s) => s.trim().replace(/^\[|\]$/g, "").trim()).filter((s) => s.length > 0 && s.length < 80)
                    : [];
                  const cleanText = m.text.replace(/\nFOLLOW_UPS:.*$/s, "").trim();
                  return {
                    ...m,
                    text: cleanText,
                    streaming: false,
                    status: undefined,
                    suggestions: suggestions.length ? suggestions : undefined,
                    actions: pendingActions.length ? pendingActions : undefined,
                  };
                }),
              );
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }

      // Finalize in case "done" event was missed
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== streamId) return m;
          const followMatch = m.text.match(/\nFOLLOW_UPS:\s*(.+)$/s);
          const suggestions = followMatch
            ? followMatch[1].split("|").map((s) => s.trim().replace(/^\[|\]$/g, "").trim()).filter((s) => s.length > 0 && s.length < 80)
            : [];
          const cleanText = m.text.replace(/\nFOLLOW_UPS:.*$/s, "").trim();
          return {
            ...m,
            text: cleanText,
            streaming: false,
            status: undefined,
            suggestions: suggestions.length ? suggestions : undefined,
            actions: pendingActions.length ? pendingActions : undefined,
          };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI assistant request failed.");
      setMessages((prev) => prev.filter((m) => m.id !== streamId));
      setMessages((prev) => [
        ...prev,
        {
          id: streamId,
          role: "assistant",
          text: "I couldn't reach the AI service. Please check that ANTHROPIC_API_KEY (or GROQ_API_KEY) is set in your Supabase edge function secrets, then try again.",
          time: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const downloadReport = () => {
    if (!report) return;
    const html = buildPrintHtml(report, reportQuery);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) return;
    win.addEventListener("load", () => {
      win.focus();
      win.print();
      URL.revokeObjectURL(url);
    });
  };

  const reportToneStyles: Record<GeneratedReport["cards"][number]["tone"], string> = {
    neutral: "bg-slate-50 text-slate-800 border-slate-200",
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const reportToneBars: Record<GeneratedReport["cards"][number]["tone"], string> = {
    neutral: "border-t-slate-300",
    positive: "border-t-emerald-400",
    warning: "border-t-amber-400",
  };

  return (
    <AppLayout title="AI Assistant" subtitle="Powered by EduManage Intelligence">
      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">
        {/* Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50">
                <i className="ri-sparkling-2-line text-violet-500 text-base"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Quick Prompts</p>
                <p className="text-[11px] text-slate-400">Click to ask</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="w-full text-left text-[11px] text-slate-600 px-3 py-2 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-violet-700 border border-transparent hover:border-violet-100 transition-all cursor-pointer leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-800 mb-1">Capabilities</p>
            <p className="text-[11px] text-slate-400 mb-3">Ask or take action</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {capabilityActions.map((c) => (
                <button
                  key={c.label}
                  onClick={() => void send(c.prompt)}
                  className="flex items-center gap-2 text-xs text-slate-500 rounded-lg px-2.5 py-2 text-left hover:bg-violet-50 hover:text-violet-700 transition-all cursor-pointer"
                >
                  <i className={`${c.icon} text-violet-400 text-sm`}></i>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action examples */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-800 mb-2">Actions</p>
            <div className="space-y-1.5">
              {[
                { icon: "ri-bank-card-line", label: "Record a payment", prompt: "Record a payment of GH₵500 for Kwame Asare — search for the student first." },
                { icon: "ri-flag-line", label: "Flag a student", prompt: "Flag the student with the lowest attendance as Inactive." },
                { icon: "ri-notification-3-line", label: "Send notification", prompt: "Create a high-priority notification: 'Fee payment deadline is this Friday.'" },
                { icon: "ri-calendar-event-line", label: "Schedule event", prompt: "Schedule a Parent-Teacher Meeting for 2026-05-10 at 10:00 in the Main Hall." },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => void send(a.prompt)}
                  className="w-full flex items-center gap-2 text-[11px] text-slate-500 px-2.5 py-2 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-all cursor-pointer text-left"
                >
                  <i className={`${a.icon} text-violet-400 text-xs flex-shrink-0`}></i>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden min-h-[520px]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600">
                <i className="ri-sparkling-2-line text-white text-base"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">EduManage AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-xs text-slate-400">Online and ready to assist</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const newSid = crypto.randomUUID();
                localStorage.setItem("edu_ai_session_id", newSid);
                sessionId.current = newSid;
                setMessages(initialMessages);
                setReport(null);
                setReportQuery("");
                setError(null);
              }}
              title="Start new conversation"
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-violet-600 px-2.5 py-1.5 rounded-lg hover:bg-violet-50 transition-all cursor-pointer"
            >
              <i className="ri-refresh-line text-sm"></i>
              New chat
            </button>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Report Dashboard */}
            {report && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Executive Report Dashboard</p>
                      <p className="text-base font-bold text-white leading-snug">{report.headline}</p>
                      <p className="text-xs text-white/75 mt-1.5 leading-relaxed">{report.summary}</p>
                    </div>
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <i className="ri-download-2-line text-sm"></i>
                      Download PDF
                    </button>
                  </div>
                  {reportQuery && (
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-start gap-2">
                      <i className="ri-chat-3-line text-white/50 text-xs mt-0.5 flex-shrink-0"></i>
                      <p className="text-[11px] text-white/70 italic leading-relaxed truncate">"{reportQuery}"</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-slate-100">
                  {report.cards.map((card) => (
                    <button
                      key={card.label}
                      onClick={() => void send(getReportCardPrompt(card.label))}
                      className={`p-4 border-t-[3px] ${reportToneStyles[card.tone]} ${reportToneBars[card.tone]} cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      <p className="text-[10px] uppercase tracking-wide opacity-60 mb-1">{card.label}</p>
                      <p className="text-xl font-bold">{card.value}</p>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-slate-100">
                  {report.sections.map((section) => (
                    <button
                      key={section.title}
                      onClick={() => void send(getReportSectionPrompt(section.title))}
                      className="bg-white p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">{section.title}</p>
                      <ul className="space-y-2">
                        {section.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                            <span className="text-violet-400 mt-1 flex-shrink-0">&#9679;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
                <div className="bg-slate-50 px-5 py-2.5 flex items-center justify-between border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">EduManage Intelligence &mdash; Confidential</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(report.generatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${
                    m.role === "assistant" ? "bg-violet-600" : "bg-slate-800"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <i className="ri-sparkling-2-line text-white text-xs"></i>
                  ) : (
                    <span className="text-white text-xs font-bold">ON</span>
                  )}
                </div>
                <div className={`max-w-[75%] flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Action notices */}
                  {m.actions?.map((a) => (
                    <div
                      key={a.summary}
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium px-3 py-1.5 rounded-lg"
                    >
                      <i className={`${ACTION_ICONS[a.name] ?? "ri-check-line"} text-sm`}></i>
                      {a.summary}
                    </div>
                  ))}

                  <div
                    className={`group relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "assistant"
                        ? "bg-slate-50 text-slate-700 rounded-tl-sm border border-slate-100"
                        : "bg-violet-600 text-white rounded-tr-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1.5 prose-strong:text-slate-800">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                        {m.streaming && (
                          <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />
                        )}
                      </div>
                    ) : (
                      <span className="whitespace-pre-line">{m.text}</span>
                    )}

                    {/* Copy button — appears on hover for assistant messages */}
                    {m.role === "assistant" && !m.streaming && m.text && (
                      <button
                        onClick={() => void navigator.clipboard.writeText(m.text)}
                        title="Copy"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <i className="ri-file-copy-line text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Follow-up suggestion chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5 max-w-full">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => void send(s)}
                          className="text-[11px] text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full hover:bg-violet-100 hover:border-violet-200 transition-colors cursor-pointer leading-none"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-300 px-1">{m.time}</p>
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.streaming !== true && (
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
                onKeyDown={(e) => e.key === "Enter" && void send(input)}
                placeholder="Ask anything or give a command..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => void send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex-shrink-0"
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 text-center">
              Responses are generated securely using live school data
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
