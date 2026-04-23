import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";

const allNotifications = [
  { id: 1, title: "Overdue Fee Alert", message: "Kweku Asante has an outstanding fee of GH₵2,000 for Term 2 tuition. Payment is 14 days overdue.", time: "10 min ago", type: "Finance", read: false, priority: "High" },
  { id: 2, title: "Overdue Fee Alert", message: "Esi Bonsu has an outstanding fee of GH₵2,000 for Term 2 tuition. Payment is 7 days overdue.", time: "25 min ago", type: "Finance", read: false, priority: "High" },
  { id: 3, title: "Science Fair 2026 — 7 Days Away", message: "The Science Fair is scheduled for April 30 at 10:00 AM in the Science Block. 150 attendees expected.", time: "1 hr ago", type: "Event", read: false, priority: "Medium" },
  { id: 4, title: "Low Inventory: Whiteboard Markers", message: "Whiteboard markers stock is at 5 units, below the minimum threshold of 10. Please reorder.", time: "2 hrs ago", type: "Inventory", read: false, priority: "Medium" },
  { id: 5, title: "Parent-Teacher Conference Reminder", message: "Parent-Teacher Conference is on April 28 at 2:00 PM in the Assembly Hall. 80 parents expected.", time: "3 hrs ago", type: "Event", read: true, priority: "Low" },
  { id: 6, title: "Attendance Alert: Yaw Frimpong", message: "Yaw Frimpong's attendance has dropped to 71%, below the 80% minimum threshold.", time: "5 hrs ago", type: "Attendance", read: true, priority: "High" },
  { id: 7, title: "New Teacher Added", message: "Mrs. Comfort Nyarko has been added to the system as a French teacher for Grade 8A, 9B, and 10B.", time: "1 day ago", type: "System", read: true, priority: "Low" },
  { id: 8, title: "Term 2 Report Cards Ready", message: "Term 2 report cards for all Grade 9 students are ready for review and distribution.", time: "2 days ago", type: "Academic", read: true, priority: "Medium" },
  { id: 9, title: "Critical Stock: First Aid Kits", message: "First Aid Kits are critically low at 2 units. Minimum required is 5. Immediate reorder needed.", time: "2 days ago", type: "Inventory", read: true, priority: "High" },
  { id: 10, title: "Scientific Calculators Low Stock", message: "Scientific calculators are at 12 units, below the minimum of 15. Consider reordering.", time: "3 days ago", type: "Inventory", read: true, priority: "Medium" },
];

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
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState("All");

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

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
          <button onClick={markAllRead} className="text-xs text-teal-600 font-medium hover:text-teal-700 cursor-pointer whitespace-nowrap">
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
                onClick={() => markRead(n.id)}
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
