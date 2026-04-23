import { activityFeed } from "@/mocks/schoolData";

const typeConfig: Record<string, { color: string; bg: string; icon: string }> = {
  academic: { color: "text-violet-600", bg: "bg-violet-100", icon: "ri-book-open-line" },
  attendance: { color: "text-emerald-600", bg: "bg-emerald-100", icon: "ri-calendar-check-line" },
  finance: { color: "text-amber-600", bg: "bg-amber-100", icon: "ri-money-dollar-circle-line" },
  announcement: { color: "text-sky-600", bg: "bg-sky-100", icon: "ri-megaphone-line" },
  event: { color: "text-pink-600", bg: "bg-pink-100", icon: "ri-calendar-event-line" },
};

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="font-semibold text-slate-800 text-sm">Live Activity Stream</p>
        </div>
        <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700 cursor-pointer">View all</button>
      </div>
      <div className="divide-y divide-slate-50">
        {activityFeed.map((item) => {
          const cfg = typeConfig[item.type] || typeConfig.academic;
          return (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-all">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 mt-0.5">
                <span className="text-slate-600 text-xs font-bold">{item.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-800">{item.user}</span>{" "}
                  {item.action}{" "}
                  <span className="font-medium text-slate-600">{item.subject}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${cfg.bg} flex-shrink-0`}>
                <i className={`${cfg.icon} ${cfg.color} text-xs`}></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
