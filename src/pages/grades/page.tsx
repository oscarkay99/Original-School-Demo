import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { students } from "@/mocks/schoolData";

const subjects = ["Mathematics", "English", "Science", "Social Studies", "ICT", "French"];

const gradesData = students.map((s) => ({
  ...s,
  scores: subjects.reduce((acc, sub) => {
    const base = Math.round(s.gpa * 22 + Math.random() * 8);
    acc[sub] = Math.min(100, Math.max(50, base + Math.floor(Math.random() * 15) - 7));
    return acc;
  }, {} as Record<string, number>),
}));

function getGrade(score: number) {
  if (score >= 90) return { letter: "A+", color: "text-teal-600 bg-teal-50" };
  if (score >= 80) return { letter: "A", color: "text-teal-600 bg-teal-50" };
  if (score >= 70) return { letter: "B", color: "text-slate-600 bg-slate-100" };
  if (score >= 60) return { letter: "C", color: "text-amber-600 bg-amber-50" };
  return { letter: "D", color: "text-rose-600 bg-rose-50" };
}

export default function GradesPage() {
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search, setSearch] = useState("");

  const grades = ["All", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];

  const filtered = gradesData.filter((s) => {
    const matchGrade = selectedGrade === "All" || s.grade.startsWith(selectedGrade);
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchGrade && matchSearch;
  });

  return (
    <AppLayout title="Grades" subtitle="Academic scores and grade management">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "A Grade Students", value: students.filter((s) => s.gpa >= 3.5).length, icon: "ri-medal-line" },
          { label: "School Avg Score", value: "82%", icon: "ri-bar-chart-2-line" },
          { label: "Subjects Tracked", value: subjects.length, icon: "ri-book-open-line" },
          { label: "Needs Attention", value: students.filter((s) => s.gpa < 3.0).length, icon: "ri-error-warning-line" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
              <i className={`${m.icon} text-slate-500 text-base`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all w-52"
          />
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100">
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedGrade === g ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none cursor-pointer"
        >
          <option value="All">All Subjects</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 whitespace-nowrap">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Grade</th>
                {(selectedSubject === "All" ? subjects : [selectedSubject]).map((sub) => (
                  <th key={sub} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{sub}</th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">GPA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s, idx) => {
                const displaySubs = selectedSubject === "All" ? subjects : [selectedSubject];
                const avg = Math.round(displaySubs.reduce((a, sub) => a + s.scores[sub], 0) / displaySubs.length);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-5 py-3 sticky left-0 bg-white group-hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                          <span className="text-slate-600 text-xs font-bold">{s.avatar}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{s.grade}</td>
                    {displaySubs.map((sub) => {
                      const score = s.scores[sub];
                      const g = getGrade(score);
                      return (
                        <td key={sub} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">{score}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${g.color}`}>{g.letter}</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-teal-600">{s.gpa}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-500">#{idx + 1}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
