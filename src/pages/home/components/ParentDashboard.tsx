import { useSchoolData } from "@/contexts/SchoolDataContext";

const feeColors = {
  Paid:    { pill: "bg-emerald-100 text-emerald-700", icon: "ri-checkbox-circle-line" },
  Pending: { pill: "bg-amber-100 text-amber-700",    icon: "ri-time-line" },
  Overdue: { pill: "bg-rose-100 text-rose-600",      icon: "ri-error-warning-line" },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-teal-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8 text-right">{score}%</span>
    </div>
  );
}

export default function ParentDashboard() {
  const {
    myLinkedStudents,
    gradesRows,
    gradeSubjects,
    attendanceData,
    events,
    currentUserName,
  } = useSchoolData();

  const subjects = gradeSubjects.length
    ? gradeSubjects
    : ["Mathematics", "English", "Science", "Social Studies", "ICT"];

  const upcomingEvents = events.filter((e) => e.status === "Upcoming").slice(0, 4);

  if (myLinkedStudents.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-100 p-10 max-w-md text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <i className="ri-parent-line text-violet-400 text-2xl"></i>
          </div>
          <p className="text-slate-800 font-bold text-base mb-2">No linked student found</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your account hasn't been linked to a student yet. Please contact the school administrator to set this up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Portal</p>
        <h2 className="text-2xl font-black text-slate-800 mt-0.5">
          Welcome back, {currentUserName.split(" ")[0]}.
        </h2>
      </div>

      {/* One card per linked student */}
      {myLinkedStudents.map((student) => {
        const studentGrades = subjects.map((sub) => {
          const row = gradesRows.find((r) => r.student === student.name && r.subject === sub);
          return { subject: sub, score: row?.score != null ? Number(row.score) : null };
        }).filter((g) => g.score !== null) as { subject: string; score: number }[];

        const feeStyle = feeColors[student.fees];
        const attendanceColor =
          student.attendance >= 90 ? "text-emerald-600" :
          student.attendance >= 75 ? "text-amber-600" : "text-rose-600";

        return (
          <div key={student.id} className="space-y-4">
            {/* Student profile hero */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black flex-shrink-0">
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black leading-tight">{student.name}</p>
                  <p className="text-white/70 text-sm mt-0.5">{student.grade}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="flex items-center gap-1 bg-white/15 rounded-lg px-2.5 py-1 text-xs font-semibold">
                      <i className="ri-calendar-check-line"></i> {student.attendance}% attendance
                    </span>
                    <span className="flex items-center gap-1 bg-white/15 rounded-lg px-2.5 py-1 text-xs font-semibold">
                      <i className="ri-bar-chart-2-line"></i> GPA {student.gpa}
                    </span>
                    <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${feeStyle.pill}`}>
                      <i className={feeStyle.icon}></i> Fees {student.fees}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Attendance",   value: `${student.attendance}%`,        icon: "ri-calendar-check-line",  color: attendanceColor },
                { label: "GPA",          value: String(student.gpa),              icon: "ri-bar-chart-2-line",     color: "text-violet-600" },
                { label: "Fee Status",   value: student.fees,                     icon: feeStyle.icon,             color: feeStyle.pill.split(" ")[1] },
                { label: "Class",        value: student.grade,                    icon: "ri-group-line",           color: "text-slate-600" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <i className={`${m.icon} ${m.color} text-base`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-800 truncate">{m.value}</p>
                    <p className="text-xs text-slate-400">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Grades & attendance side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Subject grades */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Subject Scores
                </p>
                {studentGrades.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No grades recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {studentGrades.map(({ subject, score }) => (
                      <div key={subject}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-slate-700">{subject}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            score >= 80 ? "bg-teal-50 text-teal-700" :
                            score >= 60 ? "bg-amber-50 text-amber-700" :
                            "bg-rose-50 text-rose-600"
                          }`}>
                            {score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D"}
                          </span>
                        </div>
                        <ScoreBar score={score} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly attendance */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  School Attendance This Week
                </p>
                {attendanceData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No attendance data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {attendanceData.slice(0, 6).map((d) => {
                      const pct = Math.round((d.present / d.total) * 100);
                      const day = new Date(d.date).toLocaleDateString("en", {
                        weekday: "short", day: "numeric", month: "short",
                      });
                      return (
                        <div key={d.date}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-slate-600">{day}</p>
                            <p className="text-xs font-semibold text-slate-500">{pct}%</p>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 90 ? "bg-emerald-400" : pct >= 75 ? "bg-amber-400" : "bg-rose-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Upcoming School Events</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-event-line text-violet-500 text-sm"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ev.date}{ev.time ? ` · ${ev.time}` : ""}</p>
                  <p className="text-[11px] text-slate-400">{ev.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
