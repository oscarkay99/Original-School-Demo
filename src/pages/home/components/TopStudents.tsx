import { useSchoolData } from "@/contexts/SchoolDataContext";
import { useNavigate } from "react-router-dom";

export default function TopStudents() {
  const navigate = useNavigate();
  const { topStudents: performers } = useSchoolData();
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Top Performers</h3>
          <p className="text-xs text-slate-400 mt-0.5">Highest GPA · Current term</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <i className="ri-trophy-line text-amber-500 text-lg"></i>
        </div>
      </div>

      <div className="space-y-3">
        {performers.map((p) => (
          <div
            key={p.rank}
            onClick={() => navigate("/students")}
            className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <span className={`text-xs font-extrabold ${p.rankColor}`}>#{p.rank}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{p.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors truncate">{p.name}</p>
              <p className="text-xs text-slate-400">{p.class}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-extrabold text-slate-800 tabular-nums">
                {p.score}<span className="text-xs text-slate-400 font-normal">%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
