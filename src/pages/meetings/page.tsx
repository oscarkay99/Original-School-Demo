import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import type { MeetingView } from "@/contexts/SchoolDataContext";

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

const typeConfig: Record<string, { gradient: string; icon: string; bg: string; text: string }> = {
  "PTA":               { gradient: "from-violet-500 to-purple-600",  icon: "ri-parent-line",        bg: "bg-violet-50",  text: "text-violet-700" },
  "Staff Meeting":     { gradient: "from-teal-500 to-emerald-600",   icon: "ri-team-line",           bg: "bg-teal-50",    text: "text-teal-700" },
  "Parent Conference": { gradient: "from-amber-500 to-orange-600",   icon: "ri-discuss-line",        bg: "bg-amber-50",   text: "text-amber-700" },
  "General":           { gradient: "from-slate-500 to-slate-600",    icon: "ri-vidicon-line",        bg: "bg-slate-100",  text: "text-slate-700" },
};

const statusStyle: Record<string, string> = {
  Scheduled:   "bg-sky-100 text-sky-700",
  "In Progress": "bg-emerald-100 text-emerald-700",
  Ended:       "bg-slate-100 text-slate-500",
  Cancelled:   "bg-rose-100 text-rose-600",
};

function deriveMeetingStatus(date: string, time: string, currentStatus: string): string {
  if (currentStatus === "Cancelled" || currentStatus === "Ended") return currentStatus;
  if (!date) return currentStatus;
  const meetingDate = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(meetingDate.getTime())) return currentStatus;
  const now = new Date();
  const diffMs = meetingDate.getTime() - now.getTime();
  if (diffMs > 0) return "Scheduled";
  if (diffMs > -3600000) return "In Progress";
  return "Ended";
}

function formatDateTime(date: string, time: string) {
  if (!date) return "Not scheduled";
  try {
    const dt = new Date(`${date}T${time || "00:00"}`);
    return dt.toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return `${date} ${time}`;
  }
}

interface JitsiRoomProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
}

