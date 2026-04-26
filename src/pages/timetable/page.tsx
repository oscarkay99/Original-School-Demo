import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { openPrintWindow } from "@/lib/download";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
  { time: "07:30 – 08:15", label: "Period 1" },
  { time: "08:15 – 09:00", label: "Period 2" },
  { time: "09:00 – 09:45", label: "Period 3" },
  { time: "09:45 – 10:00", label: "Break" },
  { time: "10:00 – 10:45", label: "Period 4" },
  { time: "10:45 – 11:30", label: "Period 5" },
  { time: "11:30 – 12:15", label: "Period 6" },
  { time: "12:15 – 13:00", label: "Lunch" },
  { time: "13:00 – 13:45", label: "Period 7" },
  { time: "13:45 – 14:30", label: "Period 8" },
];

const subjectColors: Record<string, string> = {
  Mathematics: "bg-violet-50 border-violet-200 text-violet-700",
  English: "bg-slate-100 border-slate-200 text-slate-700",
  Science: "bg-amber-50 border-amber-200 text-amber-700",
  "Social Studies": "bg-stone-100 border-stone-200 text-stone-700",
  ICT: "bg-sky-50 border-sky-200 text-sky-700",
  French: "bg-rose-50 border-rose-200 text-rose-700",
  "Physical Ed.": "bg-emerald-50 border-emerald-200 text-emerald-700",
  Break: "bg-slate-50 border-slate-100 text-slate-400",
  Lunch: "bg-slate-50 border-slate-100 text-slate-400",
};

