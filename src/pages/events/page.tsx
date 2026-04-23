import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { events } from "@/mocks/schoolData";

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

export default function EventsPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  const filtered = events.filter((e) => filter === "All" || e.status === filter);

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line text-sm"></i>
          Add Event
        </button>
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
                    {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
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
                  <button className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer transition-all">View Details</button>
                  <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-rose-600 text-xs font-medium cursor-pointer transition-all">Edit</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Add New Event</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Event Title", placeholder: "e.g. Annual Sports Day", type: "text" },
                { label: "Date", placeholder: "", type: "date" },
                { label: "Time", placeholder: "", type: "time" },
                { label: "Location", placeholder: "e.g. School Grounds", type: "text" },
                { label: "Expected Attendees", placeholder: "e.g. 200", type: "number" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 focus:bg-white" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Event Type</label>
                <select className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-300 transition-all bg-slate-50 cursor-pointer">
                  {Object.keys(typeConfig).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
