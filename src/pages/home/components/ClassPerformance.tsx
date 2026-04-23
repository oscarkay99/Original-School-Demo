import { useState } from "react";

const classData = [
  { name: "Grade 8A", avg: 87, students: 32, teacher: "Mrs. Asiedu", trend: "up" },
  { name: "Grade 9A", avg: 84, students: 30, teacher: "Mr. Agyei", trend: "up" },
  { name: "Grade 10B", avg: 79, students: 28, teacher: "Mr. Agyei", trend: "down" },
  { name: "Grade 11A", avg: 76, students: 25, teacher: "Mr. Agyei", trend: "up" },
  { name: "Grade 8C", avg: 82, students: 31, teacher: "Ms. Adu", trend: "up" },
  { name: "Grade 11C", avg: 71, students: 24, teacher: "Ms. Adu", trend: "down" },
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  item: typeof classData[0] | null;
}

export default function ClassPerformance() {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, item: null });
  const maxAvg = 100;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: typeof classData[0]) => {
    const rect = e.currentTarget.closest(".perf-container")?.getBoundingClientRect();
    const barRect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: barRect.left - (rect?.left ?? 0) + barRect.width / 2,
      y: barRect.top - (rect?.top ?? 0) - 8,
      item,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Performance</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">Avg Score by Class</p>
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50">
          <i className="ri-bar-chart-grouped-line text-slate-500 text-base"></i>
        </div>
      </div>

      <div className="perf-container relative">
        <div className="flex items-end gap-2 h-28">
          {classData.map((item, i) => {
            const h = Math.round((item.avg / maxAvg) * 100);
            const color = item.avg >= 85 ? "bg-teal-500 hover:bg-teal-600" : item.avg >= 78 ? "bg-slate-400 hover:bg-slate-500" : "bg-rose-400 hover:bg-rose-500";
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
              >
                <p className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{item.avg}</p>
                <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-t-md ${color} transition-all duration-300`}
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors text-center leading-tight" style={{ fontSize: "10px" }}>
                  {item.name.replace("Grade ", "Gr.")}
                </p>
              </div>
            );
          })}
        </div>

        {tooltip.visible && tooltip.item && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xl text-xs min-w-[150px]">
              <p className="font-semibold text-white mb-1.5 border-b border-white/10 pb-1.5">{tooltip.item.name}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">Avg Score</span>
                  <span className="font-bold text-teal-300">{tooltip.item.avg}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">Students</span>
                  <span className="font-bold">{tooltip.item.students}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">Teacher</span>
                  <span className="font-bold text-slate-200 text-right">{tooltip.item.teacher}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">Trend</span>
                  <span className={`font-bold flex items-center gap-1 ${tooltip.item.trend === "up" ? "text-emerald-300" : "text-rose-300"}`}>
                    <i className={`${tooltip.item.trend === "up" ? "ri-arrow-up-line" : "ri-arrow-down-line"} text-xs`}></i>
                    {tooltip.item.trend === "up" ? "Improving" : "Declining"}
                  </span>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
