import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { students, attendanceData } from "@/mocks/schoolData";

const avatarGradients = [
  "from-orange-400 to-rose-500",
  "from-violet-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState("2026-04-21");
  const [attendance, setAttendance] = useState<Record<number, "Present" | "Absent" | "Late">>(() => {
    const init: Record<number, "Present" | "Absent" | "Late"> = {};
    students.forEach((s) => { init[s.id] = "Present"; });
    init[4] = "Absent";
    init[6] = "Late";
    return init;
  });

  const toggle = (id: number) => {
    setAttendance((prev) => {
      const cur = prev[id];
      const next = cur === "Present" ? "Absent" : cur === "Absent" ? "Late" : "Present";
      return { ...prev, [id]: next };
    });
  };

  const counts = {
    present: Object.values(attendance).filter((v) => v === "Present").length,
    absent: Object.values(attendance).filter((v) => v === "Absent").length,
    late: Object.values(attendance).filter((v) => v === "Late").length,
  };

  const statusStyle: Record<string, string> = {
    Present: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Absent: "bg-rose-100 text-rose-600 border-rose-200",
    Late: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <AppLayout title="Attendance" subtitle="Track and manage daily student attendance">
      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Present", value: counts.present, icon: "ri-checkbox-circle-line" },
          { label: "Absent", value: counts.absent, icon: "ri-close-circle-line" },
          { label: "Late", value: counts.late, icon: "ri-time-line" },
          { label: "Total", value: students.length, icon: "ri-user-3-line" },
          { label: "Rate", value: `${Math.round((counts.present / students.length) * 100)}%`, icon: "ri-percent-line" },
          { label: "Week Avg", value: "88%", icon: "ri-bar-chart-2-line" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100">
              <i className={`${m.icon} text-slate-500 text-sm`}></i>
            </div>
            <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>{m.value}</p>
            <p className="text-xs text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Sheet */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Daily Attendance Sheet</p>
              <p className="text-xs text-slate-400 mt-0.5">Click status to toggle</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-300 cursor-pointer"
              />
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:opacity-90 cursor-pointer whitespace-nowrap shadow-md">
                <i className="ri-save-line text-sm"></i>
                Save
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-all">
                <div className={`w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">{s.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.grade}</p>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:scale-105 whitespace-nowrap ${statusStyle[attendance[s.id]]}`}
                >
                  {attendance[s.id] === "Present" && <><i className="ri-checkbox-circle-line mr-1"></i>Present</>}
                  {attendance[s.id] === "Absent" && <><i className="ri-close-circle-line mr-1"></i>Absent</>}
                  {attendance[s.id] === "Late" && <><i className="ri-time-line mr-1"></i>Late</>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Weekly Summary</p>
            <div className="space-y-3">
              {attendanceData.map((d) => {
                const pct = Math.round((d.present / d.total) * 100);
                const day = new Date(d.date).toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" });
                return (
                  <div key={d.date}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-600">{day}</p>
                      <p className="text-xs font-semibold text-slate-700">{d.present}/{d.total}</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : pct >= 75 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Attendance Alerts</p>
            <div className="space-y-2">
              {students.filter((s) => s.attendance < 85).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{s.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-rose-500">{s.attendance}% attendance</p>
                  </div>
                  <i className="ri-error-warning-line text-rose-400 text-sm flex-shrink-0"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
