import { useNavigate } from "react-router-dom";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import { normalizeRole } from "@/lib/access";

export default function RecentActivity() {
  const navigate = useNavigate();
  const { recentActivity, currentUserRole } = useSchoolData();
  const role = normalizeRole(currentUserRole);
  const activities = role === "Teacher"
    ? recentActivity.filter((activity) => activity.tag !== "Finance" && activity.tag !== "Event")
    : recentActivity;
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
        {activities.length > 0 ? activities.map((a) => (
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
        )) : (
          <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <i className="ri-inbox-archive-line text-slate-400 text-lg"></i>
            </div>
            <p className="text-sm font-semibold text-slate-600">No recent activity yet</p>
            <p className="text-xs text-slate-400 mt-1">New enrollments, attendance, and updates will appear here.</p>
          </div>
        )}
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
