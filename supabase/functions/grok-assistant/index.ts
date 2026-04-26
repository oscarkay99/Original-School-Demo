import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = {
  role?: string;
  text?: string;
};

type StudentRow = {
  id: string;
  full_name: string;
  class_name: string;
  status?: string | null;
  fees_total?: number | null;
  avg_grade?: number | null;
  attendance_rate?: number | null;
  created_at?: string | null;
};

type PaymentRow = {
  id: string;
  student_id?: string | null;
  student_name?: string | null;
  amount?: number | null;
  date?: string | null;
  method?: string | null;
  receipt?: string | null;
};

type EventRow = {
  id: string;
  title: string;
  type?: string | null;
  date?: string | null;
  time?: string | null;
  venue?: string | null;
  status?: string | null;
};

type AttendanceRow = {
  id: string;
  student?: string | null;
  class_name?: string | null;
  date?: string | null;
  status?: string | null;
};

type GradeRow = {
  id: string;
  student?: string | null;
  class_name?: string | null;
  subject?: string | null;
  score?: number | null;
  term?: string | null;
  year?: string | null;
};

type InventoryRow = {
  id: string;
  item?: string | null;
  category?: string | null;
  quantity?: number | null;
  reorder_level?: number | null;
  status?: string | null;
};

type ReportCard = {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "warning";
};

type ReportSection = {
  title: string;
  items: string[];
};

type LiveContext = {
  summary: ReturnType<typeof buildLiveSummary>;
  attendance: ReturnType<typeof buildAttendanceInsights>;
  finance: ReturnType<typeof buildFinanceInsights>;
  events: ReturnType<typeof buildEventInsights>;
  grades: ReturnType<typeof buildGradeInsights>;
  inventory: ReturnType<typeof buildInventoryInsights>;
  report: ReturnType<typeof buildExecutiveReport>;
  source: "live_supabase";
};

function normalizeNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function currency(value: number) {
  return `GH\u20b5${value.toLocaleString()}`;
}

function inferFeeStatus(feesTotal: number, collected: number): "Paid" | "Pending" | "Overdue" {
  if (feesTotal <= 0 || collected >= feesTotal) return "Paid";
  if (collected <= 0) return "Overdue";
  return "Pending";
}

function lower(value: string) {
  return value.toLowerCase();
}

function hasAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function cleanName(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "Unnamed Student";
  return trimmed;
}

