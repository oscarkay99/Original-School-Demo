import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import type { MeetingView, MeetingParticipant } from "@/contexts/SchoolDataContext";

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: {
        roomName: string;
        width: string | number;
        height: string | number;
        parentNode: HTMLElement;
        userInfo?: { displayName: string };
        configOverwrite?: Record<string, unknown>;
        interfaceConfigOverwrite?: Record<string, unknown>;
      }
    ) => { dispose: () => void };
  }
}

const MEETING_TYPES = ["PTA", "Staff Meeting", "Parent Conference", "General"];

const typeConfig: Record<string, { gradient: string; icon: string }> = {
  "PTA":               { gradient: "from-violet-500 to-purple-600", icon: "ri-parent-line" },
  "Staff Meeting":     { gradient: "from-teal-500 to-emerald-600",  icon: "ri-team-line" },
  "Parent Conference": { gradient: "from-amber-500 to-orange-600",  icon: "ri-discuss-line" },
  "General":           { gradient: "from-slate-500 to-slate-600",   icon: "ri-vidicon-line" },
};

const statusStyle: Record<string, string> = {
  Scheduled:     "bg-sky-100 text-sky-700",
  "In Progress": "bg-emerald-100 text-emerald-700",
  Ended:         "bg-slate-100 text-slate-500",
  Cancelled:     "bg-rose-100 text-rose-600",
};

function deriveMeetingStatus(date: string, time: string, current: string) {
  if (current === "Cancelled" || current === "Ended") return current;
  if (!date) return current;
  const dt = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(dt.getTime())) return current;
  const diff = dt.getTime() - Date.now();
  if (diff > 0) return "Scheduled";
  if (diff > -3600000) return "In Progress";
  return "Ended";
}

function formatDateTime(date: string, time: string) {
  if (!date) return "Not scheduled";
  try {
    return new Date(`${date}T${time || "00:00"}`).toLocaleString("en", {
      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return `${date} ${time}`; }
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

// ── Jitsi room ────────────────────────────────────────────────────────────────

function JitsiRoom({ roomName, displayName, onClose }: { roomName: string; displayName: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ dispose: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    function init() {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;
      try {
        apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName, width: "100%", height: "100%", parentNode: containerRef.current,
          userInfo: { displayName },
          configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false, disableDeepLinking: true },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: ["microphone","camera","closedcaptions","desktop","fullscreen",
              "fodeviceselection","hangup","chat","raisehand","videoquality","tileview","participants-pane"],
          },
        });
        if (!cancelled) setLoading(false);
      } catch { if (!cancelled) setError("Failed to start the meeting room."); }
    }
    if (window.JitsiMeetExternalAPI) { init(); }
    else {
      const s = document.createElement("script");
      s.src = "https://meet.jit.si/external_api.js"; s.async = true;
      s.onload = () => { if (!cancelled) init(); };
      s.onerror = () => { if (!cancelled) setError("Could not load Jitsi. Check your internet connection."); };
      document.head.appendChild(s);
    }
    return () => { cancelled = true; apiRef.current?.dispose(); apiRef.current = null; };
  }, [roomName, displayName]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <i className="ri-vidicon-line text-white text-sm"></i>
          </div>
          <span className="text-white text-sm font-semibold">Meeting Room</span>
        </div>
        <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer">
          <i className="ri-phone-fill rotate-[135deg]"></i> Leave
        </button>
      </div>
      <div className="flex-1 relative">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
              <i className="ri-vidicon-line text-white text-xl"></i>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 150, 300].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d}ms` }}></span>)}
            </div>
            <p className="text-white/60 text-sm">Connecting to meeting room...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-4">
            <i className="ri-error-warning-line text-rose-400 text-4xl"></i>
            <p className="text-white/70 text-sm text-center max-w-xs">{error}</p>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm cursor-pointer">Close</button>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// ── Participant picker ─────────────────────────────────────────────────────────

interface Person { name: string; email: string; role: string; }

function ParticipantPicker({
  selected, onChange, allPeople,
}: {
  selected: MeetingParticipant[];
  onChange: (p: MeetingParticipant[]) => void;
  allPeople: Person[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedEmails = new Set(selected.map((p) => p.email));
  const filtered = allPeople.filter(
    (p) => !selectedEmails.has(p.email) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.email.toLowerCase().includes(search.toLowerCase()) ||
       p.role.toLowerCase().includes(search.toLowerCase()))
  );

  function add(person: Person) {
    onChange([...selected, { name: person.name, email: person.email, role: person.role }]);
    setSearch("");
  }

  function remove(email: string) {
    onChange(selected.filter((p) => p.email !== email));
  }

  const roleColor: Record<string, string> = {
    Teacher: "bg-teal-100 text-teal-700",
    Parent: "bg-amber-100 text-amber-700",
    Admin: "bg-violet-100 text-violet-700",
    Secretary: "bg-sky-100 text-sky-700",
    Accountant: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((p) => (
            <span key={p.email} className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs text-violet-700 font-medium">
              <span className="w-4 h-4 rounded-full bg-violet-200 flex items-center justify-center text-[9px] font-bold text-violet-700 flex-shrink-0">
                {getInitials(p.name)}
              </span>
              {p.name}
              <button type="button" onClick={() => remove(p.email)} className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-violet-200 text-violet-500 cursor-pointer">
                <i className="ri-close-line text-[10px]"></i>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name, role, or email…"
          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-44 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              {search ? "No matching people" : "All available people selected"}
            </p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => add(p)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-violet-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-violet-700">{getInitials(p.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${roleColor[p.role] ?? "bg-slate-100 text-slate-500"}`}>
                  {p.role}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface FormState {
  title: string; type: string; description: string; date: string; time: string;
  participants: MeetingParticipant[];
}

