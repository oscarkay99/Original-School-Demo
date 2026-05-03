/* eslint-disable react-refresh/only-export-components */
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole, type AppRole } from "@/lib/access";

type LoadStatus = "idle" | "loading" | "ready" | "error";

interface StudentRow {
  id: string;
  full_name: string;
  class_name: string;
  gender?: string | null;
  dob?: string | null;
  guardian_name?: string | null;
  guardian_email?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  fees_total?: number | null;
  avg_grade?: number | null;
  attendance_rate?: number | null;
  entered_by?: string | null;
  created_at?: string | null;
}

interface TeacherRow {
  teacher_id: string;
  full_name: string;
  subject?: string | null;
  class_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface PaymentRow {
  id: string;
  student_id?: string | null;
  student_name?: string | null;
  amount?: number | null;
  date?: string | null;
  method?: string | null;
  receipt?: string | null;
  created_at?: string | null;
}

interface AttendanceRow {
  id: string;
  student?: string | null;
  class_name?: string | null;
  date?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface EventRow {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  date?: string | null;
  time?: string | null;
  audience?: string | null;
  venue?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface InventoryRow {
  id: string;
  item?: string | null;
  category?: string | null;
  quantity?: number | null;
  unit?: string | null;
  reorder_level?: number | null;
  status?: string | null;
  created_at?: string | null;
}

interface ProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface GradeRow {
  id: string;
  student?: string | null;
  class_name?: string | null;
  subject?: string | null;
  score?: number | null;
  term?: string | null;
  year?: string | null;
  created_at?: string | null;
}

interface ClassRow {
  id: string;
  name?: string | null;
  teacher?: string | null;
  subjects?: string | null;
  created_at?: string | null;
}

interface NotificationRow {
  id: string;
  channel?: string | null;
  audience?: string | null;
  title?: string | null;
  status?: string | null;
  send_at?: string | null;
  created_at?: string | null;
}

interface ReportRow {
  id: string;
  type?: string | null;
  target?: string | null;
  period?: string | null;
  status?: string | null;
  date?: string | null;
  created_at?: string | null;
}

interface MeetingRow {
  id: string;
  title: string;
  type?: string | null;
  description?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  room_name: string;
  host_name?: string | null;
  status?: string | null;
  participant_emails?: string | null;
  created_at?: string | null;
}

export interface MeetingParticipant {
  name: string;
  email: string;
  role: string;
}

export interface MeetingView {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
  time: string;
  roomName: string;
  hostName: string;
  status: string;
  participants: MeetingParticipant[];
}

interface StudentView {
  id: string;
  name: string;
  grade: string;
  gpa: number;
  status: string;
  attendance: number;
  fees: "Paid" | "Pending" | "Overdue";
  avatar: string;
  dob: string;
  parent: string;
  guardianEmail: string;
  phone: string;
  joined: string;
  email: string;
  feesTotal: number;
}

interface TeacherView {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  status: string;
  experience: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  students: number;
}

interface EventView {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  status: string;
  location: string;
  attendees: number;
}

interface InventoryView {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  status: string;
  lastUpdated: string;
  value: number;
}

interface UserView {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

interface AttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface FinanceBreakdown {
  category: string;
  amount: number;
  collected: number;
  percentage: number;
}

interface FinanceOverview {
  totalRevenue: number;
  collected: number;
  outstanding: number;
  expenses: number;
  monthlyData: Array<{ month: string; revenue: number; expenses: number }>;
  feeBreakdown: FinanceBreakdown[];
  recentTransactions: Array<{
    id: string;
    student: string;
    amount: number;
    type: string;
    date: string;
    status: string;
  }>;
}

interface ClassView {
  id: string;
  name: string;
  level: string;
  classTeacher: string;
  room: string;
  students: number;
  capacity: number;
  avgGpa: number;
  avgAttendance: number;
  subjects: number;
}

interface NotificationView {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  read: boolean;
  priority: "High" | "Medium" | "Low";
}

interface ActivityView {
  id: string;
  text: string;
  tag: string;
  time: string;
  icon: string;
  tagBg: string;
  tagText: string;
  iconBg: string;
  iconColor: string;
}

interface GradeBreakdown {
  label: string;
  count: number;
  color: string;
  light: string;
}

interface SchoolDataContextValue {
  status: LoadStatus;
  error: string | null;
  currentUserRole: string;
  currentUserName: string;
  currentUserEmail: string;
  myLinkedStudents: StudentView[];
  refreshData: () => Promise<void>;
  students: StudentView[];
  teachers: TeacherView[];
  events: EventView[];
  inventoryItems: InventoryView[];
  users: UserView[];
  attendanceData: AttendanceSummary[];
  financeData: FinanceOverview;
  classesData: ClassView[];
  notifications: NotificationView[];
  meetings: MeetingView[];
  reports: ReportRow[];
  gradesRows: GradeRow[];
  gradeSubjects: string[];
  recentActivity: ActivityView[];
  topStudents: Array<{ rank: number; initials: string; name: string; class: string; score: number; gradient: string; rankColor: string }>;
  gradeDistribution: GradeBreakdown[];
  addStudent: (payload: {
    fullName: string;
    dob: string;
    grade: string;
    parent: string;
    guardianEmail: string;
    phone?: string;
    email?: string;
  }) => Promise<void>;
  updateStudent: (id: string, payload: { name?: string; grade?: string; parent?: string; email?: string; guardianEmail?: string }) => Promise<void>;
  addTeacher: (payload: {
    fullName: string;
    subject: string;
    email: string;
    phone: string;
    yearsOfExperience: string;
    className?: string;
  }) => Promise<void>;
  addEvent: (payload: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    attendees: string;
    type: string;
    status?: string;
  }) => Promise<void>;
  updateEvent: (payload: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    attendees: string;
    type: string;
    status?: string;
  }) => Promise<void>;
  addInventoryItem: (payload: {
    itemName: string;
    quantity: string;
    minimumStock: string;
    unitValue: string;
    category: string;
  }) => Promise<void>;
  addUser: (payload: {
    fullName: string;
    email: string;
    role: string;
  }) => Promise<void>;
  recordPayment: (payload: {
    studentId: string;
    studentName: string;
    amount: string;
    method: string;
    date: string;
  }) => Promise<void>;
  saveAttendance: (payload: {
    date: string;
    entries: Array<{ studentId: string; studentName: string; className: string; status: "Present" | "Absent" | "Late" }>;
  }) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addMeeting: (payload: {
    title: string;
    type: string;
    description: string;
    date: string;
    time: string;
    hostName: string;
    participants: MeetingParticipant[];
  }) => Promise<void>;
  updateMeeting: (id: string, payload: {
    title?: string;
    type?: string;
    description?: string;
    date?: string;
    time?: string;
    status?: string;
    participants?: MeetingParticipant[];
  }) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
}

const SchoolDataContext = createContext<SchoolDataContextValue | null>(null);

const gradeColors = [
  "from-orange-400 to-rose-500",
  "from-violet-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "Just now";
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return value;
  const diffMs = Date.now() - target;
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

function normalizeDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function deriveEventStatus(date?: string | null, status?: string | null) {
  const normalizedStatus = (status ?? "").toLowerCase();
  if (normalizedStatus === "cancelled") return "Cancelled";
  if (normalizedStatus === "completed") return "Completed";
  if (normalizedStatus === "upcoming") return "Upcoming";

  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return status ?? "Upcoming";

  const eventDate = new Date(`${normalizedDate}T00:00:00`);
  if (Number.isNaN(eventDate.getTime())) return status ?? "Upcoming";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return eventDate < today ? "Completed" : "Upcoming";
}

function normalizeGpa(value?: number | null) {
  const grade = Number(value ?? 0);
  if (grade <= 4) return Number(grade.toFixed(1));
  if (grade <= 100) return Number((grade / 25).toFixed(1));
  return Number((grade / 100).toFixed(1));
}

function inferFeeStatus(totalDue: number, collected: number): "Paid" | "Pending" | "Overdue" {
  if (collected >= totalDue && totalDue > 0) return "Paid";
  if (collected > 0) return "Pending";
  return "Overdue";
}

function getStatusPriority(status?: string | null): "High" | "Medium" | "Low" {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("critical") || normalized.includes("failed") || normalized.includes("overdue")) return "High";
  if (normalized.includes("pending") || normalized.includes("scheduled")) return "Medium";
  return "Low";
}

function deriveSessionRole(session: ReturnType<typeof useAuth>["session"]): AppRole {
  return normalizeRole(
    (typeof session?.user.user_metadata?.role === "string" ? session.user.user_metadata.role : null) ??
    (session?.user.email?.includes("oscar") ? "Admin" : null),
  );
}

export function SchoolDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [studentsRows, setStudentsRows] = useState<StudentRow[]>([]);
  const [teachersRows, setTeachersRows] = useState<TeacherRow[]>([]);
  const [paymentsRows, setPaymentsRows] = useState<PaymentRow[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [eventsRows, setEventsRows] = useState<EventRow[]>([]);
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([]);
  const [profilesRows, setProfilesRows] = useState<ProfileRow[]>([]);
  const [gradesRows, setGradesRows] = useState<GradeRow[]>([]);
  const [classesRows, setClassesRows] = useState<ClassRow[]>([]);
  const [notificationsRows, setNotificationsRows] = useState<NotificationRow[]>([]);
  const [reportsRows, setReportsRows] = useState<ReportRow[]>([]);
  const [meetingsRows, setMeetingsRows] = useState<MeetingRow[]>([]);

  const clearData = () => {
    setStudentsRows([]);
    setTeachersRows([]);
    setPaymentsRows([]);
    setAttendanceRows([]);
    setEventsRows([]);
    setInventoryRows([]);
    setProfilesRows([]);
    setGradesRows([]);
    setClassesRows([]);
    setNotificationsRows([]);
    setReportsRows([]);
    setMeetingsRows([]);
  };

  const refreshData = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const sessionRole = deriveSessionRole(session);
    const canReadTeachers = sessionRole === "Admin" || sessionRole === "Teacher" || sessionRole === "Secretary";
    const canReadPayments = sessionRole === "Admin" || sessionRole === "Accountant" || sessionRole === "Secretary";
    const canReadAttendance = sessionRole === "Admin" || sessionRole === "Teacher" || sessionRole === "Secretary" || sessionRole === "Parent";
    const canReadInventory = sessionRole === "Admin" || sessionRole === "Accountant" || sessionRole === "Secretary";
    const canReadProfiles = sessionRole === "Admin" || sessionRole === "Teacher" || sessionRole === "Accountant" || sessionRole === "Secretary";
    const canReadGrades = sessionRole === "Admin" || sessionRole === "Teacher" || sessionRole === "Parent";
    const canReadClasses = sessionRole === "Admin" || sessionRole === "Teacher" || sessionRole === "Secretary";
    const canReadReports = sessionRole === "Admin" || sessionRole === "Teacher" || sessionRole === "Accountant" || sessionRole === "Secretary";

    const emptyResult = Promise.resolve({ data: [], error: null });

    const [
      studentsResult,
      teachersResult,
      paymentsResult,
      attendanceResult,
      eventsResult,
      inventoryResult,
      profilesResult,
      gradesResult,
      classesResult,
      notificationsResult,
      reportsResult,
      meetingsResult,
    ] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      canReadTeachers
        ? supabase.from("teachers").select("*").order("created_at", { ascending: false })
        : emptyResult,
      canReadPayments
        ? supabase.from("payments").select("*").order("date", { ascending: false })
        : emptyResult,
      canReadAttendance
        ? supabase.from("attendance").select("*").order("date", { ascending: false })
        : emptyResult,
      supabase.from("events").select("*").order("date", { ascending: false }),
      canReadInventory
        ? supabase.from("inventory").select("*").order("created_at", { ascending: false })
        : emptyResult,
      canReadProfiles
        ? supabase.from("profiles").select("*").order("created_at", { ascending: false })
        : session?.user.id
          ? supabase.from("profiles").select("*").eq("id", session.user.id)
          : emptyResult,
      canReadGrades
        ? supabase.from("grades").select("*").order("created_at", { ascending: false })
        : emptyResult,
      canReadClasses
        ? supabase.from("classes").select("*").order("name", { ascending: true })
        : emptyResult,
      supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      canReadReports
        ? supabase.from("reports").select("*").order("date", { ascending: false })
        : emptyResult,
      supabase.from("meetings").select("*").order("scheduled_date", { ascending: false }),
    ]);

