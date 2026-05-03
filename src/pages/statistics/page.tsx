import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import { downloadCsv } from "@/lib/download";

const gradeDistribution = [
  { grade: "Grade 8", students: 3, avgGpa: 3.9, attendance: 97 },
  { grade: "Grade 9", students: 3, avgGpa: 3.7, attendance: 93 },
  { grade: "Grade 10", students: 3, avgGpa: 3.4, attendance: 89 },
  { grade: "Grade 11", students: 3, avgGpa: 3.1, attendance: 82 },
];

const subjectPerformance = [
  { subject: "Mathematics", avg: 82, highest: 98, lowest: 61, teacher: "Mr. Samuel Agyei" },
  { subject: "English Language", avg: 88, highest: 99, lowest: 72, teacher: "Mrs. Grace Asiedu" },
  { subject: "Science", avg: 79, highest: 95, lowest: 58, teacher: "Mr. Daniel Osei" },
  { subject: "Social Studies", avg: 85, highest: 97, lowest: 68, teacher: "Ms. Patricia Adu" },
  { subject: "ICT", avg: 91, highest: 100, lowest: 74, teacher: "Mr. Emmanuel Boadu" },
  { subject: "French", avg: 76, highest: 94, lowest: 55, teacher: "Mrs. Comfort Nyarko" },
];

const termComparison = [
  { term: "Term 1 2024/25", avgGpa: 3.3, attendance: 86, feeCollection: 48 },
  { term: "Term 2 2024/25", avgGpa: 3.5, attendance: 89, feeCollection: 61 },
  { term: "Term 3 2024/25", avgGpa: 3.6, attendance: 91, feeCollection: 74 },
  { term: "Term 1 2025/26", avgGpa: 3.4, attendance: 88, feeCollection: 53 },
  { term: "Term 2 2025/26", avgGpa: 3.6, attendance: 90, feeCollection: 67 },
];

export default function StatisticsPage() {
  const { students, teachers, attendanceData, financeData, gradesRows } = useSchoolData();
  const avgGpa = students.length
    ? (students.reduce((a, b) => a + b.gpa, 0) / students.length).toFixed(2)
    : "0.00";
  const avgAttendance = students.length
    ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / students.length)
    : 0;
  const feeRate = financeData.totalRevenue
    ? Math.round((financeData.collected / financeData.totalRevenue) * 100)
    : 0;

  const exportStatistics = () => {
    downloadCsv(
      "statistics-subject-performance.csv",
      ["Subject", "Teacher", "Average", "Highest", "Lowest"],
      subjectPerformance.map((s) => [s.subject, s.teacher, `${s.avg}%`, `${s.highest}%`, `${s.lowest}%`]),
    );
  };

  return (
    <AppLayout title="Statistics" subtitle="Deep analytics and performance insights">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "School Average GPA", value: avgGpa, sub: "Out of 4.0", icon: "ri-medal-line", trend: "+0.2 vs last term" },
          { label: "Avg Attendance Rate", value: `${avgAttendance}%`, sub: "This term", icon: "ri-calendar-check-line", trend: "+3% vs last term" },
          { label: "Fee Collection Rate", value: `${feeRate}%`, sub: "Of total target", icon: "ri-money-dollar-circle-line", trend: "+6% vs last term" },
          { label: "Student-Teacher Ratio", value: `${students.length}:${teachers.length}`, sub: "Current ratio", icon: "ri-group-line", trend: "Optimal range" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100">
                <i className={`${m.icon} text-slate-500 text-base`}></i>
              </div>
              <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">{m.trend}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{m.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
            <p className="text-xs text-slate-300 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Performance by Grade</p>
              <p className="text-xs text-slate-400 mt-0.5">Average GPA and attendance per grade level</p>
            </div>
          </div>
          <div className="space-y-4">
            {gradeDistribution.map((g) => (
              <div key={g.grade} className="flex items-center gap-4">
                <div className="w-20 flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-700">{g.grade}</p>
                  <p className="text-xs text-slate-400">{g.students} students</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(g.avgGpa / 4) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{g.avgGpa}</span>
                    <span className="text-xs text-slate-400 w-8">GPA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${g.attendance}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{g.attendance}%</span>
                    <span className="text-xs text-slate-400 w-8">Att.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Term Comparison */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="mb-4">
            <p className="font-semibold text-slate-800 text-sm">Term-over-Term Comparison</p>
            <p className="text-xs text-slate-400 mt-0.5">GPA, attendance and fee collection trends</p>
          </div>
          <div className="space-y-3">
            {termComparison.map((t, i) => (
              <div key={t.term} className={`p-3 rounded-lg border ${i === termComparison.length - 1 ? "border-teal-200 bg-teal-50/50" : "border-slate-100"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700">{t.term}</p>
                  {i === termComparison.length - 1 && <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full font-bold">CURRENT</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-slate-400">Avg GPA</p>
                    <p className="text-sm font-bold text-slate-800">{t.avgGpa}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Attendance</p>
                    <p className="text-sm font-bold text-slate-800">{t.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fee Coll.</p>
                    <p className="text-sm font-bold text-slate-800">{t.feeCollection}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800 text-sm">Subject Performance Analysis</p>
            <p className="text-xs text-slate-400 mt-0.5">Average scores, highest and lowest per subject</p>
          </div>
          <button onClick={exportStatistics} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium cursor-pointer hover:bg-slate-100 transition-all">
            <i className="ri-download-line text-sm"></i>Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Subject", "Teacher", "Class Average", "Highest", "Lowest", "Performance"].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
            {subjectPerformance.map((s) => (
                <tr key={s.subject} className="hover:bg-slate-50 transition-all">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-semibold text-slate-800">{s.subject}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{s.teacher}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-sm font-bold ${s.avg >= 85 ? "text-teal-600" : s.avg >= 75 ? "text-slate-700" : "text-amber-600"}`}>{s.avg}%</span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-600">{s.highest}%</td>
                  <td className="py-3 pr-4 text-sm text-slate-600">{s.lowest}%</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.avg >= 85 ? "bg-teal-500" : s.avg >= 75 ? "bg-slate-400" : "bg-amber-400"}`} style={{ width: `${s.avg}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-400">{s.avg >= 85 ? "Excellent" : s.avg >= 75 ? "Good" : "Needs Attention"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance weekly breakdown */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="font-semibold text-slate-800 text-sm mb-4">Weekly Attendance Breakdown</p>
        <div className="flex items-end gap-3 h-36">
          {attendanceData.map((d, i) => {
            const pct = d.total ? Math.round((d.present / d.total) * 100) : 0;
            const day = new Date(d.date).toLocaleDateString("en", { weekday: "short" });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-xs font-bold text-slate-700">{pct}%</p>
                <div className="w-full flex flex-col justify-end rounded-t-lg overflow-hidden" style={{ height: "90px" }}>
                  <div className="w-full bg-teal-500 rounded-t-lg transition-all" style={{ height: `${pct}%` }}></div>
                </div>
                <p className="text-xs text-slate-400">{day}</p>
                <p className="text-xs text-slate-300">{d.present}/{d.total}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