const emptyForm: FormState = { title: "", type: "Staff Meeting", description: "", date: "", time: "09:00", participants: [] };

export default function MeetingsPage() {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, users, currentUserRole, currentUserName, currentUserEmail } = useSchoolData();

  const role = currentUserRole.toLowerCase();
  const isAdmin = ["admin", "administrator"].includes(role);
  const canManage = isAdmin || ["teacher", "secretary"].includes(role);
  const isParent = role === "parent";

  // Build the people pool for the picker (exclude the current user)
  const allPeople: Person[] = users
    .filter((u) => u.email && u.email !== currentUserEmail && u.status?.toLowerCase() !== "inactive")
    .map((u) => ({ name: u.name, email: u.email, role: u.role }));

  // Visibility: if a meeting has specific participants, only show it to admins, the host, or invited people
  const visibleMeetings = meetings.filter((m) => {
    if (isAdmin) return true;
    if (isParent && m.type !== "PTA" && m.type !== "Parent Conference") return false;
    if (m.participants.length === 0) return true;
    return m.participants.some((p) => p.email.toLowerCase() === currentUserEmail.toLowerCase());
  });

  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingView | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = visibleMeetings.filter((m) => filter === "All" || m.type === filter);

  const stats = {
    total: visibleMeetings.length,
    upcoming: visibleMeetings.filter((m) => deriveMeetingStatus(m.date, m.time, m.status) === "Scheduled").length,
    live: visibleMeetings.filter((m) => deriveMeetingStatus(m.date, m.time, m.status) === "In Progress").length,
    ended: visibleMeetings.filter((m) => deriveMeetingStatus(m.date, m.time, m.status) === "Ended").length,
  };

  function openAdd() { setForm(emptyForm); setEditingId(null); setFormError(null); setShowAdd(true); }
  function openEdit(m: MeetingView) {
    setForm({ title: m.title, type: m.type, description: m.description, date: m.date, time: m.time, participants: m.participants });
    setEditingId(m.id); setFormError(null); setShowAdd(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) { setFormError("Title and date are required."); return; }
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) {
        await updateMeeting(editingId, { title: form.title, type: form.type, description: form.description, date: form.date, time: form.time, participants: form.participants });
      } else {
        await addMeeting({ title: form.title, type: form.type, description: form.description, date: form.date, time: form.time, hostName: currentUserName, participants: form.participants });
      }
      setShowAdd(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteMeeting(id); } finally { setDeleteConfirmId(null); }
  }

  return (
    <AppLayout title="Meetings" subtitle="Schedule and join video meetings — PTAs, staff meetings, and more">
      {activeMeeting && (
        <JitsiRoom roomName={activeMeeting.roomName} displayName={currentUserName} onClose={() => setActiveMeeting(null)} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Meetings", value: stats.total,    icon: "ri-vidicon-line",           gradient: "from-violet-500 to-purple-600" },
          { label: "Upcoming",       value: stats.upcoming, icon: "ri-calendar-schedule-line",  gradient: "from-sky-500 to-blue-600" },
          { label: "Live Now",       value: stats.live,     icon: "ri-live-line",               gradient: "from-emerald-500 to-teal-600" },
          { label: "Ended",          value: stats.ended,    icon: "ri-history-line",            gradient: "from-slate-400 to-slate-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}>
              <i className={`${stat.icon} text-white text-lg`}></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-none">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", ...MEETING_TYPES].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === tab ? "bg-violet-600 text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}>
              {tab}
            </button>
          ))}
        </div>
        {canManage && (
          <button onClick={openAdd} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer">
            <i className="ri-add-line text-base"></i> Schedule Meeting
          </button>
        )}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <i className="ri-vidicon-off-line text-slate-300 text-3xl"></i>
          </div>
          <p className="text-slate-500 font-medium">No meetings found</p>
          <p className="text-slate-400 text-sm mt-1">{canManage ? "Schedule one to get started." : "Check back later for upcoming meetings."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((meeting) => {
            const cfg = typeConfig[meeting.type] ?? typeConfig["General"];
            const liveStatus = deriveMeetingStatus(meeting.date, meeting.time, meeting.status);
            const canJoin = liveStatus === "In Progress" || liveStatus === "Scheduled";
            return (
              <div key={meeting.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {/* Header */}
                <div className={`bg-gradient-to-r ${cfg.gradient} p-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <i className={`${cfg.icon} text-white text-xl`}></i>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${statusStyle[liveStatus] ?? "bg-slate-100 text-slate-500"}`}>
                      {liveStatus === "In Progress" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>}
                      {liveStatus}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-base mt-3 leading-snug line-clamp-2">{meeting.title}</h3>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{meeting.type}</span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2.5 flex-1">
                  {meeting.description && <p className="text-slate-500 text-xs line-clamp-2">{meeting.description}</p>}
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <i className="ri-calendar-line text-slate-400"></i>
                    {formatDateTime(meeting.date, meeting.time)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <i className="ri-user-line text-slate-400"></i>
                    Hosted by {meeting.hostName}
                  </div>

                  {/* Participants */}
                  {meeting.participants.length > 0 ? (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div className="flex -space-x-1.5">
                        {meeting.participants.slice(0, 4).map((p) => (
                          <div key={p.email} title={`${p.name} (${p.role})`}
                            className="w-6 h-6 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-violet-700">{getInitials(p.name)}</span>
                          </div>
                        ))}
                        {meeting.participants.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                            <span className="text-[9px] font-bold text-slate-500">+{meeting.participants.length - 4}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{meeting.participants.length} invited</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs pt-0.5">
                      <i className="ri-group-line"></i>
                      Open to all
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <button onClick={() => setActiveMeeting(meeting)} disabled={!canJoin}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${canJoin ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                    <i className="ri-vidicon-line"></i>
                    {liveStatus === "In Progress" ? "Join Now" : liveStatus === "Scheduled" ? "Join" : "Ended"}
                  </button>
                  {canManage && (
                    <>
                      <button onClick={() => openEdit(meeting)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all cursor-pointer">
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button onClick={() => setDeleteConfirmId(meeting.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-slate-800 font-bold text-base">{editingId ? "Edit Meeting" : "Schedule Meeting"}</h2>
                <p className="text-slate-400 text-xs mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Term 2 PTA Meeting"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                  {MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What's the agenda for this meeting?" rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
              </div>

              {/* Participants */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Invite Specific People
                  </label>
                  <span className="text-[11px] text-slate-400">Leave empty for open meeting</span>
                </div>
                <ParticipantPicker
                  selected={form.participants}
                  onChange={(p) => setForm((f) => ({ ...f, participants: p }))}
                  allPeople={allPeople}
                />
              </div>

              {formError && <p className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg">{formError}</p>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold disabled:opacity-60 cursor-pointer transition-colors">
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-rose-500 text-xl"></i>
            </div>
            <h3 className="text-slate-800 font-bold text-base">Delete Meeting?</h3>
            <p className="text-slate-500 text-sm mt-1 mb-5">This cannot be undone. The meeting room link will stop working.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={() => void handleDelete(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold cursor-pointer transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
