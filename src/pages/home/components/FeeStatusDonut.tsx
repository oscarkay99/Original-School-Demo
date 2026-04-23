import { useState } from "react";
import { students } from "@/mocks/schoolData";

export default function FeeStatusDonut() {
  const paid = students.filter((s) => s.fees === "Paid").length;
  const pending = students.filter((s) => s.fees === "Pending").length;
  const overdue = students.filter((s) => s.fees === "Overdue").length;
  const total = students.length;

  const paidPct = Math.round((paid / total) * 100);
  const pendingPct = Math.round((pending / total) * 100);
  const overduePct = Math.round((overdue / total) * 100);

  const segments = [
    { label: "Paid", count: paid, pct: paidPct, color: "#14b8a6", bg: "bg-teal-500" },
    { label: "Pending", count: pending, pct: pendingPct, color: "#f59e0b", bg: "bg-amber-400" },
    { label: "Overdue", count: overdue, pct: overduePct, color: "#f43f5e", bg: "bg-rose-500" },
  ];

  const [hovered, setHovered] = useState<number | null>(null);

  // SVG donut
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const dash = (seg.pct / 100) * circumference;
    const gap = circumference - dash;
    const arc = { ...seg, dash, gap, offset, index: i };
    offset += dash;
    return arc;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fee Status</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">Current Term</p>
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-50">
          <i className="ri-pie-chart-2-line text-teal-600 text-base"></i>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={hovered === arc.index ? 17 : 14}
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={-arc.offset + circumference * 0.25}
                strokeLinecap="round"
                style={{ transition: "stroke-width 0.2s", cursor: "pointer", opacity: hovered !== null && hovered !== arc.index ? 0.4 : 1 }}
                onMouseEnter={() => setHovered(arc.index)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" className="text-slate-800" style={{ fontSize: 18, fontWeight: 700, fill: "#1e293b" }}>
              {hovered !== null ? segments[hovered].pct : paidPct}%
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 9, fill: "#94a3b8" }}>
              {hovered !== null ? segments[hovered].label : "Paid"}
            </text>
          </svg>
        </div>

        <div className="flex-1 space-y-2.5">
          {segments.map((seg, i) => (
            <div
              key={seg.label}
              className="flex items-center gap-2 cursor-pointer group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${seg.bg}`}></span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{seg.label}</p>
                  <p className="text-xs font-bold text-slate-700">{seg.count}</p>
                </div>
                <div className="h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${seg.bg} transition-all duration-500`} style={{ width: `${seg.pct}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
