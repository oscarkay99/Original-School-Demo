import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";

const homeworkList = [
  { id: 1, title: "Algebra Chapter 5 Exercises", subject: "Mathematics", teacher: "Mr. Samuel Agyei", class: "Grade 9A", dueDate: "2026-04-25", assigned: "2026-04-21", status: "Active", submissions: 8, total: 12, description: "Complete exercises 5.1 to 5.4 from the textbook. Show all working." },
  { id: 2, title: "Essay: My Community", subject: "English", teacher: "Mrs. Grace Asiedu", class: "Grade 8A", dueDate: "2026-04-26", assigned: "2026-04-20", status: "Active", submissions: 10, total: 12, description: "Write a 500-word essay about your community and its importance." },
  { id: 3, title: "Photosynthesis Lab Report", subject: "Science", teacher: "Mr. Daniel Osei", class: "Grade 10B", dueDate: "2026-04-24", assigned: "2026-04-18", status: "Due Soon", submissions: 5, total: 12, description: "Write up the lab report from Tuesday's photosynthesis experiment." },
  { id: 4, title: "Map of West Africa", subject: "Social Studies", teacher: "Ms. Patricia Adu", class: "Grade 9C", dueDate: "2026-04-23", assigned: "2026-04-17", status: "Overdue", submissions: 9, total: 12, description: "Draw and label all 16 countries of West Africa with their capitals." },
  { id: 5, title: "HTML & CSS Mini Project", subject: "ICT", teacher: "Mr. Emmanuel Boadu", class: "Grade 11A", dueDate: "2026-04-30", assigned: "2026-04-22", status: "Active", submissions: 3, total: 12, description: "Build a simple personal webpage using HTML and CSS." },
  { id: 6, title: "French Vocabulary Test Prep", subject: "French", teacher: "Mrs. Comfort Nyarko", class: "Grade 10A", dueDate: "2026-04-28", assigned: "2026-04-21", status: "Active", submissions: 7, total: 12, description: "Study vocabulary list pages 45–52 for the upcoming test." },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
  "Due Soon": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Overdue: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
  Completed: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
};

export default function HomeworkPage() {
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = homeworkList.filter((h) => filter === "All" || h.status === filter);

  return (
    <AppLayout title="Homework" subtitle="Manage and track assignments across all classes">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Assignments", value: homeworkList.length, icon: "ri-book-2-line" },
          { label: "Active", value: homeworkList.filter((h) => h.status === "Active").length, icon: "ri-checkbox-circle-line" },
          { label: "Due Soon", value: homeworkList.filter((h) => h.status === "Due Soon").length, icon: "ri-time-line" },
          { label: "Overdue", value: homeworkList.filter((h) => h.status === "Overdue").length, icon: "ri-error-warning-line" },
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

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100">
          {["All", "Active", "Due Soon", "Overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${filter === f ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap transition-all"
        >
          <i className="ri-add-line text-sm"></i>
          Assign Homework
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((hw) => {
          const cfg = statusConfig[hw.status];
          const submissionPct = Math.round((hw.submissions / hw.total) * 100);
          return (
            <div key={hw.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-slate-800 text-sm leading-tight">{hw.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{hw.subject} · {hw.class} · {hw.teacher}</p>
                </div>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                  {hw.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">{hw.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[11px] text-slate-400">Assigned</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{hw.assigned}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[11px] text-slate-400">Due Date</p>
                  <p className={`text-xs font-semibold mt-0.5 ${hw.status === "Overdue" ? "text-rose-600" : "text-slate-700"}`}>{hw.dueDate}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-slate-500">Submissions</p>
                  <p className="text-xs font-bold text-slate-700">{hw.submissions}/{hw.total} ({submissionPct}%)</p>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${submissionPct >= 80 ? "bg-teal-500" : submissionPct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                    style={{ width: `${submissionPct}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button className="flex-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer transition-all">View Submissions</button>
                <button className="flex-1 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 text-xs font-medium cursor-pointer transition-all">Edit</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Assign New Homework</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Assignment Title", placeholder: "e.g. Chapter 5 Exercises", type: "text" },
                { label: "Due Date", placeholder: "", type: "date" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all bg-slate-50 focus:bg-white" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Subject</label>
                <select className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all bg-slate-50 cursor-pointer">
                  {["Mathematics", "English", "Science", "Social Studies", "ICT", "French"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Class</label>
                <select className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all bg-slate-50 cursor-pointer">
                  {["Grade 8A", "Grade 9A", "Grade 10A", "Grade 11A"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                <textarea rows={3} placeholder="Assignment instructions..." className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all bg-slate-50 focus:bg-white resize-none" maxLength={500}></textarea>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap">Assign</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
