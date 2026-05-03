import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── types ───────────────────────────────────────────────────────────────────

type StudentRow = {
  id: string;
  full_name: string;
  class_name: string;
  status?: string | null;
  fees_total?: number | null;
  avg_grade?: number | null;
  attendance_rate?: number | null;
};

type PaymentRow = {
  id: string;
  student_id?: string | null;
  student_name?: string | null;
  amount?: number | null;
  date?: string | null;
  method?: string | null;
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
  subject?: string | null;
  score?: number | null;
  term?: string | null;
  year?: string | null;
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

type InventoryRow = {
  id: string;
  item?: string | null;
  category?: string | null;
  quantity?: number | null;
  reorder_level?: number | null;
  status?: string | null;
};

type ReportCard = { label: string; value: string; tone: "neutral" | "positive" | "warning" };
type ReportSection = { title: string; items: string[] };
type ExecutiveReport = {
  headline: string;
  summary: string;
  generatedAt: string;
  cards: ReportCard[];
  sections: ReportSection[];
};

type ActionRecord = { name: string; summary: string };
type AppRole = "Admin" | "Teacher" | "Parent" | "Accountant" | "Secretary" | "User";
type UserContext = {
  userId: string;
  email: string;
  role: AppRole;
  name: string;
  teacherClassName?: string | null;
  teacherSubject?: string | null;
};

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[] | Array<{ type: "tool_result"; tool_use_id: string; content: string }>;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function n(v: number | null | undefined) { return Number(v ?? 0); }
function currency(v: number) { return `GH₵${v.toLocaleString()}`; }
function lower(v: string) { return v.toLowerCase(); }
function topNames(items: Array<{ name: string }>, max = 4) {
  const names = items.slice(0, max).map((i) => i.name);
  if (!names.length) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function normalizeRole(role?: string | null): AppRole {
  const normalized = lower((role ?? "").trim());
  if (normalized === "admin" || normalized === "administrator") return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  if (normalized.includes("parent")) return "Parent";
  if (normalized.includes("account")) return "Accountant";
  if (normalized.includes("secretary") || normalized.includes("reception")) return "Secretary";
  return "User";
}

function getAllowedToolNames(role: AppRole) {
  switch (role) {
    case "Admin":
      return TOOLS.map((tool) => tool.name);
    case "Teacher":
      return ["search_students", "get_attendance_records", "get_grades"];
    case "Parent":
      return ["search_students", "get_attendance_records", "get_grades", "get_events"];
    case "Accountant":
      return ["get_school_summary", "search_students", "get_payments", "get_inventory", "record_payment"];
    case "Secretary":
      return ["search_students", "get_attendance_records", "get_events", "get_inventory", "create_notification", "flag_student", "schedule_event"];
    default:
      return [];
  }
}

function buildRoleSystemPrompt(ctx: UserContext) {
  const roleInstructions: Record<AppRole, string[]> = {
    Admin: [
      "- You may answer across academics, operations, events, inventory, finance, and school-wide performance.",
      "- Keep sensitive details purposeful and concise.",
    ],
    Teacher: [
      "- You are restricted to academic/classroom support only.",
      "- Never answer about fees, payments, payroll, inventory, accounts, or school events.",
      "- Only discuss students, attendance, and grades for the teacher's assigned class and subject.",
    ],
    Parent: [
      "- You are restricted to the parent's own linked student records only.",
      "- Never reveal school-wide student data, staff data, finance totals, payroll, inventory, or admin information.",
      "- You may discuss the parent's linked student's grades, attendance, fee-related status, and public school events.",
    ],
    Accountant: [
      "- You are restricted to finance and payment operations.",
      "- Never answer about grades, classroom performance, teacher-only academic analysis, payroll beyond finance summaries, or admin-only user management.",
      "- You may discuss payments, balances, fee collection, and basic student/payment matching context.",
    ],
    Secretary: [
      "- You are restricted to front-office operations.",
      "- You may discuss students, attendance support, events, notifications, and inventory operations.",
      "- Never answer about fee collection totals, payment history, payroll, accounts, or detailed academic performance analysis.",
    ],
    User: [
      "- You have no privileged data access.",
      "- Refuse all school data requests politely.",
    ],
  };

  const teacherScope = ctx.role === "Teacher"
    ? `- Assigned class scope: ${ctx.teacherClassName ?? "unassigned"}.\n- Assigned subject scope: ${ctx.teacherSubject ?? "unassigned"}.`
    : "";

  return [
    "You are EduManage AI, a school operations assistant.",
    `Today's date: ${new Date().toISOString().slice(0, 10)}`,
    `Current user role: ${ctx.role}`,
    `Current user email: ${ctx.email}`,
    teacherScope,
    "",
    "ROLE BOUNDARIES (strictly enforce):",
    ...roleInstructions[ctx.role],
    "- If a user asks for data outside their role, refuse briefly and suggest a role-appropriate alternative.",
    "",
    "RESPONSE RULES (strictly follow):",
    "- Maximum 2 sentences for simple questions. Maximum 5 bullet points for lists. Never longer.",
    "- Use **bold** only for names and key numbers.",
    "- No filler: no 'Sure!', 'Great question', 'Based on the data', 'According to', or similar openers.",
    "- If the requested data is not in the tool result, say 'I don't have that information.' — never guess or estimate.",
    "- Do NOT mention tools, databases, queries, or any internal process.",
    "- For ambiguous questions, ask one short clarifying question.",
    "",
    "TOOL RULES:",
    "- Always call a tool before answering unless you are refusing for role restrictions.",
    "- Only use tools that are allowed for the current user role.",
    "- After EVERY operational response append: FOLLOW_UPS: [question 1] | [question 2] | [question 3] (max 55 chars each).",
    "",
    "WRITE CONFIRMATION:",
    "- For create_notification, flag_student, record_payment, schedule_event:",
    "  1. Confirm the requested target and scope first.",
    "  2. Describe what you will do in one sentence and ask the user to confirm.",
    "  3. Only perform the write after the user says yes/confirm/proceed.",
  ].filter(Boolean).join("\n");
}

function forbiddenResult(role: AppRole, capability: string) {
  return {
    result: {
      error: `${role} role is not allowed to access ${capability}.`,
    },
  };
}

// ─── tool definitions (Anthropic format) ─────────────────────────────────────

const TOOLS = [
  // ── READ ──
  {
    name: "get_school_summary",
    description: "High-level snapshot: total/active students, fee collection rate, outstanding fees, average attendance and score.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "search_students",
    description: "Search and filter students. Use for counts, rankings, attendance/grade filters, or looking up a specific student.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", description: "'Active' or 'Inactive'" },
        min_attendance: { type: "number" },
        max_attendance: { type: "number" },
        min_grade: { type: "number" },
        max_grade: { type: "number" },
        class_name: { type: "string", description: "Partial class name match" },
        name_contains: { type: "string", description: "Partial student name match" },
        sort_by: { type: "string", description: "'attendance_rate', 'avg_grade', 'fees_total', or 'full_name'" },
        sort_order: { type: "string", description: "'asc' or 'desc'" },
        limit: { type: "number", description: "Default 20" },
      },
      required: [],
    },
  },
  {
    name: "get_attendance_records",
    description: "Daily attendance records. Use for who was absent, attendance on a specific date, or daily trends.",
    input_schema: {
      type: "object",
      properties: {
        student_name: { type: "string" },
        class_name: { type: "string" },
        date_from: { type: "string", description: "YYYY-MM-DD" },
        date_to: { type: "string", description: "YYYY-MM-DD" },
        status: { type: "string", description: "'Present', 'Absent', or 'Late'" },
        limit: { type: "number", description: "Default 30" },
      },
      required: [],
    },
  },
  {
    name: "get_grades",
    description: "Grade records. Use for subject averages, student scores, top/bottom academic performers.",
    input_schema: {
      type: "object",
      properties: {
        student_name: { type: "string" },
        subject: { type: "string" },
        class_name: { type: "string" },
        term: { type: "string" },
        year: { type: "string" },
        min_score: { type: "number" },
        max_score: { type: "number" },
        limit: { type: "number", description: "Default 30" },
      },
      required: [],
    },
  },
  {
    name: "get_payments",
    description: "Fee payment records. Use for year/month collection totals, student payment history, or outstanding balances.",
    input_schema: {
      type: "object",
      properties: {
        student_name: { type: "string" },
        date_from: { type: "string", description: "YYYY-MM-DD" },
        date_to: { type: "string", description: "YYYY-MM-DD" },
        method: { type: "string" },
        min_amount: { type: "number" },
        limit: { type: "number", description: "Default 30" },
      },
      required: [],
    },
  },
  {
    name: "get_events",
    description: "School events. Use for upcoming schedule, past events, or events by type.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", description: "'Upcoming', 'Completed', or 'Cancelled'" },
        type: { type: "string" },
        date_from: { type: "string", description: "YYYY-MM-DD" },
        date_to: { type: "string", description: "YYYY-MM-DD" },
        limit: { type: "number", description: "Default 10" },
      },
      required: [],
    },
  },
  {
    name: "get_inventory",
    description: "Inventory items. Use for stock levels, items needing reorder, or category queries.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        status: { type: "string" },
        low_stock_only: { type: "boolean", description: "Only items at or below reorder level" },
        limit: { type: "number", description: "Default 20" },
      },
      required: [],
    },
  },
  {
    name: "generate_executive_report",
    description: "Build a full executive report dashboard with KPI cards and summary sections. Call when user asks for a report, dashboard, briefing, or executive summary.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  // ── WRITE ──
  {
    name: "create_notification",
    description: "Create a notification or alert. ONLY call this when the user explicitly asks to send, create, or post a notification.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short notification title" },
        message: { type: "string", description: "Notification body text" },
        type: { type: "string", description: "'info', 'warning', 'success', or 'alert'" },
        priority: { type: "string", description: "'low', 'medium', or 'high'" },
      },
      required: ["title", "message"],
    },
  },
  {
    name: "flag_student",
    description: "Update a student's status or flag them for follow-up. ONLY call when user explicitly asks to flag, update, or change a student's status.",
    input_schema: {
      type: "object",
      properties: {
        student_id: { type: "string", description: "UUID from search_students result" },
        student_name: { type: "string", description: "Student full name (for confirmation message)" },
        status: { type: "string", description: "'Active', 'Inactive', or 'Flagged'" },
        reason: { type: "string", description: "Optional reason for the status change" },
      },
      required: ["student_id", "student_name", "status"],
    },
  },
  {
    name: "record_payment",
    description: "Record a fee payment for a student. ONLY call when user explicitly asks to record, log, or add a payment.",
    input_schema: {
      type: "object",
      properties: {
        student_id: { type: "string", description: "UUID from search_students result" },
        student_name: { type: "string" },
        amount: { type: "number", description: "Payment amount in GH₵" },
        method: { type: "string", description: "'Cash', 'Mobile Money', 'Bank Transfer', or 'Cheque'" },
        date: { type: "string", description: "YYYY-MM-DD, defaults to today" },
      },
      required: ["student_id", "student_name", "amount"],
    },
  },
  {
    name: "schedule_event",
    description: "Create a new school event. ONLY call when user explicitly asks to create, add, or schedule an event.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        type: { type: "string", description: "'Academic', 'Sports', 'Cultural', 'Meeting', or 'General'" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM, e.g. '09:00'" },
        venue: { type: "string" },
        description: { type: "string" },
      },
      required: ["title", "date"],
    },
  },
];

