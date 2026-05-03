import { useEffect, useRef } from "react";
import { useSchoolData } from "@/contexts/SchoolDataContext";

export default function FeeVelocity() {
  const { financeData } = useSchoolData();
  const terms = financeData.monthlyData.slice(0, 3).map((item, index) => ({
    label: `Term ${index + 1}`,
    amount: `GH₵${item.revenue.toLocaleString()}`,
    pct: financeData.totalRevenue ? Math.round((item.revenue / financeData.totalRevenue) * 100) : 0,
  }));
  const COLLECTED_PCT = financeData.totalRevenue ? Math.round((financeData.collected / financeData.totalRevenue) * 100) : 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = 48;
    const lineW = 12;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (COLLECTED_PCT / 100) * 2 * Math.PI;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = lineW;
    ctx.stroke();

    // Progress gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#14b8a6");
    grad.addColorStop(1, "#06b6d4");
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineW;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [COLLECTED_PCT]);

  return (
    <div
      className="rounded-2xl p-6 text-white relative overflow-hidden h-full flex flex-col"
      style={{ background: "linear-gradient(135deg, #1a1040 0%, #0f172a 60%, #0c1a2e 100%)" }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 blur-3xl bg-teal-400"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15 blur-2xl bg-violet-500"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Fee Velocity</h3>
            <p className="text-white/40 text-xs mt-0.5">2025/26 · All Terms</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <i className="ri-money-dollar-circle-line text-lg text-white/70"></i>
          </div>
        </div>

        {/* Donut */}
        <div className="flex items-center justify-center my-4">
          <div className="relative w-32 h-32">
            <canvas ref={canvasRef} className="w-32 h-32" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{COLLECTED_PCT}%</span>
              <span className="text-white/40 text-[9px] uppercase tracking-wider">collected</span>
            </div>
          </div>
        </div>

        {/* Term bars */}
        <div className="space-y-3 flex-1">
          {terms.map((t) => (
            <div key={t.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/70 text-xs font-medium">{t.label}</span>
                <span className="text-white/50 text-[10px]">{t.amount}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${t.pct}%`,
                    background: "linear-gradient(90deg, #14b8a6, #06b6d4)",
                  }}
                ></div>
              </div>
              <p className="text-white/30 text-[9px] mt-0.5 text-right">{t.pct}%</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Outstanding</p>
            <p className="text-rose-400 font-bold text-base">GH₵{financeData.outstanding.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Total Target</p>
            <p className="text-white font-bold text-base">GH₵{financeData.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
