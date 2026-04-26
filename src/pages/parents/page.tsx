import { useState, useMemo } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const feeColors: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-rose-100 text-rose-600",
};

const avatarGradients = [
  "from-violet-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-rose-400 to-pink-500",
  "from-indigo-400 to-violet-500",
  "from-orange-400 to-red-500",
];

export default function ParentsPage() {
  const { users, students, addUser } = useSchoolData();
  const [search, setSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [formError, setFormError] = useState("");

  const parents = useMemo(
    () => users.filter((u) => u.role === "Parent"),
    [users]
  );

  const filtered = useMemo(
    () =>
      parents.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase())
      ),
    [parents, search]
  );

  const getLinkedStudents = (parentEmail: string) =>
    students.filter(
      (s) => s.guardianEmail && s.guardianEmail.toLowerCase() === parentEmail.toLowerCase()
    );

  const selectedParent = parents.find((p) => p.id === selectedParentId) ?? null;
  const selectedStudents = selectedParent ? getLinkedStudents(selectedParent.email) : [];

  const openModal = () => {
    setForm({ fullName: "", email: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError("Full name and email are required.");
      return;
    }
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === form.email.trim().toLowerCase()
    );
    if (emailExists) {
      setFormError("An account with this email already exists.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await addUser({ fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), role: "Parent" });
      setShowModal(false);
    } catch {
      setFormError("Failed to create parent account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Parents" subtitle="Parent accounts and linked students">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Parents", value: parents.length, icon: "ri-parent-line" },
          { label: "Linked to Students", value: parents.filter((p) => getLinkedStudents(p.email).length > 0).length, icon: "ri-links-line" },
          { label: "Active Accounts", value: parents.filter((p) => p.status === "Active").length, icon: "ri-checkbox-circle-line" },
          { label: "Unlinked", value: parents.filter((p) => getLinkedStudents(p.email).length === 0).length, icon: "ri-error-warning-line" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 flex-shrink-0">
              <i className={`${m.icon} text-slate-500 text-base`}></i>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-slate-800">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-5 items-start">
        {/* Parent list */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-300 focus:bg-white transition-all"
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} parent{filtered.length !== 1 ? "s" : ""}</span>
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-add-line text-sm"></i>
              Add Parent
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
                <i className="ri-parent-line text-violet-300 text-2xl"></i>
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {search ? "No parents match your search" : "No parent accounts yet"}
              </p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {search
                  ? "Try a different name or email."
                  : "Add a parent account, then link them to a student."}
              </p>
              {!search && (
                <button
                  onClick={openModal}
                  className="mt-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-all cursor-pointer"
                >
                  Add First Parent
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {filtered.map((parent, i) => {
                const linked = getLinkedStudents(parent.email);
                const isSelected = selectedParentId === parent.id;
                return (
                  <li
                    key={parent.id}
                    onClick={() => setSelectedParentId(isSelected ? null : parent.id)}
                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-violet-50 border-l-2 border-violet-400"
                        : "hover:bg-slate-50 border-l-2 border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white text-xs font-bold">{parent.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{parent.name}</p>
                      <p className="text-xs text-slate-400 truncate">{parent.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {linked.length > 0 ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                          <i className="ri-user-3-line text-[10px]"></i>
                          {linked.length} ward{linked.length !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                          Unlinked
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          parent.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {parent.status}
                      </span>
                      <i
                        className={`ri-arrow-right-s-line text-slate-300 transition-transform ${isSelected ? "rotate-90" : ""}`}
                      ></i>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail panel */}
        {selectedParent && (
          <div className="w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-5 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-black text-sm">{selectedParent.avatar}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-base leading-tight truncate">{selectedParent.name}</p>
                    <p className="text-white/70 text-xs mt-0.5 truncate">{selectedParent.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    selectedParent.status === "Active" ? "bg-emerald-400/20 text-emerald-100" : "bg-white/10 text-white/60"
                  }`}>
                    {selectedParent.status}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                    Parent
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 border-b border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last login</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedParent.lastLogin}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Students</p>
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  {selectedStudents.length}
                </span>
              </div>

              {selectedStudents.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <i className="ri-user-unfollow-line text-slate-200 text-2xl mb-2 block"></i>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No students linked yet. Link this parent when adding or editing a student.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {selectedStudents.map((s) => (
                    <li key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-500 text-xs font-bold">{s.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                        <p className="text-xs text-slate-400 truncate">{s.grade}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${feeColors[s.fees]}`}>
                          {s.fees}
                        </span>
                        <span className="text-[10px] text-slate-400">{s.attendance}% att.</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Parent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Add Parent Account</p>
                <p className="text-xs text-slate-400 mt-0.5">Creates a login-enabled parent profile</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Kwame Asante"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-violet-300 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="parent@example.com"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-violet-300 transition-all bg-slate-50 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  This email will be used to log in to the parent portal.
                </p>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2.5">
                  <i className="ri-error-warning-line flex-shrink-0"></i>
                  {formError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 cursor-pointer transition-all disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
