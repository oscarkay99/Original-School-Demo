import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const typeConfig: Record<string, { icon: string; bg: string; text: string }> = {
  Finance: { icon: "ri-money-dollar-circle-line", bg: "bg-teal-50", text: "text-teal-600" },
  Event: { icon: "ri-calendar-event-line", bg: "bg-slate-100", text: "text-slate-600" },
  Inventory: { icon: "ri-archive-drawer-line", bg: "bg-amber-50", text: "text-amber-600" },
  Attendance: { icon: "ri-calendar-check-line", bg: "bg-rose-50", text: "text-rose-500" },
  System: { icon: "ri-settings-4-line", bg: "bg-slate-100", text: "text-slate-500" },
  Academic: { icon: "ri-book-open-line", bg: "bg-slate-100", text: "text-slate-600" },
};

const priorityConfig: Record<string, string> = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-slate-100 text-slate-500",
};

export default function NotificationsPage() {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useSchoolData();
  const [filter, setFilter] = useState("All");

  const types = ["All", "Finance", "Event", "Inventory", "Attendance", "Academic", "System"];
  const filtered = notifications.filter((n) => filter === "All" || n.type === filter);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout title="Notifications" subtitle="Stay updated with school alerts and reminders">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: notifications.length, icon: "ri-notification-3-line" },
          { label: "Unread", value: unread, icon: "ri-mail-unread-line" },
          { label: "High Priority", value: notifications.filter((n) => n.priority === "High").length, icon: "ri-error-warning-line" },
          { label: "Today", value: notifications.filter((n) => n.time.includes("min") || n.time.includes("hr")).length, icon: "ri-time-line" },
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
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${filter === t ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button onClick={() => void markAllNotificationsRead()} className="text-xs text-teal-600 font-medium hover:text-teal-700 cursor-pointer whitespace-nowrap">
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.System;
            return (
              <div
                key={n.id}
                onClick={() => void markNotificationRead(n.id)}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-all ${!n.read ? "bg-teal-50/30" : ""}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${cfg.bg} flex-shrink-0 mt-0.5`}>
                  <i className={`${cfg.icon} ${cfg.text} text-base`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></span>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityConfig[n.priority]}`}>{n.priority}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{n.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{n.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