function JitsiRoom({ roomName, displayName, onClose }: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ dispose: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function initJitsi() {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;
      try {
        apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          userInfo: { displayName },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "closedcaptions", "desktop",
              "fullscreen", "fodeviceselection", "hangup", "chat",
              "raisehand", "videoquality", "tileview", "participants-pane",
            ],
          },
        });
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) setError("Failed to start the meeting room. Please try again.");
      }
    }

    if (window.JitsiMeetExternalAPI) {
      initJitsi();
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => { if (!cancelled) initJitsi(); };
      script.onerror = () => { if (!cancelled) setError("Could not load Jitsi. Check your internet connection."); };
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
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
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <i className="ri-phone-fill rotate-[135deg]"></i>
          Leave
        </button>
      </div>

      <div className="flex-1 relative">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
              <i className="ri-vidicon-line text-white text-xl"></i>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
            <p className="text-white/60 text-sm">Connecting to meeting room...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-4">
            <i className="ri-error-warning-line text-rose-400 text-4xl"></i>
            <p className="text-white/70 text-sm text-center max-w-xs">{error}</p>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors cursor-pointer">
              Close
            </button>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

interface FormState {
  title: string;
  type: string;
  description: string;
  date: string;
  time: string;
}

const emptyForm: FormState = { title: "", type: "Staff Meeting", description: "", date: "", time: "09:00" };

export default function MeetingsPage() {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, currentUserRole, currentUserName } = useSchoolData();

  const role = currentUserRole.toLowerCase();
  const canManage = ["admin", "administrator", "teacher", "secretary"].includes(role);
  const isParent = role === "parent";

  const visibleMeetings = isParent
    ? meetings.filter((m) => m.type === "PTA" || m.type === "Parent Conference")
    : meetings;

  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filterTabs = ["All", ...MEETING_TYPES];

  const filtered = visibleMeetings.filter((m) => {
    const live = deriveMeetingStatus(m.date, m.time, m.status);
    if (filter === "All") return true;
    return m.type === filter;
  });

  const stats = {
    total: visibleMeetings.length,
    upcoming: visibleMeetings.filter((m) => deriveMeetingStatus(m.date, m.time, m.status) === "Scheduled").length,
    live: visibleMeetings.filter((m) => deriveMeetingStatus(m.date, m.time, m.status) === "In Progress").length,
    ended: visibleMeetings.filter((m) => deriveMeetingStatus(m.date, m.time, m.status) === "Ended").length,
  };

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowAdd(true);
    setError(null);
  }

  function openEdit(m: MeetingView) {
    setForm({ title: m.title, type: m.type, description: m.description, date: m.date, time: m.time });
    setEditingId(m.id);
    setShowAdd(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) { setError("Title and date are required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await updateMeeting(editingId, { title: form.title, type: form.type, description: form.description, date: form.date, time: form.time });
      } else {
        await addMeeting({ title: form.title, type: form.type, description: form.description, date: form.date, time: form.time, hostName: currentUserName });
      }
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMeeting(id);
    } finally {
      setDeleteConfirmId(null);
    }
  }

  return (
    <AppLayout title="Meetings" subtitle="Schedule and join video meetings — PTAs, staff meetings, and more">
      {activeMeeting && (
        <JitsiRoom
          roomName={activeMeeting.roomName}
          displayName={currentUserName}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Meetings", value: stats.total,    icon: "ri-vidicon-line",          gradient: "from-violet-500 to-purple-600" },
          { label: "Upcoming",       value: stats.upcoming, icon: "ri-calendar-schedule-line", gradient: "from-sky-500 to-blue-600" },
          { label: "Live Now",       value: stats.live,     icon: "ri-live-line",              gradient: "from-emerald-500 to-teal-600" },
          { label: "Ended",          value: stats.ended,    icon: "ri-history-line",           gradient: "from-slate-400 to-slate-600" },
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
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab ? "bg-violet-600 text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {canManage && (
          <button
            onClick={openAdd}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <i className="ri-add-line text-base"></i>
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Meeting cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <i className="ri-vidicon-off-line text-slate-300 text-3xl"></i>
          </div>
          <p className="text-slate-500 font-medium">No meetings found</p>
          <p className="text-slate-400 text-sm mt-1">
            {canManage ? "Schedule one to get started." : "Check back later for upcoming meetings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((meeting) => {
            const cfg = typeConfig[meeting.type] ?? typeConfig["General"];
            const liveStatus = deriveMeetingStatus(meeting.date, meeting.time, meeting.status);
            const canJoin = liveStatus === "In Progress" || liveStatus === "Scheduled";
            return (
              <div key={meeting.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Card header */}
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
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                    {meeting.type}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-2.5">
                  {meeting.description && (
                    <p className="text-slate-500 text-xs line-clamp-2">{meeting.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <i className="ri-calendar-line text-slate-400"></i>
                    {formatDateTime(meeting.date, meeting.time)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <i className="ri-user-line text-slate-400"></i>
                    Hosted by {meeting.hostName}
                  </div>
                </div>

                {/* Card actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={() => setActiveMeeting(meeting)}
                    disabled={!canJoin}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canJoin
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <i className="ri-vidicon-line"></i>
                    {liveStatus === "In Progress" ? "Join Now" : liveStatus === "Scheduled" ? "Join" : "Ended"}
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEdit(meeting)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all cursor-pointer"
                      >
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(meeting.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-slate-800 font-bold text-base">{editingId ? "Edit Meeting" : "Schedule Meeting"}</h2>
                <p className="text-slate-400 text-xs mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Term 2 PTA Meeting"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                >
                  {MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What's the agenda for this meeting?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold disabled:opacity-60 cursor-pointer transition-colors"
                >
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
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={() => void handleDelete(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold cursor-pointer transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