const timetableData: Record<string, Record<string, { subject: string; teacher: string; room: string } | null>> = {
  "Period 1": { Monday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" }, Tuesday: { subject: "English", teacher: "Mrs. Asiedu", room: "R-102" }, Wednesday: { subject: "Science", teacher: "Mr. Osei", room: "Lab-1" }, Thursday: { subject: "French", teacher: "Mrs. Nyarko", room: "R-104" }, Friday: { subject: "ICT", teacher: "Mr. Boadu", room: "ICT-Lab" } },
  "Period 2": { Monday: { subject: "English", teacher: "Mrs. Asiedu", room: "R-102" }, Tuesday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" }, Wednesday: { subject: "Social Studies", teacher: "Ms. Adu", room: "R-103" }, Thursday: { subject: "Science", teacher: "Mr. Osei", room: "Lab-1" }, Friday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" } },
  "Period 3": { Monday: { subject: "Science", teacher: "Mr. Osei", room: "Lab-1" }, Tuesday: { subject: "Social Studies", teacher: "Ms. Adu", room: "R-103" }, Wednesday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" }, Thursday: { subject: "ICT", teacher: "Mr. Boadu", room: "ICT-Lab" }, Friday: { subject: "English", teacher: "Mrs. Asiedu", room: "R-102" } },
  "Break": { Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null },
  "Period 4": { Monday: { subject: "Social Studies", teacher: "Ms. Adu", room: "R-103" }, Tuesday: { subject: "ICT", teacher: "Mr. Boadu", room: "ICT-Lab" }, Wednesday: { subject: "French", teacher: "Mrs. Nyarko", room: "R-104" }, Thursday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" }, Friday: { subject: "Science", teacher: "Mr. Osei", room: "Lab-1" } },
  "Period 5": { Monday: { subject: "ICT", teacher: "Mr. Boadu", room: "ICT-Lab" }, Tuesday: { subject: "French", teacher: "Mrs. Nyarko", room: "R-104" }, Wednesday: { subject: "English", teacher: "Mrs. Asiedu", room: "R-102" }, Thursday: { subject: "Social Studies", teacher: "Ms. Adu", room: "R-103" }, Friday: { subject: "French", teacher: "Mrs. Nyarko", room: "R-104" } },
  "Period 6": { Monday: { subject: "French", teacher: "Mrs. Nyarko", room: "R-104" }, Tuesday: { subject: "Science", teacher: "Mr. Osei", room: "Lab-1" }, Wednesday: { subject: "ICT", teacher: "Mr. Boadu", room: "ICT-Lab" }, Thursday: { subject: "English", teacher: "Mrs. Asiedu", room: "R-102" }, Friday: { subject: "Social Studies", teacher: "Ms. Adu", room: "R-103" } },
  "Lunch": { Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null },
  "Period 7": { Monday: { subject: "Physical Ed.", teacher: "Coach Mensah", room: "Field" }, Tuesday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" }, Wednesday: { subject: "Science", teacher: "Mr. Osei", room: "Lab-1" }, Thursday: { subject: "French", teacher: "Mrs. Nyarko", room: "R-104" }, Friday: { subject: "Physical Ed.", teacher: "Coach Mensah", room: "Field" } },
  "Period 8": { Monday: { subject: "English", teacher: "Mrs. Asiedu", room: "R-102" }, Tuesday: { subject: "Physical Ed.", teacher: "Coach Mensah", room: "Field" }, Wednesday: { subject: "Social Studies", teacher: "Ms. Adu", room: "R-103" }, Thursday: { subject: "Mathematics", teacher: "Mr. Agyei", room: "R-101" }, Friday: { subject: "ICT", teacher: "Mr. Boadu", room: "ICT-Lab" } },
};

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("Grade 9A");
  const classes = ["Grade 8A", "Grade 8B", "Grade 8C", "Grade 9A", "Grade 9B", "Grade 9C", "Grade 10A", "Grade 10B", "Grade 10C", "Grade 11A", "Grade 11B", "Grade 11C"];
  const today = new Date().toLocaleDateString("en", { weekday: "long" });

  const exportTimetable = () => {
    const rows = periods
      .map((p) => {
        const cells = days
          .map((day) => {
            const cell = timetableData[p.label]?.[day];
            return `<td>${cell ? `${cell.subject}<br/><span style="color:#64748b">${cell.teacher} · ${cell.room}</span>` : p.label === "Break" || p.label === "Lunch" ? p.label : "-"}</td>`;
          })
          .join("");
        return `<tr><td><strong>${p.label}</strong><br/><span style="color:#64748b">${p.time}</span></td>${cells}</tr>`;
      })
      .join("");

    openPrintWindow(
      `${selectedClass} Timetable`,
      `<h1>${selectedClass} Timetable</h1>
       <p class="meta">Academic Year 2025/26 · Term 2</p>
       <table>
         <thead><tr><th>Time</th>${days.map((d) => `<th>${d}</th>`).join("")}</tr></thead>
         <tbody>${rows}</tbody>
       </table>`,
    );
  };

  return (
    <AppLayout title="Timetable" subtitle="Class schedules and period management">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-sm px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-violet-300 cursor-pointer font-medium"
          >
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className="text-xs text-slate-400 bg-white border border-slate-100 px-3 py-2 rounded-xl">
            Academic Year 2025/26 · Term 2
          </span>
        </div>
        <button onClick={exportTimetable} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
          <i className="ri-download-line text-sm"></i>Export PDF
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(subjectColors).filter(([k]) => k !== "Break" && k !== "Lunch").map(([sub, cls]) => (
          <span key={sub} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>{sub}</span>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">Time</th>
                {days.map((d) => (
                  <th key={d} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${d === today ? "text-violet-600" : "text-slate-400"}`}>
                    <div className="flex items-center gap-1.5">
                      {d === today && <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>}
                      {d}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {periods.map((p) => {
                const isBreak = p.label === "Break" || p.label === "Lunch";
                return (
                  <tr key={p.label} className={isBreak ? "bg-slate-50/50" : "hover:bg-slate-50/30 transition-all"}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-600">{p.label}</p>
                      <p className="text-[11px] text-slate-400">{p.time}</p>
                    </td>
                    {days.map((d) => {
                      const cell = timetableData[p.label]?.[d];
                      if (isBreak) {
                        return (
                          <td key={d} className="px-4 py-3">
                            <div className={`px-3 py-2 rounded-lg border text-center ${subjectColors[p.label]}`}>
                              <p className="text-xs font-medium">{p.label}</p>
                            </div>
                          </td>
                        );
                      }
                      if (!cell) return <td key={d} className="px-4 py-3"></td>;
                      const colorClass = subjectColors[cell.subject] || "bg-slate-100 border-slate-200 text-slate-700";
                      return (
                        <td key={d} className="px-4 py-3">
                          <div className={`px-3 py-2 rounded-lg border ${colorClass} ${d === today ? "ring-1 ring-violet-300" : ""}`}>
                            <p className="text-xs font-bold leading-tight">{cell.subject}</p>
                            <p className="text-[11px] opacity-70 mt-0.5">{cell.teacher}</p>
                            <p className="text-[10px] opacity-50 mt-0.5">{cell.room}</p>
                          </div>
                        </td>
                      );
                    })}
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
