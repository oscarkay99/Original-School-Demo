import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "On Leave": "bg-amber-100 text-amber-700",
};

const avatarGradients = [
  "from-violet-400 to-fuchsia-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-sky-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-violet-500",
];

export default function TeachersPage() {
  const { teachers, addTeacher } = useSchoolData();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    subject: "",
    email: "",
    phone: "",
    yearsOfExperience: "",
    className: "",
  });

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.fullName || !form.subject || !form.email || !form.phone || !form.yearsOfExperience) return;
    setSubmitting(true);
    try {
      await addTeacher(form);
      setForm({ fullName: "", subject: "", email: "", phone: "", yearsOfExperience: "", className: "" });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId) ?? null;

  return (
    <AppLayout title="Teacher Management" subtitle="Manage teaching staff and assignments">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Teachers", value: teachers.length, icon: "ri-user-star-line" },
          { label: "Active", value: teachers.filter((t) => t.status === "Active").length, icon: "ri-checkbox-circle-line" },
          { label: "On Leave", value: teachers.filter((t) => t.status === "On Leave").length, icon: "ri-time-line" },
          { label: "Avg Rating", value: teachers.length ? (teachers.reduce((a, b) => a + b.rating, 0) / teachers.length).toFixed(1) : "0.0", icon: "ri-star-line" },
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

      {/* Cards Grid */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers..."
            className="pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-violet-300 transition-all w-64"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line text-sm"></i>
          Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} shadow-md`}>
                  <span className="text-slate-600 font-bold text-sm">{t.avatar}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.subject}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[t.status]}`}>{t.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Students", value: t.students, icon: "ri-user-3-line" },
                { label: "Classes", value: t.classes.length, icon: "ri-book-open-line" },
                { label: "Experience", value: t.experience.split(" ")[0] + "y", icon: "ri-time-line" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <i className={`${stat.icon} text-slate-400 text-sm`}></i>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className={`${star <= Math.round(t.rating) ? "ri-star-fill" : "ri-star-line"} text-amber-400 text-xs`}></i>
                ))}
                <span className="text-xs font-semibold text-slate-700 ml-1">{t.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {t.classes.map((cls) => (
                <span key={cls} className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-xs font-medium">{cls}</span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <a href={`mailto:${t.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer transition-all">
                <i className="ri-mail-line text-sm"></i>
                Email
              </a>
              <button onClick={() => setSelectedTeacherId(t.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-medium cursor-pointer transition-all">
                <i className="ri-edit-line text-sm"></i>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Add New Teacher</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "fullName", label: "Full Name", placeholder: "e.g. Mr. Samuel Agyei", type: "text" },
                { key: "subject", label: "Subject", placeholder: "e.g. Mathematics", type: "text" },
                { key: "email", label: "Email Address", placeholder: "teacher@school.edu", type: "email" },
                { key: "phone", label: "Phone Number", placeholder: "+233 24 000 0000", type: "tel" },
                { key: "yearsOfExperience", label: "Years of Experience", placeholder: "e.g. 5", type: "number" },
                { key: "className", label: "Assigned Class", placeholder: "e.g. Grade 9A", type: "text" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-violet-300 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-all whitespace-nowrap">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90 cursor-pointer transition-all whitespace-nowrap shadow-md disabled:opacity-50">{submitting ? "Saving..." : "Add Teacher"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Teacher Profile</p>
              <button onClick={() => setSelectedTeacherId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ["Name", selectedTeacher.name],
                ["Subject", selectedTeacher.subject],
                ["Classes", selectedTeacher.classes.join(", ") || "Not assigned"],
                ["Status", selectedTeacher.status],
                ["Experience", selectedTeacher.experience],
                ["Students", selectedTeacher.students],
                ["Rating", selectedTeacher.rating],
                ["Email", selectedTeacher.email],
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
    </AppLayout>
  );
}
