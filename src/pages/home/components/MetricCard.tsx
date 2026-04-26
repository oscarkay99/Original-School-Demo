import { useCountUp } from "@/hooks/useCountUp";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
  label: string;
  value: number;
  sub: string;
  icon: string;
  gradient: string;
  change: string;
  changeUp?: boolean;
  suffix?: string;
  decimals?: number;
  path?: string;
}

export default function MetricCard({ label, value, sub, icon, gradient, change, changeUp = true, suffix = "", decimals = 0, path }: MetricCardProps) {
  const navigate = useNavigate();
  const animated = useCountUp(value, 1600, decimals);
  const display = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString();

  return (
    <div
      onClick={() => path && navigate(path)}
      className={`rounded-2xl p-5 text-white relative overflow-hidden group transition-all duration-300 ${path ? "cursor-pointer hover:scale-[1.02]" : ""}`}
      style={{ background: gradient }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 bg-white blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
      <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full opacity-10 bg-white blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <i className={`${icon} text-xl text-white`}></i>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 whitespace-nowrap`}>
            <i className={`${changeUp ? "ri-arrow-up-line" : "ri-arrow-down-line"} text-xs`}></i>
            {change}
          </div>
        </div>
        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1">{label}</p>
        <p className="text-4xl font-extrabold leading-none tracking-tight tabular-nums">
          {display}{suffix}
        </p>
        <p className="text-white/50 text-xs mt-2 font-medium">{sub}</p>
      </div>
    </div>
  );
}