function topNames(items: Array<{ name: string }>, max = 4) {
  const names = items.slice(0, max).map((item) => item.name);
  if (!names.length) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function detectIntent(message: string) {
  const text = lower(message);
  const operational = {
    attendance: hasAny(text, ["attendance", "absent", "late", "present", "below 80"]),
    finance: hasAny(text, ["fee", "fees", "payment", "payments", "revenue", "finance", "outstanding", "overdue", "collection", "balance"]),
    events: hasAny(text, ["event", "events", "upcoming", "conference", "sports day", "exam"]),
    grades: hasAny(text, ["grade", "grades", "gpa", "score", "scores", "subject", "perform", "performance", "top"]),
    inventory: hasAny(text, ["inventory", "stock", "supplies", "reorder", "low stock"]),
    report: hasAny(text, ["report", "dashboard", "briefing", "executive summary", "generate report"]),
    summary: hasAny(text, ["summary", "overview", "status", "dashboard", "school", "what is going on"]),
  };
  const isOperational = Object.values(operational).some(Boolean);
  return {
    ...operational,
    greeting: !isOperational && hasAny(text, ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings"]),
    conversational: !isOperational && hasAny(text, ["thanks", "thank you", "great", "awesome", "okay", "ok", "understood", "perfect", "sounds good", "got it", "bye", "goodbye", "cheers", "appreciate"]),
    isOperational,
  };
}

function buildLiveSummary(students: StudentRow[], payments: PaymentRow[]) {
  const totalStudents = students.length;
  const activeStudents = students.filter((student) => (student.status ?? "Active") === "Active").length;
  const totalRevenue = students.reduce((sum, student) => sum + normalizeNumber(student.fees_total), 0);
  const collected = payments.reduce((sum, payment) => sum + normalizeNumber(payment.amount), 0);
  const outstanding = Math.max(totalRevenue - collected, 0);
  const feeCollectionRate = totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;
  const averageAttendance = students.length
    ? Math.round(students.reduce((sum, student) => sum + normalizeNumber(student.attendance_rate), 0) / students.length)
    : 0;
  const averageScore = students.length
    ? Math.round(students.reduce((sum, student) => sum + normalizeNumber(student.avg_grade), 0) / students.length)
    : 0;

  return {
    totalStudents,
    activeStudents,
    totalRevenue,
    collected,
    outstanding,
    feeCollectionRate,
    averageAttendance,
    averageScore,
  };
}

function buildAttendanceInsights(students: StudentRow[], attendanceRows: AttendanceRow[]) {
  const lowAttendanceStudents = students
    .map((student) => ({
      name: cleanName(student.full_name),
      className: student.class_name,
      attendance: normalizeNumber(student.attendance_rate),
      status: student.status ?? "Active",
    }))
    .filter((student) => student.attendance > 0 && student.attendance < 80)
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 10);

  const byDate = new Map<string, { date: string; present: number; absent: number; late: number; total: number }>();
  for (const row of attendanceRows) {
    if (!row.date) continue;
    const current = byDate.get(row.date) ?? { date: row.date, present: 0, absent: 0, late: 0, total: 0 };
    const status = lower(row.status ?? "");
    if (status === "present") current.present += 1;
    if (status === "absent") current.absent += 1;
    if (status === "late") current.late += 1;
    current.total += 1;
    byDate.set(row.date, current);
  }

  const recentAttendance = Array.from(byDate.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return {
    lowAttendanceStudents,
    recentAttendance,
  };
}

function buildFinanceInsights(students: StudentRow[], payments: PaymentRow[]) {
  const paidByStudent = new Map<string, number>();
  for (const payment of payments) {
    if (!payment.student_id) continue;
    paidByStudent.set(payment.student_id, (paidByStudent.get(payment.student_id) ?? 0) + normalizeNumber(payment.amount));
  }

  const outstandingStudents = students
    .map((student) => {
      const feesTotal = normalizeNumber(student.fees_total);
      const paid = paidByStudent.get(student.id) ?? 0;
      return {
        name: cleanName(student.full_name),
        className: student.class_name,
        feesTotal,
        paid,
        outstanding: Math.max(feesTotal - paid, 0),
        status: inferFeeStatus(feesTotal, paid),
      };
    })
    .filter((student) => student.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 10);

  const overdueStudents = outstandingStudents.filter((student) => student.status === "Overdue");

  // Year-by-year breakdown: { "2025": 12000, "2026": 8000 }
  const byYear = new Map<string, number>();
  for (const payment of payments) {
    if (!payment.date || !payment.amount) continue;
    const year = payment.date.slice(0, 4);
    byYear.set(year, (byYear.get(year) ?? 0) + normalizeNumber(payment.amount));
  }

  // Month-by-month breakdown for each year: { "2026-01": 3000, "2026-02": 5000 }
  const byMonth = new Map<string, number>();
  for (const payment of payments) {
    if (!payment.date || !payment.amount) continue;
    const month = payment.date.slice(0, 7); // "YYYY-MM"
    byMonth.set(month, (byMonth.get(month) ?? 0) + normalizeNumber(payment.amount));
  }

  const recentTransactions = payments
    .slice()
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 15)
    .map((payment) => ({
      student: cleanName(payment.student_name),
      amount: normalizeNumber(payment.amount),
      date: payment.date ?? "",
      method: payment.method ?? "Payment",
    }));

  return {
    overdueStudents,
    outstandingStudents,
    recentTransactions,
    byYear: Object.fromEntries(byYear),
    byMonth: Object.fromEntries(byMonth),
    totalCollected: payments.reduce((sum, p) => sum + normalizeNumber(p.amount), 0),
    totalPayments: payments.length,
  };
}

function buildEventInsights(events: EventRow[]) {
  return events
    .filter((event) => (event.status ?? "Upcoming").toLowerCase() === "upcoming")
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .slice(0, 10)
    .map((event) => ({
      title: event.title,
      date: event.date ?? "",
      time: event.time ?? "",
      type: event.type ?? "General",
      location: event.venue ?? "Main Hall",
    }));
}

function buildGradeInsights(students: StudentRow[], grades: GradeRow[]) {
  const ranked = students
    .map((student) => ({
      name: cleanName(student.full_name),
      className: student.class_name,
      avgScore: normalizeNumber(student.avg_grade),
      gpa: Number((normalizeNumber(student.avg_grade) / 100).toFixed(2)),
    }))
    .filter((s) => s.avgScore > 0)
    .sort((a, b) => b.avgScore - a.avgScore);

  const subjectMap = new Map<string, number[]>();
  for (const grade of grades) {
    if (!grade.subject || grade.score == null) continue;
    const scores = subjectMap.get(grade.subject) ?? [];
    scores.push(Number(grade.score));
    subjectMap.set(grade.subject, scores);
  }

  const subjectAverages = Array.from(subjectMap.entries())
    .map(([subject, scores]) => ({
      subject,
      average: Number((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)),
      count: scores.length,
    }))
    .sort((a, b) => a.average - b.average);

  return {
    allStudentsRanked: ranked,
    topStudents: ranked.slice(0, 5),
    bottomStudents: ranked.slice().reverse().slice(0, 5),
    lowestSubjects: subjectAverages.slice(0, 5),
    strongestSubjects: subjectAverages.slice().sort((a, b) => b.average - a.average).slice(0, 5),
  };
}

function buildInventoryInsights(items: InventoryRow[]) {
  return items
    .map((item) => ({
      name: item.item ?? "Untitled Item",
      category: item.category ?? "General",
      quantity: normalizeNumber(item.quantity),
      reorderLevel: normalizeNumber(item.reorder_level),
      status: item.status ?? "In Stock",
    }))
    .filter((item) => item.quantity <= item.reorderLevel || lower(item.status).includes("low") || lower(item.status).includes("critical"))
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10);
}

