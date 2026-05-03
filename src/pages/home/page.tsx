import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import MetricCard from "./components/MetricCard";
import AttendanceChart from "./components/AttendanceChart";
import FeeVelocity from "./components/FeeVelocity";
import GradeDistribution from "./components/GradeDistribution";
import RecentActivity from "./components/RecentActivity";
import TopStudents from "./components/TopStudents";
import QuickActions from "./components/QuickActions";
import { useCountUp } from "@/hooks/useCountUp";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import ParentDashboard from "./components/ParentDashboard";

function HeroBanner({ isTeacher }: { isTeacher?: boolean }) {
  const { students } = useSchoolData();
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const [year, setYear] = useState("2025/26");
  const [term, setTerm] = useState("All Terms");
  const avgAnim = useCountUp(80.5, 1600, 1);
  const attendanceAnim = useCountUp(83, 1600, 0);

  return (
    <div
      className="rounded-3xl overflow-hidden relative mb-6"
      style={{ background: "linear-gradient(135deg, #2d1b69 0%, #1a1040 40%, #0f172a 100%)" }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 70% 50%, #4c1d95 0%, transparent 60%)" }}></div>
      <div className="absolute top-4 right-16 w-48 h-48 rounded-full opacity-10 blur-3xl bg-violet-400"></div>
      <div className="absolute -bottom-8 right-4 w-64 h-64 rounded-full opacity-10 blur-3xl bg-sky-400"></div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 px-8 py-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">Live Command Center</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2 tracking-tight">
            EduManage Pro<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)" }}
            >
              Executive Dashboard
            </span>
          </h2>
          <p className="text-white/50 text-sm max-w-md leading-relaxed">
            {isTeacher
              ? "Real-time insights into classroom attendance, learner performance, and academic momentum."
              : "Real-time insights — student health, fee collection, academic momentum & operational risk."}
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { icon: "ri-calendar-line", label: "2025/26" },
              { icon: "ri-time-line", label: "All Terms" },
              { icon: "ri-group-line", label: `${activeStudents} Active Learners` },
              { icon: "ri-map-pin-line", label: "Accra, Ghana" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full font-medium border border-white/10"
              >
                <i className={`${tag.icon} text-xs`}></i>
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stat panels */}
        <div className="flex gap-3 flex-wrap">
          {isTeacher ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[160px]">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Attendance Rate</p>
              <p className="text-3xl font-extrabold text-white leading-none tabular-nums">
                {Math.round(attendanceAnim)}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                <p className="text-emerald-400 text-xs font-semibold">Strong classroom turnout</p>
              </div>
              <p className="text-white/30 text-[10px] mt-1">Present learners across active classes</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[160px]">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Collection Velocity</p>
              <p className="text-3xl font-extrabold text-white leading-none tabular-nums">
                GH₵18k
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                <p className="text-emerald-400 text-xs font-semibold">53% of target</p>
              </div>
              <p className="text-white/30 text-[10px] mt-1">Outstanding GH₵16,250</p>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[140px]">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Academic Avg</p>
            <p className="text-3xl font-extrabold text-white leading-none tabular-nums">
              {avgAnim.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 mt-2">
              <i className="ri-arrow-up-line text-emerald-400 text-xs"></i>
              <p className="text-emerald-400 text-xs font-semibold">+1.2% this term</p>
            </div>
            <p className="text-white/30 text-[10px] mt-1">16 assessment records</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative z-10 flex items-center gap-3 px-8 pb-5">
        <div className="flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
          <i className="ri-calendar-line text-white/50 text-sm"></i>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="text-xs text-white bg-transparent outline-none cursor-pointer font-medium"
          >
            <option className="text-slate-800">2025/26</option>
            <option className="text-slate-800">2024/25</option>
            <option className="text-slate-800">2023/24</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
          <i className="ri-time-line text-white/50 text-sm"></i>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="text-xs text-white bg-transparent outline-none cursor-pointer font-medium"
          >
            <option className="text-slate-800">All Terms</option>
            <option className="text-slate-800">Term 1</option>
            <option className="text-slate-800">Term 2</option>
            <option className="text-slate-800">Term 3</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { students, teachers, currentUserRole } = useSchoolData();
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const presentToday = students.filter((s) => s.attendance >= 90).length;
  const avgGrade = Math.round((students.reduce((a, b) => a + b.gpa, 0) / Math.max(students.length, 1)) * 25);
  const isTeacher = currentUserRole === "Teacher";

  if (currentUserRole === "Parent") {
    return (
      <AppLayout title="Parent Portal" subtitle="Your child's school overview">
        <ParentDashboard />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" subtitle="Live command center · AY 2025/26">
      <div className="space-y-6">

        {/* Hero */}
        <HeroBanner isTeacher={isTeacher} />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Students"
            value={students.length}
            sub="All active learners enrolled"
            icon="ri-group-2-line"
            gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
            change="+8%"
            changeUp
            path="/students"
          />
          <MetricCard
            label="Teaching Staff"
            value={teachers.length}
            sub={`${teachers.length} classes · 100% coverage`}
            icon="ri-user-star-line"
            gradient="linear-gradient(135deg, #059669 0%, #047857 100%)"
            change="+1 new"
            changeUp
            path="/teachers"
          />
          <MetricCard
            label="Present Today"
            value={presentToday}
            sub={`of ${activeStudents} active · 83% rate`}
            icon="ri-calendar-check-line"
            gradient="linear-gradient(135deg, #d97706 0%, #b45309 100%)"
            change="83%"
            changeUp
            path="/attendance"
          />
          <MetricCard
            label="Average Grade"
            value={avgGrade}
            sub="16 assessment records"
            icon="ri-bar-chart-line"
            gradient="linear-gradient(135deg, #e11d48 0%, #be123c 100%)"
            suffix="%"
            change="+1.2%"
            changeUp
            path="/grades"
          />
        </div>

        {/* Attendance + Role Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AttendanceChart />
          </div>
          {!isTeacher && (
            <div>
              <FeeVelocity />
            </div>
          )}
          {isTeacher && (
            <div>
              <GradeDistribution />
            </div>
          )}
        </div>

        {/* Grade Distribution + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {!isTeacher && (
            <div>
              <GradeDistribution />
            </div>
          )}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* Top Performers + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopStudents />
          <QuickActions />
        </div>

      </div>
    </AppLayout>
  );
}
