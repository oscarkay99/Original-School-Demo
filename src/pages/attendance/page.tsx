import { useState, useMemo } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const avatarGradients = [
  "from-orange-400 to-rose-500",
  "from-violet-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];

const statusStyle: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Absent: "bg-rose-100 text-rose-600 border-rose-200",
  Late: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function AttendancePage() {
  const { students, attendanceData, saveAttendance } = useSchoolData();
  const [selectedDate, setSelectedDate] = useState("2026-04-21");
  const [selectedClass, setSelectedClass] = useState("All");
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent" | "Late">>(() => {
    const init: Record<string, "Present" | "Absent" | "Late"> = {};
    students.forEach((s) => { init[s.id] = "Present"; });
    return init;
  });

  const classes = useMemo(() => {
    const unique = Array.from(new Set(students.map((s) => s.grade))).sort();
    return ["All", ...unique];
  }, [students]);

  const visibleStudents = useMemo(
    () => selectedClass === "All" ? students : students.filter((s) => s.grade === selectedClass),
    [students, selectedClass]
  );

  const classSummaries = useMemo(() =>
    classes.slice(1).map((cls) => {
      const inClass = students.filter((s) => s.grade === cls);
      const present = inClass.filter((s) => attendance[s.id] === "Present").length;
      const absent = inClass.filter((s) => attendance[s.id] === "Absent").length;
      const late = inClass.filter((s) => attendance[s.id] === "Late").length;
      const rate = inClass.length ? Math.round((present / inClass.length) * 100) : 0;
      return { cls, total: inClass.length, present, absent, late, rate };
    }),
    [classes, students, attendance]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAttendance({
        date: selectedDate,
        entries: students.map((student) => ({
          studentId: student.id,
          studentName: student.name,
          className: student.grade,
          status: attendance[student.id] ?? "Present",
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    present: visibleStudents.filter((s) => attendance[s.id] === "Present").length,
    absent: visibleStudents.filter((s) => attendance[s.id] === "Absent").length,
    late: visibleStudents.filter((s) => attendance[s.id] === "Late").length,
  };

  const rate = visibleStudents.length ? Math.round((counts.present / visibleStudents.length) * 100) : 0;

  return (
    <AppLayout title="Attendance" subtitle="Track and manage daily student attendance">
      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Present", value: counts.present, icon: "ri-checkbox-circle-line", color: "text-emerald-500" },
          { label: "Absent", value: counts.absent, icon: "ri-close-circle-line", color: "text-rose-500" },
          { label: "Late", value: counts.late, icon: "ri-time-line", color: "text-amber-500" },
          { label: "Total", value: visibleStudents.length, icon: "ri-user-3-line", color: "text-slate-500" },
          { label: "Rate", value: `${rate}%`, icon: "ri-percent-line", color: rate >= 90 ? "text-emerald-500" : rate >= 75 ? "text-amber-500" : "text-rose-500" },
          { label: "Week Avg", value: "88%", icon: "ri-bar-chart-2-line", color: "text-violet-500" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50">
              <i className={`${m.icon} ${m.color} text-sm`}></i>
            </div>
            <p className="text-xl font-bold text-slate-800">{m.value}</p>
            <p className="text-xs text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Sheet */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Daily Attendance Sheet</p>
              <p className="text-xs text-slate-400 mt-0.5">Click status to toggle · {visibleStudents.length} students</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-300 cursor-pointer"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:opacity-90 cursor-pointer whitespace-nowrap shadow-md disabled:opacity-50"
              >
                <i className="ri-save-line text-sm"></i>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Class Tabs */}
          <div className="px-5 py-2.5 border-b border-slate-100 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {classes.map((cls) => {
                const isActive = cls === selectedClass;
                const summary = cls !== "All" ? classSummaries.find((c) => c.cls === cls) : null;
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    {cls === "All" ? (
                      <><i className="ri-group-line text-xs"></i> All Classes</>
                    ) : (
                      <>
                        {cls}
                        {summary && (
                          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {summary.present}/{summary.total}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mark All */}
          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 mr-1">Mark all:</span>
            {(["Present", "Absent", "Late"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setAttendance((prev) => {
                    const next = { ...prev };
                    visibleStudents.forEach((s) => { next[s.id] = status; });
                    return next;
                  });
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all hover:opacity-80 ${statusStyle[status]}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-slate-50">
            {visibleStudents.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No students in this class.</div>
            ) : (
              visibleStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-all">
                  <div className={`w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{s.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.grade}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {(["Present", "Absent", "Late"] as const).map((status) => {
                      const active = attendance[s.id] === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setAttendance((prev) => ({ ...prev, [s.id]: status }))}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${
                            active ? statusStyle[status] : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {status === "Present" && <><i className="ri-checkbox-circle-line mr-0.5"></i>P</>}
                          {status === "Absent" && <><i className="ri-close-circle-line mr-0.5"></i>A</>}
                          {status === "Late" && <><i className="ri-time-line mr-0.5"></i>L</>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Per-class breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Class Breakdown</p>
            <div className="space-y-3">
              {classSummaries.map(({ cls, total, present, absent, late, rate: r }) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls === selectedClass ? "All" : cls)}
                  className={`w-full text-left rounded-xl p-3 border transition-all cursor-pointer ${
                    selectedClass === cls
                      ? "border-violet-200 bg-violet-50"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-bold ${selectedClass === cls ? "text-violet-700" : "text-slate-700"}`}>{cls}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-semibold">{present}P</span>
                      <span className="text-[10px] text-rose-500 font-semibold">{absent}A</span>
                      <span className="text-[10px] text-amber-600 font-semibold">{late}L</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r >= 90 ? "bg-emerald-400" : r >= 75 ? "bg-amber-400" : "bg-rose-400"}`}
                        style={{ width: `${r}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{r}%</span>
                    <span className="text-[10px] text-slate-400">{total} students</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Summary */}
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
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Attendance Alerts</p>
            <div className="space-y-2">
              {visibleStudents.filter((s) => s.attendance < 85).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No alerts for this class.</p>
              ) : (
                visibleStudents.filter((s) => s.attendance < 85).map((s, i) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
