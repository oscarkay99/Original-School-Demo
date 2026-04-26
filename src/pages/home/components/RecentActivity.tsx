import { useNavigate } from "react-router-dom";
import { useSchoolData } from "@/contexts/SchoolDataContext";

export default function RecentActivity() {
  const navigate = useNavigate();
  const { recentActivity: activities } = useSchoolData();
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
            onClick={() => navigate("/notifications")}
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
