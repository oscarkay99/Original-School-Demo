import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { students, teachers } from "@/mocks/schoolData";

const classesData = [
  { id: 1, name: "Grade 8A", level: "Grade 8", classTeacher: "Mrs. Grace Asiedu", room: "Room 101", students: 3, capacity: 30, avgGpa: 3.9, avgAttendance: 97, subjects: 6 },
  { id: 2, name: "Grade 8B", level: "Grade 8", classTeacher: "Mr. Samuel Agyei", room: "Room 102", students: 3, capacity: 30, avgGpa: 3.8, avgAttendance: 95, subjects: 6 },
  { id: 3, name: "Grade 8C", level: "Grade 8", classTeacher: "Ms. Patricia Adu", room: "Room 103", students: 3, capacity: 30, avgGpa: 3.9, avgAttendance: 98, subjects: 6 },
  { id: 4, name: "Grade 9A", level: "Grade 9", classTeacher: "Mr. Samuel Agyei", room: "Room 201", students: 3, capacity: 30, avgGpa: 3.7, avgAttendance: 93, subjects: 6 },
  { id: 5, name: "Grade 9B", level: "Grade 9", classTeacher: "Mrs. Grace Asiedu", room: "Room 202", students: 3, capacity: 30, avgGpa: 3.7, avgAttendance: 94, subjects: 6 },
  { id: 6, name: "Grade 9C", level: "Grade 9", classTeacher: "Mr. Daniel Osei", room: "Room 203", students: 3, capacity: 30, avgGpa: 3.6, avgAttendance: 91, subjects: 6 },
  { id: 7, name: "Grade 10A", level: "Grade 10", classTeacher: "Mr. Emmanuel Boadu", room: "Room 301", students: 3, capacity: 30, avgGpa: 3.4, avgAttendance: 88, subjects: 6 },
  { id: 8, name: "Grade 10B", level: "Grade 10", classTeacher: "Mr. Samuel Agyei", room: "Room 302", students: 3, capacity: 30, avgGpa: 3.5, avgAttendance: 89, subjects: 6 },
  { id: 9, name: "Grade 10C", level: "Grade 10", classTeacher: "Mrs. Comfort Nyarko", room: "Room 303", students: 3, capacity: 30, avgGpa: 3.3, avgAttendance: 88, subjects: 6 },
  { id: 10, name: "Grade 11A", level: "Grade 11", classTeacher: "Mr. Samuel Agyei", room: "Room 401", students: 3, capacity: 30, avgGpa: 3.2, avgAttendance: 82, subjects: 6 },
  { id: 11, name: "Grade 11B", level: "Grade 11", classTeacher: "Mr. Daniel Osei", room: "Room 402", students: 3, capacity: 30, avgGpa: 3.1, avgAttendance: 85, subjects: 6 },
  { id: 12, name: "Grade 11C", level: "Grade 11", classTeacher: "Ms. Patricia Adu", room: "Room 403", students: 3, capacity: 30, avgGpa: 3.0, avgAttendance: 78, subjects: 6 },
];

export default function ClassesPage() {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedClass, setSelectedClass] = useState<typeof classesData[0] | null>(null);
  const levels = ["All", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
  const filtered = classesData.filter((c) => selectedLevel === "All" || c.level === selectedLevel);

  return (
    <AppLayout title="Classes" subtitle="Manage class groups, rooms and assignments">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Classes", value: classesData.length, icon: "ri-building-4-line", bg: "bg-violet-50", color: "text-violet-600" },
          { label: "Total Students", value: students.length, icon: "ri-user-3-line", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Total Teachers", value: teachers.length, icon: "ri-user-star-line", bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Avg Class Size", value: students.length, icon: "ri-group-line", bg: "bg-rose-50", color: "text-rose-600" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${m.bg} flex-shrink-0`}>
              <i className={`${m.icon} ${m.color} text-base`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100 w-fit mb-4">
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setSelectedLevel(l)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedLevel === l ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cls) => (
          <div
            key={cls.id}
            onClick={() => setSelectedClass(cls)}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer hover:border-violet-200 hover:shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-slate-800 text-base">{cls.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cls.room}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-50">
                <i className="ri-building-4-line text-violet-500 text-base"></i>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-violet-100 flex-shrink-0">
                <span className="text-violet-700 text-[10px] font-bold">{cls.classTeacher.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{cls.classTeacher}</p>
                <p className="text-[11px] text-slate-400">Class Teacher</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Students", value: cls.students },
                { label: "Avg GPA", value: cls.avgGpa },
                { label: "Attendance", value: `${cls.avgAttendance}%` },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-slate-800">{s.value}</p>
                  <p className="text-[11px] text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-slate-400">Capacity</p>
                <p className="text-[11px] font-semibold text-slate-600">{cls.students}/{cls.capacity}</p>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(cls.students / cls.capacity) * 100}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{selectedClass.name}</p>
                <p className="text-xs text-slate-400">{selectedClass.room} · {selectedClass.level}</p>
              </div>
              <button onClick={() => setSelectedClass(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Class Teacher", value: selectedClass.classTeacher },
                  { label: "Room", value: selectedClass.room },
                  { label: "Students Enrolled", value: `${selectedClass.students} / ${selectedClass.capacity}` },
                  { label: "Subjects", value: selectedClass.subjects },
                  { label: "Average GPA", value: selectedClass.avgGpa },
                  { label: "Avg Attendance", value: `${selectedClass.avgAttendance}%` },
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer whitespace-nowrap">View Students</button>
                <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:opacity-90" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>Edit Class</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