    const firstError = [
      studentsResult.error,
      teachersResult.error,
      paymentsResult.error,
      attendanceResult.error,
      eventsResult.error,
      inventoryResult.error,
      profilesResult.error,
      gradesResult.error,
      classesResult.error,
      notificationsResult.error,
      reportsResult.error,
      meetingsResult.error,
    ].find(Boolean);

    if (firstError) {
      setStatus("error");
      setError(firstError.message);
      return;
    }

    setStudentsRows((studentsResult.data as StudentRow[]) ?? []);
    setTeachersRows((teachersResult.data as TeacherRow[]) ?? []);
    setPaymentsRows((paymentsResult.data as PaymentRow[]) ?? []);
    setAttendanceRows((attendanceResult.data as AttendanceRow[]) ?? []);
    setEventsRows((eventsResult.data as EventRow[]) ?? []);
    setInventoryRows((inventoryResult.data as InventoryRow[]) ?? []);
    setProfilesRows((profilesResult.data as ProfileRow[]) ?? []);
    setGradesRows((gradesResult.data as GradeRow[]) ?? []);
    setClassesRows((classesResult.data as ClassRow[]) ?? []);
    setNotificationsRows((notificationsResult.data as NotificationRow[]) ?? []);
    setReportsRows((reportsResult.data as ReportRow[]) ?? []);
    setMeetingsRows((meetingsResult.data as MeetingRow[]) ?? []);
    setStatus("ready");
  }, [session]);

  useEffect(() => {
    if (!session) {
      clearData();
      setError(null);
      setStatus("idle");
      return;
    }

    void refreshData();
  }, [session, refreshData]);

  const students = studentsRows.map((row) => {
    const collected = paymentsRows
      .filter((payment) => payment.student_id === row.id)
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const feesTotal = Number(row.fees_total ?? 0);
    return {
      id: row.id,
      name: row.full_name,
      grade: row.class_name,
      gpa: normalizeGpa(row.avg_grade),
      status: row.status ?? "Active",
      attendance: Number(row.attendance_rate ?? 0),
      fees: inferFeeStatus(feesTotal, collected),
      avatar: getInitials(row.full_name),
      dob: normalizeDate(row.dob),
      parent: row.guardian_name ?? "Not set",
      guardianEmail: row.guardian_email ?? "",
      phone: row.phone ?? "Not set",
      joined: normalizeDate(row.created_at),
      email: row.email ?? "",
      feesTotal,
    } satisfies StudentView;
  });

  const teachers = teachersRows.map((row) => {
    const classNames = (row.class_name ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const studentsCount = studentsRows.filter((student) => classNames.includes(student.class_name)).length;
    const subjectScores = gradesRows
      .filter((grade) => grade.subject === row.subject)
      .map((grade) => Number(grade.score ?? 0))
      .filter((value) => value > 0);
    const averageScore = subjectScores.length
      ? subjectScores.reduce((sum, value) => sum + value, 0) / subjectScores.length
      : 80;

    return {
      id: row.teacher_id,
      name: row.full_name,
      subject: row.subject ?? "Unassigned",
      classes: classNames,
      status: row.status ?? "Active",
      experience: `${Math.max(1, new Date().getFullYear() - new Date(row.created_at ?? Date.now()).getFullYear())} years`,
      email: row.email ?? "",
      phone: row.phone ?? "",
      avatar: getInitials(row.full_name),
      rating: Number((Math.min(5, Math.max(3.5, averageScore / 20))).toFixed(1)),
      students: studentsCount,
    } satisfies TeacherView;
  });

  const events = eventsRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    date: normalizeDate(row.date),
    time: row.time ?? "09:00",
    type: row.type ?? "Academic",
    status: deriveEventStatus(row.date, row.status),
    location: row.venue ?? "Main Hall",
    attendees: Number.parseInt(row.audience ?? "0", 10) || 0,
  }));

  const inventoryItems = inventoryRows.map((row) => {
    const quantity = Number(row.quantity ?? 0);
    const minStock = Number(row.reorder_level ?? 0);
    return {
      id: row.id,
      name: row.item ?? "Untitled Item",
      category: row.category ?? "General",
      quantity,
      minStock,
      status: row.status ?? (quantity <= minStock ? "Low Stock" : "In Stock"),
      lastUpdated: normalizeDate(row.created_at),
      value: quantity * 50,
    } satisfies InventoryView;
  });

  const users = profilesRows.map((row) => ({
    id: row.id,
    name: row.full_name ?? "Unnamed User",
    role: row.role ?? "User",
    email: row.email ?? "",
    status: row.status ?? "Active",
    lastLogin: normalizeDate(row.created_at),
    avatar: getInitials(row.full_name ?? "User"),
  }));

  const currentUserProfile = users.find(
    (user) => user.email && user.email.toLowerCase() === (session?.user.email ?? "").toLowerCase()
  );
  const metadataName =
    typeof session?.user.user_metadata?.full_name === "string"
      ? session.user.user_metadata.full_name
      : typeof session?.user.user_metadata?.name === "string"
        ? session.user.user_metadata.name
        : "";
  const currentUserName = currentUserProfile?.name || metadataName || session?.user.email?.split("@")[0] || "User";
  const currentUserEmail = currentUserProfile?.email ?? session?.user.email ?? "";
  const currentUserRole = normalizeRole(currentUserProfile?.role ?? deriveSessionRole(session));

  const attendanceMap = new Map<string, AttendanceSummary>();
  attendanceRows.forEach((row) => {
    const date = normalizeDate(row.date);
    if (!date) return;
    const existing = attendanceMap.get(date) ?? {
      date,
      present: 0,
      absent: 0,
      late: 0,
      total: students.length || 0,
    };
    const normalizedStatus = (row.status ?? "").toLowerCase();
    if (normalizedStatus === "present") existing.present += 1;
    if (normalizedStatus === "absent") existing.absent += 1;
    if (normalizedStatus === "late") existing.late += 1;
    existing.total = Math.max(existing.total, existing.present + existing.absent + existing.late);
    attendanceMap.set(date, existing);
  });
  const attendanceData = Array.from(attendanceMap.values()).sort((a, b) => b.date.localeCompare(a.date));

  const totalRevenue = students.reduce((sum, student) => sum + student.feesTotal, 0);
  const collected = paymentsRows.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const paymentsByMonth = new Map<string, number>();
  paymentsRows.forEach((payment) => {
    const date = payment.date ? new Date(payment.date) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const month = date.toLocaleDateString("en", { month: "short" });
    paymentsByMonth.set(month, (paymentsByMonth.get(month) ?? 0) + Number(payment.amount ?? 0));
  });
  const feeBreakdownMap = new Map<string, { amount: number; collected: number }>();
  paymentsRows.forEach((payment) => {
    const key = payment.method ?? "General";
    const current = feeBreakdownMap.get(key) ?? { amount: 0, collected: 0 };
    current.collected += Number(payment.amount ?? 0);
    current.amount += Number(payment.amount ?? 0);
    feeBreakdownMap.set(key, current);
  });
  if (!feeBreakdownMap.size) {
    feeBreakdownMap.set("Tuition", { amount: totalRevenue, collected });
  }

  const financeData: FinanceOverview = {
    totalRevenue,
    collected,
    outstanding: Math.max(totalRevenue - collected, 0),
    expenses: Math.round(collected * 0.25),
    monthlyData: Array.from(paymentsByMonth.entries()).map(([month, revenue]) => ({
      month,
      revenue,
      expenses: Math.round(revenue * 0.25),
    })),
    feeBreakdown: Array.from(feeBreakdownMap.entries()).map(([category, value]) => ({
      category,
      amount: value.amount,
      collected: value.collected,
      percentage: value.amount > 0 ? Math.round((value.collected / value.amount) * 100) : 0,
    })),
    recentTransactions: paymentsRows.slice(0, 8).map((payment) => ({
      id: payment.id,
      student: payment.student_name ?? "Unknown Student",
      amount: Number(payment.amount ?? 0),
      type: payment.method ?? "Payment",
      date: normalizeDate(payment.date),
      status: payment.receipt ? "Completed" : "Pending",
    })),
  };

  const classesData = classesRows.map((row, index) => {
    const members = students.filter((student) => student.grade === row.name);
    return {
      id: row.id,
      name: row.name ?? `Class ${index + 1}`,
      level: (row.name ?? "").split(/[A-Z]$/)[0].trim() || row.name || "General",
      classTeacher: row.teacher ?? "Unassigned",
      room: `Room ${101 + index}`,
      students: members.length,
      capacity: 30,
      avgGpa: Number(
        (members.reduce((sum, student) => sum + student.gpa, 0) / Math.max(members.length, 1)).toFixed(1),
      ),
      avgAttendance: Math.round(
        members.reduce((sum, student) => sum + student.attendance, 0) / Math.max(members.length, 1),
      ),
      subjects: (row.subjects ?? "").split(",").filter(Boolean).length || 1,
    } satisfies ClassView;
  });

  const notifications = notificationsRows.map((row) => ({
    id: row.id,
    title: row.title ?? "Untitled notification",
    message: `${row.channel ?? "System"} notification for ${row.audience ?? "school-wide"} audience.`,
    time: formatRelativeTime(row.send_at ?? row.created_at),
    type: row.channel ?? "System",
    read: (row.status ?? "").toLowerCase() === "read",
    priority: getStatusPriority(row.status),
  }));

  const recentActivity: ActivityView[] = [
    ...studentsRows.slice(0, 2).map((row) => ({
      id: `student-${row.id}`,
      text: `New student ${row.full_name} enrolled in ${row.class_name}`,
      tag: "Enrollment",
      time: formatRelativeTime(row.created_at),
      sortValue: new Date(row.created_at ?? 0).getTime() || 0,
      icon: "ri-user-add-line",
      tagBg: "bg-violet-100",
      tagText: "text-violet-700",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    })),
    ...paymentsRows.slice(0, 2).map((row) => ({
      id: `payment-${row.id}`,
      text: `Fee payment GH₵${Number(row.amount ?? 0).toLocaleString()} received — ${row.student_name ?? "Unknown Student"}`,
      tag: "Finance",
      time: formatRelativeTime(row.created_at ?? row.date),
      sortValue: new Date(row.created_at ?? row.date ?? 0).getTime() || 0,
      icon: "ri-money-dollar-circle-line",
      tagBg: "bg-emerald-100",
      tagText: "text-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    })),
    ...attendanceData.slice(0, 1).map((row) => ({
      id: `attendance-${row.date}`,
      text: `Attendance marked for ${row.date} — ${row.present}/${row.total} present`,
      tag: "Attendance",
      time: formatRelativeTime(row.date),
      sortValue: new Date(row.date).getTime() || 0,
      icon: "ri-calendar-check-line",
      tagBg: "bg-amber-100",
      tagText: "text-amber-700",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    })),
    ...eventsRows.slice(0, 1).map((row) => ({
      id: `event-${row.id}`,
      text: `Event ${row.title} is scheduled for ${normalizeDate(row.date)}`,
      tag: "Event",
      time: formatRelativeTime(row.created_at ?? row.date),
      sortValue: new Date(row.created_at ?? row.date ?? 0).getTime() || 0,
      icon: "ri-calendar-event-line",
      tagBg: "bg-rose-100",
      tagText: "text-rose-700",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    })),
  ]
    .sort((a, b) => b.sortValue - a.sortValue)
    .slice(0, 6)
    .map(({ sortValue: _sortValue, ...item }) => item);

  const topStudents = [...students]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 5)
    .map((student, index) => ({
      rank: index + 1,
      initials: student.avatar,
      name: student.name,
      class: student.grade,
      score: Number((student.gpa * 25).toFixed(1)),
      gradient: gradeColors[index % gradeColors.length],
      rankColor: index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-orange-400" : "text-slate-300",
    }));

  const gradeDistribution = useMemo(() => {
    const buckets = [
      { label: "A (80-100)", min: 80, max: 100, color: "#8b5cf6", light: "bg-violet-500" },
      { label: "B (70-79)", min: 70, max: 79, color: "#f59e0b", light: "bg-amber-400" },
      { label: "C (60-69)", min: 60, max: 69, color: "#10b981", light: "bg-emerald-500" },
      { label: "D (0-59)", min: 0, max: 59, color: "#f43f5e", light: "bg-rose-500" },
    ];

    return buckets.map((bucket) => ({
      label: bucket.label,
      count: students.filter((student) => {
        const score = student.gpa * 25;
        return score >= bucket.min && score <= bucket.max;
      }).length,
      color: bucket.color,
      light: bucket.light,
    }));
  }, [students]);

  const gradeSubjects = Array.from(new Set(gradesRows.map((row) => row.subject).filter(Boolean))) as string[];

  const addStudent = async (payload: {
    fullName: string;
    dob: string;
    grade: string;
    parent: string;
    guardianEmail: string;
    phone?: string;
    email?: string;
  }) => {
    const row = {
      id: `stu_${Date.now()}`,
      full_name: payload.fullName,
      class_name: payload.grade,
      gender: "Unknown",
      dob: payload.dob,
      guardian_name: payload.parent,
      guardian_email: payload.guardianEmail.trim().toLowerCase() || null,
      email: payload.email ?? "",
      phone: payload.phone ?? "",
      status: "Active",
      fees_total: 2000,
      avg_grade: 325,
      attendance_rate: 100,
      entered_by: "frontend",
    };

    const { data, error: insertError } = await supabase.from("students").insert(row).select().single();
    if (insertError) throw insertError;
    setStudentsRows((prev) => [data as StudentRow, ...prev]);
  };

  const updateStudent = async (
    id: string,
    payload: { name?: string; grade?: string; parent?: string; email?: string; guardianEmail?: string }
  ) => {
    const updates: Record<string, string | null> = {};
    if (payload.name !== undefined) updates.full_name = payload.name;
    if (payload.grade !== undefined) updates.class_name = payload.grade;
    if (payload.parent !== undefined) updates.guardian_name = payload.parent;
    if (payload.email !== undefined) updates.email = payload.email;
    if (payload.guardianEmail !== undefined)
      updates.guardian_email = payload.guardianEmail.trim().toLowerCase() || null;

    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) throw error;

    setStudentsRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const addTeacher = async (payload: {
    fullName: string;
    subject: string;
    email: string;
    phone: string;
    yearsOfExperience: string;
    className?: string;
  }) => {
    const row = {
      teacher_id: `tch_${Date.now()}`,
      full_name: payload.fullName,
      subject: payload.subject,
      class_name: payload.className ?? "",
      email: payload.email,
      phone: payload.phone,
      status: "Active",
    };

    const { data, error: insertError } = await supabase.from("teachers").insert(row).select().single();
    if (insertError) throw insertError;
    setTeachersRows((prev) => [data as TeacherRow, ...prev]);
  };

  const addEvent = async (payload: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    attendees: string;
    type: string;
    status?: string;
  }) => {
    const row = {
      id: `evt_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      type: payload.type,
      date: payload.date,
      time: payload.time,
      audience: payload.attendees,
      venue: payload.location,
      status: payload.status ?? "Upcoming",
    };
    const { data, error: insertError } = await supabase.from("events").insert(row).select().single();
    if (insertError) throw insertError;
    setEventsRows((prev) => [data as EventRow, ...prev]);
  };

  const updateEvent = async (payload: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    attendees: string;
    type: string;
    status?: string;
  }) => {
    const row = {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      date: payload.date,
      time: payload.time,
      audience: payload.attendees,
      venue: payload.location,
      status: payload.status ?? "Upcoming",
    };
    const { data, error: updateError } = await supabase
      .from("events")
      .update(row)
      .eq("id", payload.id)
      .select()
      .single();
    if (updateError) throw updateError;
    setEventsRows((prev) => prev.map((event) => (event.id === payload.id ? (data as EventRow) : event)));
  };

  const addInventoryItem = async (payload: {
    itemName: string;
    quantity: string;
    minimumStock: string;
    unitValue: string;
    category: string;
  }) => {
    const quantity = Number(payload.quantity);
    const reorderLevel = Number(payload.minimumStock);
    const row = {
      id: `inv_${Date.now()}`,
      item: payload.itemName,
      category: payload.category,
      quantity,
      unit: "pcs",
      reorder_level: reorderLevel,
      status: quantity <= reorderLevel ? "Low Stock" : "In Stock",
    };
    const { data, error: insertError } = await supabase.from("inventory").insert(row).select().single();
    if (insertError) throw insertError;
    setInventoryRows((prev) => [data as InventoryRow, ...prev]);
  };

  const addUser = async (payload: { fullName: string; email: string; role: string }) => {
    const row = {
      id: crypto.randomUUID(),
      email: payload.email,
      full_name: payload.fullName,
      role: payload.role,
      status: "Active",
    };
    const { data, error: insertError } = await supabase.from("profiles").insert(row).select().single();
    if (insertError) throw insertError;
    setProfilesRows((prev) => [data as ProfileRow, ...prev]);
  };

  const recordPayment = async (payload: {
    studentId: string;
    studentName: string;
    amount: string;
    method: string;
    date: string;
  }) => {
    const row = {
      id: `pay_${Date.now()}`,
      student_id: payload.studentId,
      student_name: payload.studentName,
      amount: Number(payload.amount),
      date: payload.date,
      method: payload.method,
      receipt: `RCT-${Date.now()}`,
    };
    const { data, error: insertError } = await supabase.from("payments").insert(row).select().single();
    if (insertError) throw insertError;
    setPaymentsRows((prev) => [data as PaymentRow, ...prev]);
  };

  const saveAttendance = async (payload: {
    date: string;
    entries: Array<{ studentId: string; studentName: string; className: string; status: "Present" | "Absent" | "Late" }>;
  }) => {
    const rows = payload.entries.map((entry) => ({
      id: `${payload.date}_${entry.studentId}`,
      student: entry.studentName,
      class_name: entry.className,
      date: payload.date,
      status: entry.status,
    }));
    const { data, error: upsertError } = await supabase.from("attendance").upsert(rows).select();
    if (upsertError) throw upsertError;

    setAttendanceRows((prev) => {
      const remaining = prev.filter((row) => normalizeDate(row.date) !== payload.date);
      return [...((data as AttendanceRow[]) ?? []), ...remaining];
    });
  };

  const markNotificationRead = async (notificationId: string) => {
    const { data, error: updateError } = await supabase
      .from("notifications")
      .update({ status: "Read" })
      .eq("id", notificationId)
      .select()
      .single();

    if (updateError) throw updateError;
    setNotificationsRows((prev) => prev.map((row) => (row.id === notificationId ? (data as NotificationRow) : row)));
  };

  const meetings: MeetingView[] = meetingsRows.map((row) => {
    let participants: MeetingParticipant[] = [];
    try {
      participants = row.participant_emails ? JSON.parse(row.participant_emails) : [];
    } catch { participants = []; }
    return {
      id: row.id,
      title: row.title,
      type: row.type ?? "General",
      description: row.description ?? "",
      date: normalizeDate(row.scheduled_date),
      time: row.scheduled_time ?? "09:00",
      roomName: row.room_name,
      hostName: row.host_name ?? "Unknown",
      status: row.status ?? "Scheduled",
      participants,
    };
  });

  const addMeeting = async (payload: {
    title: string;
    type: string;
    description: string;
    date: string;
    time: string;
    hostName: string;
    participants: MeetingParticipant[];
  }) => {
    const slug = payload.type.toLowerCase().replace(/\s+/g, "-");
    const row: MeetingRow = {
      id: `mtg_${Date.now()}`,
      title: payload.title,
      type: payload.type,
      description: payload.description,
      scheduled_date: payload.date,
      scheduled_time: payload.time,
      room_name: `edumanage-${slug}-${Date.now()}`,
      host_name: payload.hostName,
      status: "Scheduled",
      participant_emails: payload.participants.length ? JSON.stringify(payload.participants) : null,
    };
    const { data, error: insertError } = await supabase.from("meetings").insert(row).select().single();
    if (insertError) throw insertError;
    setMeetingsRows((prev) => [data as MeetingRow, ...prev]);
  };

  const updateMeeting = async (id: string, payload: {
    title?: string;
    type?: string;
    description?: string;
    date?: string;
    time?: string;
    status?: string;
    participants?: MeetingParticipant[];
  }) => {
    const updates: Record<string, string | null> = {};
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.type !== undefined) updates.type = payload.type;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.date !== undefined) updates.scheduled_date = payload.date;
    if (payload.time !== undefined) updates.scheduled_time = payload.time;
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.participants !== undefined)
      updates.participant_emails = payload.participants.length ? JSON.stringify(payload.participants) : null;
    const { data, error } = await supabase.from("meetings").update(updates).eq("id", id).select().single();
    if (error) throw error;
    setMeetingsRows((prev) => prev.map((r) => (r.id === id ? (data as MeetingRow) : r)));
  };

  const deleteMeeting = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) throw error;
    setMeetingsRows((prev) => prev.filter((r) => r.id !== id));
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = notificationsRows
      .filter((row) => (row.status ?? "").toLowerCase() !== "read")
      .map((row) => row.id);
    if (!unreadIds.length) return;

    const { data, error: updateError } = await supabase
      .from("notifications")
      .update({ status: "Read" })
      .in("id", unreadIds)
      .select();

    if (updateError) throw updateError;
    const updated = (data as NotificationRow[]) ?? [];
    setNotificationsRows((prev) => prev.map((row) => updated.find((item) => item.id === row.id) ?? row));
  };

  const value: SchoolDataContextValue = {
    status,
    error,
    currentUserRole,
    currentUserName,
    currentUserEmail,
    myLinkedStudents: students.filter(
      (s) => s.guardianEmail && s.guardianEmail.toLowerCase() === currentUserEmail.toLowerCase()
    ),
    refreshData,
    students,
    teachers,
    events,
    inventoryItems,
    users,
    attendanceData,
    financeData,
    classesData,
    notifications,
    meetings,
    reports: reportsRows,
    gradesRows,
    gradeSubjects,
    recentActivity,
    topStudents,
    gradeDistribution,
    addStudent,
    updateStudent,
    addTeacher,
    addEvent,
    updateEvent,
    addInventoryItem,
    addUser,
    recordPayment,
    saveAttendance,
    markNotificationRead,
    markAllNotificationsRead,
    addMeeting,
    updateMeeting,
    deleteMeeting,
  };

  return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>;
}

export function useSchoolData() {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error("useSchoolData must be used within SchoolDataProvider.");
  }
  return context;
}