function buildExecutiveReport(liveContext: Omit<LiveContext, "report">) {
  const cards: ReportCard[] = [
    {
      label: "Students",
      value: `${liveContext.summary.activeStudents}/${liveContext.summary.totalStudents} active`,
      tone: "neutral",
    },
    {
      label: "Attendance",
      value: `${liveContext.summary.averageAttendance}% average`,
      tone: liveContext.summary.averageAttendance >= 90 ? "positive" : liveContext.summary.averageAttendance >= 75 ? "neutral" : "warning",
    },
    {
      label: "Fee Collection",
      value: `${liveContext.summary.feeCollectionRate}% collected`,
      tone: liveContext.summary.feeCollectionRate >= 70 ? "positive" : liveContext.summary.feeCollectionRate >= 45 ? "neutral" : "warning",
    },
    {
      label: "Outstanding Fees",
      value: currency(liveContext.summary.outstanding),
      tone: liveContext.summary.outstanding > 0 ? "warning" : "positive",
    },
  ];

  const sections: ReportSection[] = [
    {
      title: "Academic Highlights",
      items: [
        liveContext.grades.topStudents.length
          ? `Top performers currently include ${topNames(liveContext.grades.topStudents)}.`
          : "No academic ranking data is available yet.",
        liveContext.grades.lowestSubjects.length
          ? `Subjects needing the most support are ${liveContext.grades.lowestSubjects.map((item) => item.subject).join(", ")}.`
          : "Subject-level grade data is limited at the moment.",
      ],
    },
    {
      title: "Attendance Watchlist",
      items: [
        liveContext.attendance.lowAttendanceStudents.length
          ? `${liveContext.attendance.lowAttendanceStudents.length} students are currently below 80% attendance.`
          : "No students are currently flagged below the 80% attendance threshold.",
        liveContext.attendance.recentAttendance[0]
          ? `The most recent attendance record shows ${liveContext.attendance.recentAttendance[0].present} present, ${liveContext.attendance.recentAttendance[0].absent} absent, and ${liveContext.attendance.recentAttendance[0].late} late.`
          : "No recent attendance entries are available.",
      ],
    },
    {
      title: "Finance Snapshot",
      items: [
        `The school has collected ${currency(liveContext.summary.collected)} out of ${currency(liveContext.summary.totalRevenue)} expected revenue.`,
        liveContext.finance.outstandingStudents.length
          ? `${liveContext.finance.outstandingStudents.length} students still have outstanding balances.`
          : "There are no outstanding balances at the moment.",
      ],
    },
    {
      title: "Operations",
      items: [
        liveContext.events.length
          ? `${liveContext.events.length} upcoming events are currently scheduled.`
          : "There are no upcoming events on the calendar right now.",
        liveContext.inventory.length
          ? `${liveContext.inventory.length} inventory items need restocking attention.`
          : "No inventory items are currently flagged for urgent restocking.",
      ],
    },
  ];

  const generatedAt = new Date().toISOString();
  const headline = "Executive School Report";
  const summary = `The school currently has ${liveContext.summary.totalStudents} students, an average attendance rate of ${liveContext.summary.averageAttendance}%, and a fee collection rate of ${liveContext.summary.feeCollectionRate}%.`;

  return {
    headline,
    summary,
    generatedAt,
    cards,
    sections,
  };
}

const greetingReplies = [
  "Hello! What would you like to check on today — students, attendance, fees, or something else?",
  "Hi there! Ready to help. What do you need to look into?",
  "Hey! What can I pull up for you today?",
];

