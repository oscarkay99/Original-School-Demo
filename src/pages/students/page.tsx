import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

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
  const { students, addStudent, updateStudent, users } = useSchoolData();
  const parentUsers = users.filter((u) => u.role === "Parent");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFee, setFilterFee] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [removedStudentIds, setRemovedStudentIds] = useState<string[]>([]);
  const [editedStudents, setEditedStudents] = useState<Record<string, { name: string; parent: string; grade: string; email: string; guardianEmail: string }>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parentNameDropdownOpen, setParentNameDropdownOpen] = useState(false);
  const [parentEmailDropdownOpen, setParentEmailDropdownOpen] = useState(false);
  const [editParentDropdownOpen, setEditParentDropdownOpen] = useState(false);
  const parentNameRef = useRef<HTMLDivElement>(null);
  const parentEmailRef = useRef<HTMLDivElement>(null);
  const editParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (parentNameRef.current && !parentNameRef.current.contains(e.target as Node)) {
        setParentNameDropdownOpen(false);
      }
      if (parentEmailRef.current && !parentEmailRef.current.contains(e.target as Node)) {
        setParentEmailDropdownOpen(false);
      }
      if (editParentRef.current && !editParentRef.current.contains(e.target as Node)) {
        setEditParentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    grade: "",
    parent: "",
    email: "",
    guardianEmail: "",
  });

  const workingStudents = students
    .filter((s) => !removedStudentIds.includes(s.id))
    .map((s) => {
      const edited = editedStudents[s.id];
      return edited ? { ...s, name: edited.name, parent: edited.parent, grade: edited.grade, email: edited.email, guardianEmail: edited.guardianEmail ?? s.guardianEmail } : s;
    });

  const filtered = workingStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    const matchFee = filterFee === "All" || s.fees === filterFee;
    return matchSearch && matchStatus && matchFee;
  });

  const handleSubmit = async () => {
    if (!form.fullName || !form.dob || !form.grade || !form.parent) return;
    setSubmitting(true);
    try {
      await addStudent(form);
      setForm({ fullName: "", dob: "", grade: "", parent: "", email: "", guardianEmail: "" });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const viewedStudent = workingStudents.find((student) => student.id === viewStudentId) ?? null;
  const editingStudent = workingStudents.find((student) => student.id === editingStudentId) ?? null;

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
                      <button onClick={() => setViewStudentId(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-all">
                        <i className="ri-eye-line text-sm"></i>
                      </button>
                      <button onClick={() => setEditingStudentId(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-all">
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button onClick={() => setRemovedStudentIds((prev) => [...prev, s.id])} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-500 cursor-pointer transition-all">
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
          <p className="text-xs text-slate-400">Showing {filtered.length} of {workingStudents.length} students</p>
          <div className="flex items-center gap-1">
            <span className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 text-xs">
              <i className="ri-arrow-left-s-line"></i>
            </span>
            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 text-white text-xs font-semibold">1</span>
            <span className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 text-xs">
              <i className="ri-arrow-right-s-line"></i>
            </span>
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
                { key: "fullName", label: "Full Name", placeholder: "e.g. Ama Owusu", type: "text" },
                { key: "dob", label: "Date of Birth", placeholder: "", type: "date" },
                { key: "grade", label: "Grade / Class", placeholder: "e.g. Grade 9A", type: "text" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              ))}

              {/* Parent / Guardian Name — combobox */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Parent / Guardian Name</label>
                <div ref={parentNameRef} className="relative">
                  <input
                    type="text"
                    value={form.parent}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, parent: e.target.value }));
                      setParentNameDropdownOpen(true);
                    }}
                    onFocus={() => setParentNameDropdownOpen(true)}
                    placeholder="Type to search parents..."
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                  />
                  {parentNameDropdownOpen && (() => {
                    const q = form.parent.toLowerCase();
                    const matches = parentUsers.filter(
                      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
                    );
                    if (matches.length === 0) return null;
                    return (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-44 overflow-y-auto">
                        {matches.map((p) => (
                          <li
                            key={p.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setForm((prev) => ({
                                ...prev,
                                parent: p.name,
                                guardianEmail: prev.guardianEmail || p.email,
                              }));
                              setParentNameDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-violet-600 text-xs font-bold">{p.avatar}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              </div>

              {[
                { key: "email", label: "Student Email (optional)", placeholder: "student@school.edu", type: "email" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              ))}

              {/* Link to parent account */}
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <i className="ri-parent-line text-violet-500 text-sm"></i>
                  <p className="text-xs font-bold text-violet-700">Link Parent Account</p>
                </div>
                <p className="text-[11px] text-violet-500 leading-relaxed">
                  Start typing to find an existing parent account. The parent will see this student when they log in.
                </p>
                <div ref={parentEmailRef} className="relative">
                  <input
                    type="text"
                    value={form.guardianEmail}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, guardianEmail: e.target.value }));
                      setParentEmailDropdownOpen(true);
                    }}
                    onFocus={() => setParentEmailDropdownOpen(true)}
                    placeholder="Search by name or email..."
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-violet-200 focus:outline-none focus:border-violet-400 transition-all bg-white"
                  />
                  {parentEmailDropdownOpen && (() => {
                    const q = form.guardianEmail.toLowerCase();
                    const matches = parentUsers.filter(
                      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
                    );
                    if (matches.length === 0) return null;
                    return (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-violet-100 rounded-xl shadow-lg overflow-hidden max-h-44 overflow-y-auto">
                        {matches.map((p) => (
                          <li
                            key={p.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setForm((prev) => ({
                                ...prev,
                                guardianEmail: p.email,
                                parent: prev.parent || p.name,
                              }));
                              setParentEmailDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-violet-600 text-xs font-bold">{p.avatar}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
                {form.guardianEmail && (
                  <p className="text-[11px] text-violet-500 flex items-center gap-1">
                    <i className="ri-link text-violet-400"></i>
                    Will be linked to: <span className="font-semibold">{form.guardianEmail}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-all whitespace-nowrap">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 cursor-pointer transition-all whitespace-nowrap shadow-md disabled:opacity-50">
                {submitting ? "Saving..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Student Profile</p>
              <button onClick={() => setViewStudentId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {[
                ["Name", viewedStudent.name],
                ["Class", viewedStudent.grade],
                ["Parent", viewedStudent.parent],
                ["Email", viewedStudent.email || "—"],
                ["Attendance", `${viewedStudent.attendance}%`],
                ["GPA", viewedStudent.gpa],
                ["Fees", viewedStudent.fees],
                ["Status", viewedStudent.status],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Edit Student</p>
              <button onClick={() => setEditingStudentId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ["name", "Full Name", editingStudent.name],
                ["grade", "Grade / Class", editingStudent.grade],
              ].map(([key, label, value]) => (
                <div key={String(key)}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
                  <input
                    type="text"
                    value={(editedStudents[editingStudent.id]?.[key as "name" | "grade"] ?? value) as string}
                    onChange={(e) =>
                      setEditedStudents((prev) => ({
                        ...prev,
                        [editingStudent.id]: {
                          name: prev[editingStudent.id]?.name ?? editingStudent.name,
                          parent: prev[editingStudent.id]?.parent ?? editingStudent.parent,
                          grade: prev[editingStudent.id]?.grade ?? editingStudent.grade,
                          email: prev[editingStudent.id]?.email ?? editingStudent.email,
                          [key]: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50"
                  />
                </div>
              ))}

              {/* Parent / Guardian — combobox */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Parent / Guardian</label>
                <div ref={editParentRef} className="relative">
                  <input
                    type="text"
                    value={editedStudents[editingStudent.id]?.parent ?? editingStudent.parent}
                    onChange={(e) => {
                      setEditedStudents((prev) => ({
                        ...prev,
                        [editingStudent.id]: {
                          name: prev[editingStudent.id]?.name ?? editingStudent.name,
                          parent: e.target.value,
                          grade: prev[editingStudent.id]?.grade ?? editingStudent.grade,
                          email: prev[editingStudent.id]?.email ?? editingStudent.email,
                          guardianEmail: prev[editingStudent.id]?.guardianEmail ?? editingStudent.guardianEmail,
                        },
                      }));
                      setEditParentDropdownOpen(true);
                    }}
                    onFocus={() => setEditParentDropdownOpen(true)}
                    placeholder="Type to search parents..."
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50"
                  />
                  {editParentDropdownOpen && (() => {
                    const q = (editedStudents[editingStudent.id]?.parent ?? editingStudent.parent).toLowerCase();
                    const matches = parentUsers.filter(
                      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
                    );
                    if (matches.length === 0) return null;
                    return (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-44 overflow-y-auto">
                        {matches.map((p) => (
                          <li
                            key={p.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEditedStudents((prev) => ({
                                ...prev,
                                [editingStudent.id]: {
                                  name: prev[editingStudent.id]?.name ?? editingStudent.name,
                                  parent: p.name,
                                  grade: prev[editingStudent.id]?.grade ?? editingStudent.grade,
                                  email: prev[editingStudent.id]?.email ?? editingStudent.email,
                                  guardianEmail: p.email,
                                },
                              }));
                              setEditParentDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-violet-600 text-xs font-bold">{p.avatar}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
                {/* Show currently linked email */}
                {(() => {
                  const linkedEmail = editedStudents[editingStudent.id]?.guardianEmail ?? editingStudent.guardianEmail;
                  return linkedEmail ? (
                    <p className="text-[11px] text-violet-500 flex items-center gap-1 mt-1">
                      <i className="ri-link text-violet-400"></i>
                      Linked: <span className="font-semibold">{linkedEmail}</span>
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Student Email</label>
                <input
                  type="text"
                  value={editedStudents[editingStudent.id]?.email ?? editingStudent.email}
                  onChange={(e) =>
                    setEditedStudents((prev) => ({
                      ...prev,
                      [editingStudent.id]: {
                        name: prev[editingStudent.id]?.name ?? editingStudent.name,
                        parent: prev[editingStudent.id]?.parent ?? editingStudent.parent,
                        grade: prev[editingStudent.id]?.grade ?? editingStudent.grade,
                        email: e.target.value,
                        guardianEmail: prev[editingStudent.id]?.guardianEmail ?? editingStudent.guardianEmail,
                      },
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setEditingStudentId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-all whitespace-nowrap">Close</button>
              <button
                disabled={editSaving}
                onClick={async () => {
                  const edits = editedStudents[editingStudent.id];
                  if (!edits) { setEditingStudentId(null); return; }
                  setEditSaving(true);
                  try {
                    await updateStudent(editingStudent.id, {
                      name: edits.name,
                      grade: edits.grade,
                      parent: edits.parent,
                      email: edits.email,
                      guardianEmail: edits.guardianEmail,
                    });
                    setEditingStudentId(null);
                  } finally {
                    setEditSaving(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 cursor-pointer transition-all whitespace-nowrap disabled:opacity-50"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
