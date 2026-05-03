import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const typeConfig: Record<string, { gradient: string; icon: string; bg: string; text: string }> = {
  Academic: { gradient: "from-slate-500 to-slate-600", icon: "ri-book-open-line", bg: "bg-slate-100", text: "text-slate-600" },
  Sports: { gradient: "from-slate-500 to-slate-600", icon: "ri-football-line", bg: "bg-slate-100", text: "text-slate-600" },
  Meeting: { gradient: "from-slate-500 to-slate-600", icon: "ri-group-line", bg: "bg-slate-100", text: "text-slate-600" },
  Cultural: { gradient: "from-slate-500 to-slate-600", icon: "ri-music-line", bg: "bg-slate-100", text: "text-slate-600" },
};

const statusStyle: Record<string, string> = {
  Upcoming: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-600",
};

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function getEventTimingLabel(date: string, status: string) {
  if (!date) return "Date to be confirmed";
  const eventDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(eventDate.getTime())) return date;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((eventDate.getTime() - today.getTime()) / 86400000);

  if (status === "Cancelled") return "Cancelled and no longer scheduled";
  if (diffDays === 0) return "Scheduled for today";
  if (diffDays > 0) return diffDays === 1 ? "Happening tomorrow" : `Happening in ${diffDays} days`;

  const elapsed = Math.abs(diffDays);
  return elapsed === 1 ? "Held yesterday" : `Held ${elapsed} days ago`;
}

function getEventBrief(event: { title: string; description: string; type: string; date: string; time: string; location: string; attendees: number; status: string }) {
  if (event.description.trim()) return event.description.trim();

  const audienceLabel =
    event.attendees >= 200 ? "a large school audience" :
    event.attendees >= 80 ? "a broad staff and student audience" :
    "a focused group of participants";

  const statusLine =
    event.status === "Cancelled"
      ? "It is currently cancelled, so any communication or logistics should reflect that change immediately."
      : event.status === "Completed"
        ? "It has already taken place and should now be treated as part of the school's completed event record."
        : "It remains an upcoming activity and should stay on the operational planning list until the date passes.";

  return `${event.title} is a ${event.type.toLowerCase()} event planned for ${formatEventDate(event.date)} at ${event.time} in ${event.location}, intended for ${audienceLabel}. ${statusLine}`;
}