const conversationalReplies = [
  "Of course! Let me know if there's anything else you'd like to check.",
  "Happy to help. Is there anything else you need?",
  "Glad I could assist. Feel free to ask anything else.",
];

function buildDeterministicResponse(message: string, liveContext: LiveContext) {
  const intent = detectIntent(message);

  if (intent.greeting) {
    const reply = greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
    return { text: reply };
  }

  if (intent.conversational) {
    const reply = conversationalReplies[Math.floor(Math.random() * conversationalReplies.length)];
    return { text: reply };
  }

  if (intent.report) {
    return {
      text: `Here’s the latest executive overview. The school has ${liveContext.summary.totalStudents} students, ${liveContext.summary.averageAttendance}% average attendance, and a ${liveContext.summary.feeCollectionRate}% fee collection rate.`,
      includeReport: true,
    };
  }

  return null;
}

async function fetchLiveContext(message: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error: "Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` for live assistant queries.",
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [studentsRes, paymentsRes, attendanceRes, eventsRes, gradesRes, inventoryRes] = await Promise.all([
    supabase.from("students").select("id, full_name, class_name, status, fees_total, avg_grade, attendance_rate, created_at"),
    supabase.from("payments").select("id, student_id, student_name, amount, date, method, receipt").order("date", { ascending: false }),
    supabase.from("attendance").select("id, student, class_name, date, status").order("date", { ascending: false }),
    supabase.from("events").select("id, title, type, date, time, venue, status").order("date", { ascending: true }),
    supabase.from("grades").select("id, student, class_name, subject, score, term, year").order("created_at", { ascending: false }),
    supabase.from("inventory").select("id, item, category, quantity, reorder_level, status").order("created_at", { ascending: false }),
  ]);

  const firstError = [studentsRes, paymentsRes, attendanceRes, eventsRes, gradesRes, inventoryRes].find((r) => r.error)?.error;
  if (firstError) {
    return { error: firstError.message };
  }

  const students = (studentsRes.data as StudentRow[]) ?? [];
  const payments = (paymentsRes.data as PaymentRow[]) ?? [];
  const attendance = (attendanceRes.data as AttendanceRow[]) ?? [];
  const events = (eventsRes.data as EventRow[]) ?? [];
  const grades = (gradesRes.data as GradeRow[]) ?? [];
  const inventory = (inventoryRes.data as InventoryRow[]) ?? [];

  const partialContext = {
    summary: buildLiveSummary(students, payments),
    attendance: buildAttendanceInsights(students, attendance),
    finance: buildFinanceInsights(students, payments),
    events: buildEventInsights(events),
    grades: buildGradeInsights(students, grades),
    inventory: buildInventoryInsights(inventory),
    source: "live_supabase" as const,
  };

  return {
    ...partialContext,
    report: buildExecutiveReport(partialContext),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    const xaiApiKey = Deno.env.get("XAI_API_KEY");
    if (!groqApiKey && !xaiApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing `GROQ_API_KEY` or `XAI_API_KEY` secret for the AI assistant." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { message, conversation = [], context } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "A user message is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const liveContext = await fetchLiveContext(message);
    if ("error" in liveContext) {
      return new Response(
        JSON.stringify({ error: liveContext.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const deterministic = buildDeterministicResponse(message, liveContext);
    if (deterministic) {
      return new Response(
        JSON.stringify({
          text: deterministic.text,
          provider: "hybrid",
          source: liveContext.source,
          report: deterministic.includeReport ? liveContext.report : null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = [
      "You are EduManage AI, a school operations assistant for administrators.",
      "Today's date: " + new Date().toISOString().slice(0, 10),
      "",
      "REASONING RULES — follow these precisely:",
      "1. Read the question carefully. Identify the exact metric being asked: best vs worst, a total vs a filtered subset, a year vs all-time, a single student vs a group.",
      "2. Use the live context data below — it is authoritative. Do not guess or substitute a related answer.",
      "",
      "FINANCE RULES (critical):",
      "  — 'How much collected in [YEAR]': look up finance.byYear[\"YEAR\"] — e.g. finance.byYear[\"2026\"]. State that exact value.",
      "  — 'How much collected in [MONTH] [YEAR]': look up finance.byMonth[\"YYYY-MM\"] — e.g. finance.byMonth[\"2026-03\"].",
      "  — 'Total collected' or 'all-time collected': use finance.totalCollected.",
      "  — 'Outstanding fees': sum of finance.outstandingStudents[*].outstanding, or use summary.outstanding.",
      "  — 'Overdue students': list finance.overdueStudents.",
      "  — If a year key is missing from finance.byYear, say 'No payments were recorded for [YEAR]' — do not say 'data not available'.",
      "",
      "ACADEMIC RULES:",
      "  — 'Least/worst performing student': use grades.allStudentsRanked — the LAST entry (lowest avgScore).",
      "  — 'Top/best performing student': use grades.topStudents — the FIRST entry (highest avgScore).",
      "  — 'Weakest subject': use grades.lowestSubjects[0].subject.",
      "  — 'Strongest subject': use grades.strongestSubjects[0].subject.",
      "",
      "ATTENDANCE RULES:",
      "  — 'Lowest attendance student': attendance.lowAttendanceStudents — sorted ascending, first entry is lowest.",
      "  — 'Students below 80%': count attendance.lowAttendanceStudents.",
      "",
      "GENERAL RULES:",
      "  — Any ranking or superlative: sort by the right metric and pick the correct extreme.",
      "  — Comparison question: look up both values and state the difference explicitly.",
      "  — Never mention Supabase, JSON, database queries, prompts, or model internals.",
      "  — Answer directly. Never open with 'Based on the data', 'According to the context', or similar filler.",
      "  — Be concise: 1-3 sentences for simple questions, a short list for multi-part questions.",
      "",
      "WHEN DATA IS MISSING OR ZERO:",
      "  — Do NOT just say 'no data available' and stop. Always pivot to the most useful related fact you DO have.",
      "  — Example: asked about 2026 fees but byYear has no 2026 key → say 'No payments are recorded for 2026 yet. The closest year on record is [most recent year in byYear] with [amount] collected.'",
      "  — Example: asked about a specific student not in the data → name the closest match or say who the top/bottom students are.",
      "  — Example: asked about a subject not in grades → list the subjects that ARE recorded.",
      "  — Always end with a helpful next step or the closest available fact.",
      "",
      "WHEN THE QUESTION IS UNCLEAR OR AMBIGUOUS:",
      "  — Do NOT guess silently. Ask one short clarifying question.",
      "  — Example: 'fees collected this term' but no term is defined → ask 'Which term are you referring to — Term 1, 2, or 3?'",
      "  — Example: 'how is the school doing' is vague → briefly summarise the top 2-3 metrics and ask 'Would you like me to go deeper on any of these?'",
      "  — Keep the clarifying question to one sentence. Do not ask multiple questions at once.",
      "",
      "TONE:",
      "  — Operational question: focused, professional, data-driven.",
      "  — Casual / greeting: warm, brief, one sentence — no data.",
      "",
      "=== LIVE SCHOOL DATA (authoritative) ===",
      JSON.stringify(liveContext ?? {}, null, 2),
      "",
      "=== FRONTEND CONTEXT (supplementary) ===",
      JSON.stringify(context ?? {}, null, 2),
    ].join("\n");

    const input = [
      { role: "system", content: systemPrompt },
      ...(conversation as ChatMessage[])
        .slice(-8)
        .filter((entry) => entry?.role && entry?.text)
        .map((entry) => ({
          role: entry.role === "assistant" ? "assistant" : "user",
          content: entry.text as string,
        })),
      { role: "user", content: message },
    ];

    const provider = groqApiKey ? "groq" : "xai";
    const response = await fetch(
      provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider === "groq" ? groqApiKey : xaiApiKey}`,
        },
        body: JSON.stringify(
          provider === "groq"
            ? {
                model: Deno.env.get("GROQ_MODEL") ?? "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: input,
                temperature: 0.2,
                stream: false,
              }
            : {
                model: Deno.env.get("XAI_MODEL") ?? "grok-4.20-reasoning",
                input,
                stream: false,
              },
        ),
      },
    );

    const payload = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: payload?.error?.message ?? `${provider.toUpperCase()} request failed.` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const outputText =
      provider === "groq"
        ? payload?.choices?.[0]?.message?.content ?? "I couldn't generate a response."
        : payload?.output
            ?.find((item: { type?: string }) => item.type === "message")
            ?.content?.find((item: { type?: string }) => item.type === "output_text")
            ?.text ?? "I couldn't generate a response.";

    return new Response(
      JSON.stringify({
        text: outputText,
        provider,
        source: liveContext.source,
        model:
          provider === "groq"
            ? payload?.model ?? Deno.env.get("GROQ_MODEL") ?? "meta-llama/llama-4-scout-17b-16e-instruct"
            : Deno.env.get("XAI_MODEL") ?? "grok-4.20-reasoning",
        responseId: payload?.id ?? null,
        usage: payload?.usage ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected AI assistant error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