// ─── tool executor ────────────────────────────────────────────────────────────

type ToolResult = { result: unknown; report?: ExecutiveReport; action?: ActionRecord };

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  db: SupabaseClient,
  ctx: UserContext,
): Promise<ToolResult> {
  const allowedTools = new Set(getAllowedToolNames(ctx.role));
  if (!allowedTools.has(name)) {
    return forbiddenResult(ctx.role, name);
  }

  switch (name) {
    // ── READ TOOLS ───────────────────────────────────────────────────────────

    case "get_school_summary": {
      const includeFinance = ctx.role === "Admin" || ctx.role === "Accountant";
      const [sr, pr] = await Promise.all([
        db.from("students").select(includeFinance ? "id, status, fees_total, avg_grade, attendance_rate" : "id, status, avg_grade, attendance_rate"),
        includeFinance ? db.from("payments").select("amount") : Promise.resolve({ data: [], error: null }),
      ]);
      const students = (sr.data as StudentRow[]) ?? [];
      const payments = (pr.data as PaymentRow[]) ?? [];
      const totalStudents = students.length;
      const activeStudents = students.filter((s) => (s.status ?? "Active") === "Active").length;
      const totalRevenue = students.reduce((s, st) => s + n(st.fees_total), 0);
      const collected = payments.reduce((s, p) => s + n(p.amount), 0);
      return {
        result: {
          totalStudents,
          activeStudents,
          averageAttendance: totalStudents
            ? Math.round(students.reduce((s, st) => s + n(st.attendance_rate), 0) / totalStudents)
            : 0,
          averageScore: totalStudents
            ? Math.round(students.reduce((s, st) => s + n(st.avg_grade), 0) / totalStudents)
            : 0,
          ...(includeFinance
            ? {
                totalRevenue,
                collected,
                outstanding: Math.max(totalRevenue - collected, 0),
                feeCollectionRate: totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0,
              }
            : {}),
        },
      };
    }

    case "search_students": {
      // deno-lint-ignore no-explicit-any
      const studentColumns = ctx.role === "Teacher" || ctx.role === "Secretary"
        ? "id, full_name, class_name, status, avg_grade, attendance_rate"
        : "id, full_name, class_name, status, fees_total, avg_grade, attendance_rate";
      let q = db.from("students").select(studentColumns) as any;
      if (ctx.role === "Teacher" && ctx.teacherClassName) q = q.eq("class_name", ctx.teacherClassName);
      if (ctx.role === "Parent") q = q.eq("guardian_email", ctx.email);
      if (args.status) q = q.eq("status", args.status);
      if (args.min_attendance !== undefined) q = q.gte("attendance_rate", args.min_attendance);
      if (args.max_attendance !== undefined) q = q.lte("attendance_rate", args.max_attendance);
      if (args.min_grade !== undefined) q = q.gte("avg_grade", args.min_grade);
      if (args.max_grade !== undefined) q = q.lte("avg_grade", args.max_grade);
      if (args.class_name) q = q.ilike("class_name", `%${args.class_name}%`);
      if (args.name_contains) q = q.ilike("full_name", `%${args.name_contains}%`);
      const sortField = (args.sort_by as string) ?? "full_name";
      q = q.order(sortField, { ascending: args.sort_order !== "desc" });
      q = q.limit((args.limit as number) ?? 20);
      const { data, error } = await q;
      if (error) return { result: { error: error.message } };
      return { result: data ?? [] };
    }

    case "get_attendance_records": {
      // deno-lint-ignore no-explicit-any
      let q = db.from("attendance").select("id, student, class_name, date, status").order("date", { ascending: false }) as any;
      if (ctx.role === "Teacher" && ctx.teacherClassName) q = q.eq("class_name", ctx.teacherClassName);
      if (ctx.role === "Parent") {
        const { data: linkedStudents } = await db
          .from("students")
          .select("full_name")
          .eq("guardian_email", ctx.email);
        const names = ((linkedStudents as Array<{ full_name?: string | null }>) ?? [])
          .map((student) => student.full_name)
          .filter(Boolean) as string[];
        if (!names.length) return { result: [] };
        q = q.in("student", names);
      }
      if (args.student_name) q = q.ilike("student", `%${args.student_name}%`);
      if (args.class_name) q = q.ilike("class_name", `%${args.class_name}%`);
      if (args.date_from) q = q.gte("date", args.date_from);
      if (args.date_to) q = q.lte("date", args.date_to);
      if (args.status) q = q.ilike("status", args.status as string);
      q = q.limit((args.limit as number) ?? 30);
      const { data, error } = await q;
      if (error) return { result: { error: error.message } };
      return { result: data ?? [] };
    }

    case "get_grades": {
      // deno-lint-ignore no-explicit-any
      let q = db.from("grades").select("id, student, class_name, subject, score, term, year").order("score", { ascending: false }) as any;
      if (ctx.role === "Teacher") {
        if (ctx.teacherClassName) q = q.eq("class_name", ctx.teacherClassName);
        if (ctx.teacherSubject) q = q.eq("subject", ctx.teacherSubject);
      }
      if (ctx.role === "Parent") {
        const { data: linkedStudents } = await db
          .from("students")
          .select("full_name")
          .eq("guardian_email", ctx.email);
        const names = ((linkedStudents as Array<{ full_name?: string | null }>) ?? [])
          .map((student) => student.full_name)
          .filter(Boolean) as string[];
        if (!names.length) return { result: [] };
        q = q.in("student", names);
      }
      if (args.student_name) q = q.ilike("student", `%${args.student_name}%`);
      if (args.subject) q = q.ilike("subject", `%${args.subject}%`);
      if (args.class_name) q = q.ilike("class_name", `%${args.class_name}%`);
      if (args.term) q = q.eq("term", args.term);
      if (args.year) q = q.eq("year", args.year);
      if (args.min_score !== undefined) q = q.gte("score", args.min_score);
      if (args.max_score !== undefined) q = q.lte("score", args.max_score);
      q = q.limit((args.limit as number) ?? 30);
      const { data, error } = await q;
      if (error) return { result: { error: error.message } };
      return { result: data ?? [] };
    }

    case "get_payments": {
      // deno-lint-ignore no-explicit-any
      let q = db.from("payments").select("id, student_id, student_name, amount, date, method").order("date", { ascending: false }) as any;
      if (ctx.role === "Parent") {
        const { data: linkedStudents } = await db
          .from("students")
          .select("full_name")
          .eq("guardian_email", ctx.email);
        const names = ((linkedStudents as Array<{ full_name?: string | null }>) ?? [])
          .map((student) => student.full_name)
          .filter(Boolean) as string[];
        if (!names.length) return { result: [] };
        q = q.in("student_name", names);
      }
      if (args.student_name) q = q.ilike("student_name", `%${args.student_name}%`);
      if (args.date_from) q = q.gte("date", args.date_from);
      if (args.date_to) q = q.lte("date", args.date_to);
      if (args.method) q = q.ilike("method", `%${args.method}%`);
      if (args.min_amount !== undefined) q = q.gte("amount", args.min_amount);
      q = q.limit((args.limit as number) ?? 30);
      const { data, error } = await q;
      if (error) return { result: { error: error.message } };
      return { result: data ?? [] };
    }

    case "get_events": {
      // deno-lint-ignore no-explicit-any
      let q = db.from("events").select("id, title, type, date, time, venue, status").order("date", { ascending: true }) as any;
      if (args.status) q = q.ilike("status", `%${args.status}%`);
      if (args.type) q = q.ilike("type", `%${args.type}%`);
      if (args.date_from) q = q.gte("date", args.date_from);
      if (args.date_to) q = q.lte("date", args.date_to);
      q = q.limit((args.limit as number) ?? 10);
      const { data, error } = await q;
      if (error) return { result: { error: error.message } };
      return { result: data ?? [] };
    }

    case "get_inventory": {
      // deno-lint-ignore no-explicit-any
      let q = db.from("inventory").select("id, item, category, quantity, reorder_level, status").order("quantity", { ascending: true }) as any;
      if (args.category) q = q.ilike("category", `%${args.category}%`);
      if (args.status) q = q.ilike("status", `%${args.status}%`);
      q = q.limit((args.limit as number) ?? 20);
      const { data, error } = await q;
      if (error) return { result: { error: error.message } };
      const rows = (data as InventoryRow[]) ?? [];
      return {
        result: args.low_stock_only
          ? rows.filter((i) => n(i.quantity) <= n(i.reorder_level))
          : rows,
      };
    }

    case "generate_executive_report": {
      if (ctx.role !== "Admin") return forbiddenResult(ctx.role, "generate_executive_report");
      const [sr, pr, ar, er, gr, ir] = await Promise.all([
        db.from("students").select("id, full_name, status, fees_total, avg_grade, attendance_rate"),
        db.from("payments").select("id, student_id, amount, date"),
        db.from("attendance").select("id, student, date, status").order("date", { ascending: false }),
        db.from("events").select("id, title, status").order("date", { ascending: true }),
        db.from("grades").select("id, student, subject, score"),
        db.from("inventory").select("id, quantity, reorder_level"),
      ]);
      const students = (sr.data as StudentRow[]) ?? [];
      const payments = (pr.data as PaymentRow[]) ?? [];
      const grades = (gr.data as GradeRow[]) ?? [];

      const totalStudents = students.length;
      const activeStudents = students.filter((s) => (s.status ?? "Active") === "Active").length;
      const totalRevenue = students.reduce((s, st) => s + n(st.fees_total), 0);
      const collected = payments.reduce((s, p) => s + n(p.amount), 0);
      const outstanding = Math.max(totalRevenue - collected, 0);
      const feeCollectionRate = totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;
      const avgAttendance = totalStudents
        ? Math.round(students.reduce((s, st) => s + n(st.attendance_rate), 0) / totalStudents)
        : 0;

      const gradeRanked = students
        .map((s) => ({ name: (s.full_name ?? "").trim() || "Unnamed", avgScore: n(s.avg_grade) }))
        .filter((s) => s.avgScore > 0)
        .sort((a, b) => b.avgScore - a.avgScore);

      const subjectMap = new Map<string, number[]>();
      for (const g of grades) {
        if (!g.subject || g.score == null) continue;
        const arr = subjectMap.get(g.subject) ?? [];
        arr.push(Number(g.score));
        subjectMap.set(g.subject, arr);
      }
      const lowestSubjects = Array.from(subjectMap.entries())
        .map(([subject, scores]) => ({ subject, avg: scores.reduce((s, v) => s + v, 0) / scores.length }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3);

      const paidByStudent = new Map<string, number>();
      for (const p of payments) {
        if (!p.student_id) continue;
        paidByStudent.set(p.student_id, (paidByStudent.get(p.student_id) ?? 0) + n(p.amount));
      }
      const outstandingCount = students.filter((s) => {
        const paid = paidByStudent.get(s.id) ?? 0;
        return Math.max(n(s.fees_total) - paid, 0) > 0;
      }).length;

      const lowAttCount = students.filter((s) => n(s.attendance_rate) > 0 && n(s.attendance_rate) < 80).length;

      const recentAtt = (ar.data as AttendanceRow[]) ?? [];
      const byDate = new Map<string, { present: number; absent: number; late: number }>();
      for (const r of recentAtt) {
        if (!r.date) continue;
        const cur = byDate.get(r.date) ?? { present: 0, absent: 0, late: 0 };
        const st = lower(r.status ?? "");
        if (st === "present") cur.present++;
        if (st === "absent") cur.absent++;
        if (st === "late") cur.late++;
        byDate.set(r.date, cur);
      }
      const recentEntry = Array.from(byDate.entries()).sort(([a], [b]) => b.localeCompare(a))[0];

      const upcomingCount = ((er.data as EventRow[]) ?? []).filter(
        (e) => lower(e.status ?? "upcoming") === "upcoming",
      ).length;
      const lowStockCount = ((ir.data as InventoryRow[]) ?? []).filter(
        (i) => n(i.quantity) <= n(i.reorder_level),
      ).length;

      const report: ExecutiveReport = {
        headline: "Executive School Report",
        summary: `${totalStudents} students · ${avgAttendance}% avg attendance · ${feeCollectionRate}% fees collected`,
        generatedAt: new Date().toISOString(),
        cards: [
          { label: "Students", value: `${activeStudents}/${totalStudents} active`, tone: "neutral" },
          {
            label: "Attendance",
            value: `${avgAttendance}% average`,
            tone: avgAttendance >= 90 ? "positive" : avgAttendance >= 75 ? "neutral" : "warning",
          },
          {
            label: "Fee Collection",
            value: `${feeCollectionRate}% collected`,
            tone: feeCollectionRate >= 70 ? "positive" : feeCollectionRate >= 45 ? "neutral" : "warning",
          },
          { label: "Outstanding Fees", value: currency(outstanding), tone: outstanding > 0 ? "warning" : "positive" },
        ],
        sections: [
          {
            title: "Academic Highlights",
            items: [
              gradeRanked.length
                ? `Top performers: ${topNames(gradeRanked.slice(0, 4))}.`
                : "No academic ranking data available yet.",
              lowestSubjects.length
                ? `Subjects needing support: ${lowestSubjects.map((s) => s.subject).join(", ")}.`
                : "Subject-level grade data is limited.",
            ],
          },
          {
            title: "Attendance Watchlist",
            items: [
              lowAttCount
                ? `${lowAttCount} students are below 80% attendance.`
                : "No students flagged below 80% attendance.",
              recentEntry
                ? `Latest record: ${recentEntry[1].present} present, ${recentEntry[1].absent} absent, ${recentEntry[1].late} late.`
                : "No recent attendance entries available.",
            ],
          },
          {
            title: "Finance Snapshot",
            items: [
              `Collected ${currency(collected)} of ${currency(totalRevenue)} expected.`,
              outstandingCount
                ? `${outstandingCount} students have outstanding balances.`
                : "No outstanding balances.",
            ],
          },
          {
            title: "Operations",
            items: [
              upcomingCount ? `${upcomingCount} upcoming events scheduled.` : "No upcoming events.",
              lowStockCount ? `${lowStockCount} inventory items need restocking.` : "No inventory items flagged.",
            ],
          },
        ],
      };

      return { result: "Executive report generated.", report };
    }

    // ── WRITE TOOLS ──────────────────────────────────────────────────────────

    case "create_notification": {
      if (!(ctx.role === "Admin" || ctx.role === "Secretary")) return forbiddenResult(ctx.role, "create_notification");
      const { error } = await db.from("notifications").insert({
        title: args.title,
        message: args.message,
        type: args.type ?? "info",
        priority: args.priority ?? "medium",
        read: false,
        created_at: new Date().toISOString(),
      });
      if (error) return { result: { error: error.message } };
      return {
        result: "Notification created successfully.",
        action: { name: "create_notification", summary: `Notification created: "${args.title}"` },
      };
    }

    case "flag_student": {
      if (!(ctx.role === "Admin" || ctx.role === "Secretary")) return forbiddenResult(ctx.role, "flag_student");
      const { error } = await db
        .from("students")
        .update({ status: args.status })
        .eq("id", args.student_id);
      if (error) return { result: { error: error.message } };
      return {
        result: "Student status updated.",
        action: {
          name: "flag_student",
          summary: `${args.student_name} marked as ${args.status}${args.reason ? ` — ${args.reason}` : ""}`,
        },
      };
    }

    case "record_payment": {
      if (!(ctx.role === "Admin" || ctx.role === "Accountant")) return forbiddenResult(ctx.role, "record_payment");
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await db.from("payments").insert({
        student_id: args.student_id,
        student_name: args.student_name,
        amount: args.amount,
        method: args.method ?? "Cash",
        date: args.date ?? today,
        receipt: `REC-${Date.now()}`,
      });
      if (error) return { result: { error: error.message } };
      return {
        result: "Payment recorded successfully.",
        action: {
          name: "record_payment",
          summary: `Payment of ${currency(args.amount as number)} recorded for ${args.student_name}`,
        },
      };
    }

    case "schedule_event": {
      if (!(ctx.role === "Admin" || ctx.role === "Secretary")) return forbiddenResult(ctx.role, "schedule_event");
      const { error } = await db.from("events").insert({
        title: args.title,
        type: args.type ?? "General",
        date: args.date,
        time: args.time ?? "09:00",
        venue: args.venue ?? "Main Hall",
        description: args.description ?? "",
        status: "Upcoming",
      });
      if (error) return { result: { error: error.message } };
      return {
        result: "Event scheduled successfully.",
        action: { name: "schedule_event", summary: `Event scheduled: "${args.title}" on ${args.date}` },
      };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` } };
  }
}

// ─── SSE streaming helper ─────────────────────────────────────────────────────

function buildSSEStream(
  text: string,
  reportData: ExecutiveReport | null,
  actions: ActionRecord[],
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      if (reportData) emit({ type: "report", data: reportData });
      for (const a of actions) emit({ type: "action", name: a.name, summary: a.summary });

      // Stream 3-char chunks with a small delay for progressive rendering
      const chunks = text.match(/.{1,3}/gs) ?? [text];
      for (const chunk of chunks) {
        emit({ type: "token", content: chunk });
        await new Promise((r) => setTimeout(r, 10));
      }

      emit({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

// ─── simple bypass for greetings ─────────────────────────────────────────────

const GREETING_REPLIES = [
  "Hello! What would you like to check on today — students, attendance, fees, or something else?",
  "Hi there! Ready to help. What do you need to look into?",
  "Hey! What can I pull up for you today?",
];

const SOCIAL_REPLIES = [
  "Of course! Let me know if there's anything else you'd like to check.",
  "Happy to help. Is there anything else you need?",
  "Glad I could assist. Feel free to ask anything else.",
];

function tryShortCircuit(message: string): string | null {
  const text = lower(message);
  const opKeywords = [
    "attendance", "absent", "late", "present",
    "fee", "fees", "payment", "revenue", "finance", "outstanding", "overdue",
    "event", "events", "upcoming",
    "grade", "gpa", "score", "subject", "perform", "top", "best", "worst",
    "inventory", "stock", "supplies", "reorder",
    "report", "dashboard", "briefing", "summary", "overview",
    "student", "teacher", "teachers", "class", "school",
    "send", "create", "record", "schedule", "flag", "add",
  ];
  if (opKeywords.some((k) => text.includes(k))) return null;
  if (["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].some((k) => text.includes(k))) {
    return GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];
  }
  if (["thanks", "thank you", "great", "awesome", "okay", "ok", "got it", "bye", "goodbye", "appreciate"].some((k) => text.includes(k))) {
    return SOCIAL_REPLIES[Math.floor(Math.random() * SOCIAL_REPLIES.length)];
  }
  return null;
}

// ─── main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // ── provider config ──────────────────────────────────────────────────────
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const xaiKey = Deno.env.get("XAI_API_KEY");
    const provider = openaiKey ? "openai" : anthropicKey ? "anthropic" : groqKey ? "groq" : xaiKey ? "xai" : null;

    if (!provider) {
      return new Response(
        JSON.stringify({ error: "Set ANTHROPIC_API_KEY (recommended), GROQ_API_KEY, or XAI_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { message, session_id: sessionId, conversation = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "A user message is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── greeting / social bypass (no AI needed) ──────────────────────────────
    const shortCircuit = tryShortCircuit(message);
    if (shortCircuit) {
      return buildSSEStream(shortCircuit, null, []);
    }

    // ── Supabase client ──────────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing user authorization token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: userData, error: userError } = await db.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unable to resolve the authenticated user." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const user = userData.user;
    const userEmail = lower(user.email ?? "");
    const profileResult = await db
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();
    const teacherResult = await db
      .from("teachers")
      .select("class_name, subject")
      .eq("email", userEmail)
      .maybeSingle();

    const userContext: UserContext = {
      userId: user.id,
      email: userEmail,
      role: normalizeRole(
        (profileResult.data as { role?: string | null } | null)?.role ??
        (user.user_metadata?.role as string | undefined) ??
        null,
      ),
      name:
        (profileResult.data as { full_name?: string | null } | null)?.full_name ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        userEmail.split("@")[0] ??
        "User",
      teacherClassName: (teacherResult.data as { class_name?: string | null } | null)?.class_name ?? null,
      teacherSubject: (teacherResult.data as { subject?: string | null } | null)?.subject ?? null,
    };

    // ── load session history ─────────────────────────────────────────────────
    type HistoryRow = { role: string; content: string };
    let sessionHistory: HistoryRow[] = [];
    if (sessionId) {
      const { data } = await db
        .from("conversations")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(12);
      sessionHistory = (data as HistoryRow[]) ?? [];
    }

    // Fallback to request conversation if no session history yet
    const history: HistoryRow[] = sessionHistory.length
      ? sessionHistory
      : (conversation as Array<{ role?: string; text?: string }>)
          .slice(-8)
          .filter((m) => m?.role && m?.text)
          .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text as string }));

    // ── system prompt ────────────────────────────────────────────────────────
    const systemPrompt = buildRoleSystemPrompt(userContext);
    const allowedTools = TOOLS.filter((tool) => getAllowedToolNames(userContext.role).includes(tool.name));

    // ── agentic tool-calling loop ─────────────────────────────────────────────
    const MAX_ITERATIONS = 3;
    let reportData: ExecutiveReport | null = null;
    const actionsPerformed: ActionRecord[] = [];

    if (provider === "anthropic") {
      const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-4-5-20251001";

      const messages: AnthropicMessage[] = [
        ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: message },
      ];

      for (let i = 0; i < MAX_ITERATIONS; i++) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey as string,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages,
            tools: allowedTools,
            tool_choice: { type: "auto" },
          }),
        });

        const payload = await res.json();

        if (!res.ok) {
          return new Response(
            JSON.stringify({ error: payload?.error?.message ?? "Anthropic request failed." }),
            { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const content = (payload.content ?? []) as AnthropicContentBlock[];
        messages.push({ role: "assistant", content });

        if (payload.stop_reason === "end_turn") {
          const textBlock = content.find((c) => c.type === "text") as { type: "text"; text: string } | undefined;
          const finalText = textBlock?.text ?? "I couldn't generate a response.";

          // Save to session memory
          if (sessionId) {
            await db.from("conversations").insert([
              { session_id: sessionId, role: "user", content: message },
              { session_id: sessionId, role: "assistant", content: finalText },
            ]);
          }

          return buildSSEStream(finalText, reportData, actionsPerformed);
        }

        // Execute tool calls in parallel
        const toolUses = content.filter((c) => c.type === "tool_use") as Array<{
          type: "tool_use";
          id: string;
          name: string;
          input: Record<string, unknown>;
        }>;

        const toolResults = await Promise.all(
          toolUses.map(async (tu) => {
            const { result, report, action } = await executeTool(tu.name, tu.input, db, userContext);
            if (report) reportData = report;
            if (action) actionsPerformed.push(action);
            return { type: "tool_result" as const, tool_use_id: tu.id, content: JSON.stringify(result) };
          }),
        );

        messages.push({ role: "user", content: toolResults });
      }

      return buildSSEStream(
        "I couldn't complete the analysis in time. Please try a more specific question.",
        reportData,
        actionsPerformed,
      );
    }

    // ── Groq / xAI fallback (OpenAI-compatible, real streaming) ─────────────
    const apiUrl = provider === "openai"
      ? "https://api.openai.com/v1/chat/completions"
      : provider === "groq"
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api.x.ai/v1/chat/completions";
    const apiKey = (provider === "openai" ? openaiKey : provider === "groq" ? groqKey : xaiKey) as string;
    const model = provider === "openai"
      ? (Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini")
      : provider === "groq"
        ? (Deno.env.get("GROQ_MODEL") ?? "llama-3.3-70b-versatile")
        : (Deno.env.get("XAI_MODEL") ?? "grok-3-mini");

    const openaiTools = allowedTools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }));

    const messages: Array<Record<string, unknown>> = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const callHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    const enc = new TextEncoder();

    const clientStream = new ReadableStream({
      async start(controller) {
        const emit = (obj: object) =>
          controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

        // ── Phase 1: non-streaming tool-calling loop ──────────────────────
        for (let i = 0; i < MAX_ITERATIONS; i++) {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: callHeaders,
            body: JSON.stringify({ model, messages, tools: openaiTools, tool_choice: "auto", temperature: 0.2 }),
          });

          if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            emit({ type: "token", content: `Error: ${(e as { error?: { message?: string } })?.error?.message ?? "Request failed."}` });
            emit({ type: "done" });
            controller.close();
            return;
          }

          const payload = await res.json();
          const assistantMsg = payload.choices?.[0]?.message;

          // No tool calls → tool phase done, fall through to streaming
          if (!assistantMsg?.tool_calls?.length) break;

          messages.push(assistantMsg);

          const toolResults = await Promise.all(
            (assistantMsg.tool_calls as Array<{ id: string; function: { name: string; arguments: string } }>).map(
              async (tc) => {
                let args: Record<string, unknown> = {};
                try { args = JSON.parse(tc.function.arguments); } catch { /* empty */ }
                const { result, report, action } = await executeTool(tc.function.name, args, db, userContext);
                if (report) reportData = report;
                if (action) actionsPerformed.push(action);
                return { role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) };
              },
            ),
          );
          messages.push(...toolResults);
        }

        // ── Phase 2: stream final text (no tools → forces text generation) ─
        const streamRes = await fetch(apiUrl, {
          method: "POST",
          headers: callHeaders,
          body: JSON.stringify({ model, messages, stream: true, temperature: 0.2, max_tokens: 400 }),
        });

        if (!streamRes.ok || !streamRes.body) {
          emit({ type: "token", content: "I couldn't generate a response. Please try again." });
          emit({ type: "done" });
          controller.close();
          return;
        }

        if (reportData) emit({ type: "report", data: reportData });
        for (const a of actionsPerformed) emit({ type: "action", ...a });

        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6);
            if (raw === "[DONE]") continue;
            try {
              const chunk = JSON.parse(raw);
              const token = chunk.choices?.[0]?.delta?.content;
              if (token) {
                fullText += token;
                emit({ type: "token", content: token });
              }
            } catch { /* ignore */ }
          }
        }

        // Save clean text to session memory
        if (sessionId && fullText) {
          const cleanForDB = fullText.replace(/\nFOLLOW_UPS:.*$/s, "").trim();
          await db.from("conversations").insert([
            { session_id: sessionId, role: "user", content: message },
            { session_id: sessionId, role: "assistant", content: cleanForDB },
          ]);
        }

        emit({ type: "done" });
        controller.close();
      },
    });

    return new Response(clientStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
