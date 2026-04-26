import { useState } from "react";
import { useNavigate } from "react-router-dom";

const monthlyData = [
  { month: "Sep", present: 88, absent: 8, late: 4 },
  { month: "Oct", present: 91, absent: 6, late: 3 },
  { month: "Nov", present: 89, absent: 7, late: 4 },
  { month: "Dec", present: 85, absent: 10, late: 5 },
  { month: "Jan", present: 87, absent: 9, late: 4 },
  { month: "Feb", present: 92, absent: 5, late: 3 },
  { month: "Mar", present: 96, absent: 3, late: 1 },
  { month: "Apr", present: 91, absent: 6, late: 3 },
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: typeof monthlyData[0] | null;
}

export default function AttendanceChart() {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, data: null });
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = 100;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, d: typeof monthlyData[0], i: number) => {
    const rect = e.currentTarget.closest(".att-chart")?.getBoundingClientRect();
    const barRect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: barRect.left - (rect?.left ?? 0) + barRect.width / 2,
      y: barRect.top - (rect?.top ?? 0) - 8,
      data: d,
    });
    setHovered(i);
  };

  const handleMouseLeave = () => {
    setTooltip((t) => ({ ...t, visible: false }));
    setHovered(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Attendance Pulse</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly breakdown · 2025/26</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>Present
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>Absent
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>Late
          </span>
        </div>
      </div>

      <div className="att-chart relative">
        <div className="flex items-end gap-2 h-44">
          {monthlyData.map((d, i) => {
            const presentH = (d.present / maxVal) * 160;
            const absentH = (d.absent / maxVal) * 160;
            const lateH = (d.late / maxVal) * 160;
            const isHov = hovered === i;
            return (
              <div
                key={i}
                onClick={() => navigate("/attendance")}
                className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer group"
                onMouseEnter={(e) => handleMouseEnter(e, d, i)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="relative w-full flex flex-col items-center gap-0.5" style={{ height: "160px", justifyContent: "flex-end" }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${presentH}px`,
                      background: isHov ? "#7c3aed" : "linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%)",
                      opacity: isHov ? 1 : 0.85,
                    }}
                  ></div>
                  <div
                    className="w-full bg-rose-400 transition-all duration-300"
                    style={{ height: `${absentH}px`, opacity: isHov ? 1 : 0.8 }}
                  ></div>
                  <div
                    className="w-full rounded-b-lg bg-amber-400 transition-all duration-300"
                    style={{ height: `${lateH}px`, opacity: isHov ? 1 : 0.8 }}
                  ></div>
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-colors ${isHov ? "text-violet-600" : "text-slate-400"}`}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>

        {tooltip.visible && tooltip.data && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-2xl text-xs min-w-[148px]">
              <p className="font-bold text-white mb-1.5 border-b border-white/10 pb-1.5">{tooltip.data.month} 2025/26</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block"></span>Present</span>
                  <span className="font-bold text-violet-300">{tooltip.data.present}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>Absent</span>
                  <span className="font-bold text-rose-300">{tooltip.data.absent}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>Late</span>
                  <span className="font-bold text-amber-300">{tooltip.data.late}%</span>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-violet-600">91.5%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Avg Attendance</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-emerald-600">Mar (96%)</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Best Month</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-rose-500">Jan (87%)</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Lowest</p>
        </div>
      </div>
    </div>
  );
}
