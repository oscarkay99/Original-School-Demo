import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { students } from "@/mocks/schoolData";

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
};
const feeColors: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-rose-100 text-rose-600",
};

const avatarGradients = [
  "from-orange-400 to-rose-500",
  "from-violet-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFee, setFilterFee] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    const matchFee = filterFee === "All" || s.fees === filterFee;
    return matchSearch && matchStatus && matchFee;
  });

  return (
    <AppLayout title="Student Management" subtitle="Manage all enrolled students">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: students.length, icon: "ri-user-3-line", gradient: "" },
          { label: "Active", value: students.filter((s) => s.status === "Active").length, icon: "ri-checkbox-circle-line", gradient: "" },
          { label: "Fees Paid", value: students.filter((s) => s.fees === "Paid").length, icon: "ri-money-dollar-circle-line", gradient: "" },
          { label: "Overdue Fees", value: students.filter((s) => s.fees === "Overdue").length, icon: "ri-error-warning-line", gradient: "" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0">
              <i className={`${m.icon} text-slate-500 text-base`}></i>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={filterFee}
              onChange={(e) => setFilterFee(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Fees</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-add-line text-sm"></i>
              Add Student
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Student", "Grade", "GPA", "Attendance", "Fees", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{s.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.parent}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{s.grade}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${(s.gpa / 4) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{s.gpa}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 80 ? "text-amber-600" : "text-rose-500"}`}>
                        {s.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${feeColors[s.fees]}`}>{s.fees}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-all">
                        <i className="ri-eye-line text-sm"></i>
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-all">
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-500 cursor-pointer transition-all">
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">Showing {filtered.length} of {students.length} students</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer text-xs">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 text-white text-xs font-semibold cursor-pointer">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer text-xs">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Add New Student</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name", placeholder: "e.g. Ama Owusu", type: "text" },
                { label: "Date of Birth", placeholder: "", type: "date" },
                { label: "Grade / Class", placeholder: "e.g. Grade 9A", type: "text" },
                { label: "Parent / Guardian", placeholder: "e.g. Kwame Owusu", type: "text" },
                { label: "Phone Number", placeholder: "+233 24 000 0000", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-all whitespace-nowrap">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 cursor-pointer transition-all whitespace-nowrap shadow-md">
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
