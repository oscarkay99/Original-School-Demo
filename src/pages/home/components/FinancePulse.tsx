import { financeData } from "@/mocks/schoolData";

export default function FinancePulse() {
  const pct = Math.round((financeData.collected / financeData.totalRevenue) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Pulse</p>
          <p className="text-sm text-slate-500 mt-0.5">Fee collection at a glance</p>
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100">
          <i className="ri-money-dollar-circle-line text-slate-500 text-base"></i>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium">Collected</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            GH₵{financeData.collected.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium">Outstanding</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            GH₵{financeData.outstanding.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500">Collection Progress</p>
          <p className="text-xs font-bold text-slate-700">{pct}%</p>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Target: GH₵{financeData.totalRevenue.toLocaleString()}</p>
      </div>

      <div className="space-y-2">
        {financeData.feeBreakdown.slice(0, 3).map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <p className="text-xs text-slate-600 flex-1 truncate">{item.category}</p>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-400"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs font-semibold text-slate-700 w-8 text-right">{item.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
