import { useEffect, useRef, useState } from "react";

const grades = [
  { label: "A (80–100)", count: 5, color: "#8b5cf6", light: "bg-violet-500" },
  { label: "B (70–79)", count: 4, color: "#f59e0b", light: "bg-amber-400" },
  { label: "C (60–69)", count: 2, color: "#10b981", light: "bg-emerald-500" },
  { label: "D (50–59)", count: 1, color: "#f43f5e", light: "bg-rose-500" },
];
const total = grades.reduce((a, g) => a + g.count, 0);

export default function GradeDistribution() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 144;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = 54;
    const innerR = 34;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    grades.forEach((g, i) => {
      const slice = (g.count / total) * 2 * Math.PI;
      const endAngle = startAngle + slice;
      const isHov = hovered === i;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, isHov ? r + 4 : r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = g.color;
      ctx.globalAlpha = isHov ? 1 : 0.85;
      ctx.fill();

      startAngle = endAngle;
    });

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(total), cx, cy - 5);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("students", cx, cy + 10);
  }, [hovered]);

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">Grade Distribution</h3>
        <p className="text-xs text-slate-400 mt-0.5">Current term · {total} students</p>
      </div>
      <div className="flex items-center gap-5">
        <canvas
          ref={canvasRef}
          className="w-36 h-36 flex-shrink-0 cursor-pointer"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left - 72;
            const y = e.clientY - rect.top - 72;
            const angle = Math.atan2(y, x) + Math.PI / 2;
            const norm = angle < 0 ? angle + 2 * Math.PI : angle;
            let start = 0;
            let found = -1;
            grades.forEach((g, i) => {
              const slice = (g.count / total) * 2 * Math.PI;
              if (norm >= start && norm < start + slice) found = i;
              start += slice;
            });
            setHovered(found >= 0 ? found : null);
          }}
          onMouseLeave={() => setHovered(null)}
        />
        <div className="flex-1 space-y-2.5">
          {grades.map((g, i) => (
            <div
              key={g.label}
              className={`flex items-center gap-2.5 cursor-pointer rounded-lg p-1.5 transition-all ${hovered === i ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${g.light}`}></span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 leading-tight">{g.label}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(g.count / total) * 100}%`, background: g.color }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-700 w-4">{g.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
