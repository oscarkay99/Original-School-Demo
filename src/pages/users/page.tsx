import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const roleConfig: Record<string, { gradient: string; bg: string; text: string }> = {
  Admin: { gradient: "from-slate-600 to-slate-700", bg: "bg-slate-100", text: "text-slate-700" },
  Teacher: { gradient: "from-slate-500 to-slate-600", bg: "bg-slate-100", text: "text-slate-600" },
  Accountant: { gradient: "from-slate-500 to-slate-600", bg: "bg-slate-100", text: "text-slate-600" },
  Secretary: { gradient: "from-slate-500 to-slate-600", bg: "bg-slate-100", text: "text-slate-600" },
};

export default function UsersPage() {
  const { users, addUser } = useSchoolData();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [removedUserIds, setRemovedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "Teacher",
  });

  const workingUsers = users.filter((user) => !removedUserIds.includes(user.id));
  const filtered = workingUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.fullName || !form.email) return;
    setSubmitting(true);
    try {
      await addUser(form);
      setForm({ fullName: "", email: "", role: "Teacher" });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = workingUsers.find((user) => user.id === selectedUserId) ?? null;

  return (
    <AppLayout title="Users" subtitle="Manage system users and access control">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, icon: "ri-shield-user-line" },
          { label: "Active", value: users.filter((u) => u.status === "Active").length, icon: "ri-checkbox-circle-line" },
          { label: "Admins", value: users.filter((u) => u.role === "Admin").length, icon: "ri-admin-line" },
          { label: "Teachers", value: users.filter((u) => u.role === "Teacher").length, icon: "ri-user-star-line" },
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

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-300 transition-all w-64"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line text-sm"></i>
          Add User
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((user) => {
          const cfg = roleConfig[user.role] || roleConfig.Teacher;
          return (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-200 mb-3">
                  <span className="text-slate-600 font-bold text-lg">{user.avatar}</span>
                </div>
                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{user.role}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <i className="ri-mail-line text-slate-400 flex-shrink-0"></i>
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <i className="ri-time-line text-slate-400 flex-shrink-0"></i>
                  <span>Last login: {user.lastLogin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${user.status === "Active" ? "bg-emerald-400" : "bg-slate-300"}`}></span>
                  <span className={user.status === "Active" ? "text-emerald-600 font-medium" : "text-slate-400"}>{user.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => setSelectedUserId(user.id)} className="flex-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer transition-all">View</button>
                <button onClick={() => setRemovedUserIds((prev) => [...prev, user.id])} className="flex-1 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-medium cursor-pointer transition-all">Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Add New User</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "fullName", label: "Full Name", placeholder: "e.g. Kwame Asante", type: "text" },
                { key: "email", label: "Email Address", placeholder: "user@school.edu", type: "email" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-300 transition-all bg-slate-50 focus:bg-white" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-300 transition-all bg-slate-50 cursor-pointer">
                  {Object.keys(roleConfig).map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap disabled:opacity-50">{submitting ? "Saving..." : "Add User"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">User Details</p>
              <button onClick={() => setSelectedUserId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ["Name", selectedUser.name],
                ["Role", selectedUser.role],
                ["Email", selectedUser.email],
                ["Status", selectedUser.status],
                ["Last Login", selectedUser.lastLogin],
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