export default function EventsPage() {
  const { events, addEvent, updateEvent, currentUserRole } = useSchoolData();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    type: "Academic",
    status: "Upcoming",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    type: "Academic",
    status: "Upcoming",
  });
  const canManageEvents = ["admin", "administrator", "secretary"].includes(currentUserRole.toLowerCase());

  const filtered = [...events]
    .filter((e) => filter === "All" || e.status === filter)
    .sort((a, b) => {
      if (filter === "Completed") return b.date.localeCompare(a.date);
      if (filter === "Upcoming") return a.date.localeCompare(b.date);
      if (a.status !== b.status) return a.status === "Upcoming" ? -1 : 1;
      return a.status === "Upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    });

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.date || !form.time || !form.location) return;
    setSubmitting(true);
    try {
      await addEvent(form);
      setForm({ title: "", description: "", date: "", time: "", location: "", attendees: "", type: "Academic", status: "Upcoming" });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const editingEvent = events.find((event) => event.id === editingEventId) ?? null;
  const selectedCfg = selectedEvent ? typeConfig[selectedEvent.type] || typeConfig.Academic : null;
  const selectedTiming = selectedEvent ? getEventTimingLabel(selectedEvent.date, selectedEvent.status) : "";

  const openEditModal = (eventId: string) => {
    if (!canManageEvents) return;
    const event = events.find((entry) => entry.id === eventId);
    if (!event) return;
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      attendees: String(event.attendees),
      type: event.type,
      status: event.status,
    });
    setSelectedEventId(null);
    setEditingEventId(eventId);
  };

  const handleEditSubmit = async () => {
    if (!editingEventId || !editForm.title || !editForm.description || !editForm.date || !editForm.time || !editForm.location) return;
    setSubmitting(true);
    try {
      await updateEvent({
        id: editingEventId,
        ...editForm,
      });
      setEditingEventId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Events" subtitle="Manage school events and activities">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Events", value: events.length, icon: "ri-calendar-event-line" },
          { label: "Upcoming", value: events.filter((e) => e.status === "Upcoming").length, icon: "ri-time-line" },
          { label: "Completed", value: events.filter((e) => e.status === "Completed").length, icon: "ri-checkbox-circle-line" },
          { label: "Total Attendees", value: events.reduce((a, b) => a + b.attendees, 0), icon: "ri-group-line" },
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100">
          {["All", "Upcoming", "Completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === f ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {canManageEvents && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-sm"></i>
            Add Event
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((event) => {
          const cfg = typeConfig[event.type] || typeConfig.Academic;
          return (
            <div key={event.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
              <div className={`h-2 bg-gradient-to-r ${cfg.gradient}`}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-md`}>
                    <i className={`${cfg.icon} text-white text-base`}></i>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[event.status]}`}>{event.status}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{event.title}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} mb-3`}>{event.type}</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <i className="ri-calendar-line text-slate-400"></i>
                    {formatEventDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <i className="ri-time-line text-slate-400"></i>
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <i className="ri-map-pin-line text-slate-400"></i>
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <i className="ri-group-line text-slate-400"></i>
                    {event.attendees} attendees
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => setSelectedEventId(event.id)} className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer transition-all">View Details</button>
                  <button
                    onClick={() => openEditModal(event.id)}
                    disabled={!canManageEvents}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${canManageEvents ? "bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-rose-600 cursor-pointer" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    title={canManageEvents ? "Edit event" : "Only event managers can edit events"}
                  >
                    {canManageEvents ? "Edit" : "Restricted"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Add New Event</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {[
                { key: "title", label: "Event Title", placeholder: "e.g. Annual Sports Day", type: "text" },
                { key: "description", label: "Description", placeholder: "Briefly describe the purpose and plan for this event", type: "textarea" },
                { key: "date", label: "Date", placeholder: "", type: "date" },
                { key: "time", label: "Time", placeholder: "", type: "time" },
                { key: "location", label: "Location", placeholder: "e.g. School Grounds", type: "text" },
                { key: "attendees", label: "Expected Attendees", placeholder: "e.g. 200", type: "number" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 focus:bg-white resize-none"
                    />
                  ) : (
                    <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 focus:bg-white" />
                  )}
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Event Type</label>
                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 cursor-pointer">
                  {Object.keys(typeConfig).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 cursor-pointer">
                  {["Upcoming", "Completed", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap disabled:opacity-50">{submitting ? "Saving..." : "Add Event"}</button>
            </div>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Edit Event</p>
                <p className="text-xs text-slate-400 mt-0.5">Available to event managers</p>
              </div>
              <button onClick={() => setEditingEventId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {[
                { key: "title", label: "Event Title", placeholder: "e.g. Annual Sports Day", type: "text" },
                { key: "description", label: "Description", placeholder: "Briefly describe the purpose and plan for this event", type: "textarea" },
                { key: "date", label: "Date", placeholder: "", type: "date" },
                { key: "time", label: "Time", placeholder: "", type: "time" },
                { key: "location", label: "Location", placeholder: "e.g. School Grounds", type: "text" },
                { key: "attendees", label: "Expected Attendees", placeholder: "e.g. 200", type: "number" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={editForm[field.key as keyof typeof editForm]}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 focus:bg-white resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={editForm[field.key as keyof typeof editForm]}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 focus:bg-white"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Event Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 cursor-pointer"
                >
                  {Object.keys(typeConfig).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 cursor-pointer"
                >
                  {["Upcoming", "Completed", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setEditingEventId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleEditSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap disabled:opacity-50">
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            <div className={`px-6 py-5 bg-gradient-to-r ${selectedCfg?.gradient ?? typeConfig.Academic.gradient} text-white`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <i className={`${selectedCfg?.icon ?? typeConfig.Academic.icon} text-xl`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 border border-white/15">
                        {selectedEvent.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 border border-white/15">
                        {selectedEvent.status}
                      </span>
                    </div>
                    <p className="text-xl font-bold leading-tight">{selectedEvent.title}</p>
                    <p className="text-sm text-white/80 mt-1">
                      {selectedTiming}. {selectedEvent.attendees} attendees expected at {selectedEvent.location}.
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedEventId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer text-white/80">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Date", formatEventDate(selectedEvent.date), "ri-calendar-line"],
                  ["Time", selectedEvent.time, "ri-time-line"],
                  ["Venue", selectedEvent.location, "ri-map-pin-line"],
                  ["Attendance", `${selectedEvent.attendees} expected guests`, "ri-group-line"],
                ].map(([label, value, icon]) => (
                  <div key={String(label)} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-[0.18em]">
                      <i className={String(icon)}></i>
                      {label}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-2 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.18em] mb-3">Event Brief</p>
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    {getEventBrief(selectedEvent)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "Schedule Status",
                    value: selectedTiming,
                    tone: selectedEvent.status === "Upcoming" ? "bg-amber-50 text-amber-700 border-amber-100" : selectedEvent.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100",
                  },
                  {
                    label: "Operations Focus",
                    value: selectedEvent.attendees >= 150 ? "High coordination needed" : "Standard coordination",
                    tone: "bg-slate-50 text-slate-700 border-slate-100",
                  },
                  {
                    label: "Venue Readiness",
                    value: selectedEvent.location === "TBD" ? "Venue still unconfirmed" : "Venue assigned",
                    tone: selectedEvent.location === "TBD" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-700 border-slate-100",
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border p-4 ${item.tone}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{item.label}</p>
                    <p className="text-sm font-semibold mt-2">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => openEditModal(selectedEvent.id)}
                  disabled={!canManageEvents}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${canManageEvents ? "bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                  title={canManageEvents ? "Edit this event" : "Only event managers can edit events"}
                >
                  {canManageEvents ? "Edit Event" : "Restricted"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
