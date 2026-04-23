import { useNavigate } from "react-router-dom";

const activities = [
  {
    id: 1,
    text: "New student Kojo Tetteh enrolled in JHS 1B",
    tag: "Enrollment",
    time: "2 min ago",
    icon: "ri-user-add-line",
    tagBg: "bg-violet-100",
    tagText: "text-violet-700",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    id: 2,
    text: "Fee payment GH₵2,400 received — Kofi Owusu",
    tag: "Finance",
    time: "18 min ago",
    icon: "ri-money-dollar-circle-line",
    tagBg: "bg-emerald-100",
    tagText: "text-emerald-700",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: 3,
    text: "JHS 3A attendance marked — 14/15 present today",
    tag: "Attendance",
    time: "1 hr ago",
    icon: "ri-calendar-check-line",
    tagBg: "bg-amber-100",
    tagText: "text-amber-700",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: 4,
    text: "Certificate issued to Abena Frimpong — Academic Excellence",
    tag: "Certificate",
    time: "3 hr ago",
    icon: "ri-medal-line",
    tagBg: "bg-rose-100",
    tagText: "text-rose-700",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

export default function RecentActivity() {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">Live school event feed</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-600">Live</span>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-xl ${a.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
              <i className={`${a.icon} ${a.iconColor} text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{a.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${a.tagBg} ${a.tagText}`}>{a.tag}</span>
                <span className="text-[10px] text-slate-400">{a.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/notifications")}
        className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-all cursor-pointer border border-slate-100 whitespace-nowrap"
      >
        View all activity
      </button>
    </div>
  );
}
