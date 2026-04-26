import { useSchoolData } from "@/contexts/SchoolDataContext";
import { useNavigate } from "react-router-dom";

const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
  Academic: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  Sports: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Meeting: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Cultural: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function UpcomingEvents() {
  const navigate = useNavigate();
  const { events } = useSchoolData();
  const upcoming = [...events]
    .filter((e) => e.status === "Upcoming")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Events</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{upcoming.length} scheduled</p>
        </div>
        <button onClick={() => navigate("/events")} className="text-xs text-teal-600 font-medium hover:text-teal-700 cursor-pointer whitespace-nowrap">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {upcoming.map((ev) => {
          const cfg = typeColors[ev.type] || typeColors.Academic;
          const d = new Date(ev.date);
          const day = d.toLocaleDateString("en", { day: "2-digit" });
          const mon = d.toLocaleDateString("en", { month: "short" });
          return (
            <div key={ev.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/events")}>
              <div className="flex-shrink-0 w-10 h-10 flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-800 leading-none">{day}</p>
                <p className="text-xs text-slate-400 leading-none mt-0.5">{mon}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-teal-600 transition-colors">{ev.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <i className="ri-time-line text-slate-400 text-xs"></i>
                  <p className="text-xs text-slate-400">{ev.time}</p>
                  <span className="text-slate-200">·</span>
                  <i className="ri-map-pin-line text-slate-400 text-xs"></i>
                  <p className="text-xs text-slate-400 truncate">{ev.location}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} whitespace-nowrap`}>
                {ev.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
