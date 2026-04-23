import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { financeData } from "@/mocks/schoolData";

const statusColors: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-rose-100 text-rose-600",
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "fees">("overview");

  return (
    <AppLayout title="Finance" subtitle="Track revenue, fees, and financial health">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: `GH₵${financeData.totalRevenue.toLocaleString()}`, icon: "ri-money-dollar-circle-line", sub: "2025/26 Academic Year" },
          { label: "Collected", value: `GH₵${financeData.collected.toLocaleString()}`, icon: "ri-checkbox-circle-line", sub: `${Math.round((financeData.collected / financeData.totalRevenue) * 100)}% of target` },
          { label: "Outstanding", value: `GH₵${financeData.outstanding.toLocaleString()}`, icon: "ri-error-warning-line", sub: "Pending collection" },
          { label: "Expenses", value: `GH₵${financeData.expenses.toLocaleString()}`, icon: "ri-shopping-cart-line", sub: "This term" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100">
                <i className={`${m.icon} text-slate-500 text-base`}></i>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{m.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>{m.value}</p>
            <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-white rounded-xl p-1 border border-slate-100 w-fit">
        {(["overview", "transactions", "fees"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "bg-teal-600 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Monthly Revenue vs Expenses</p>
            <div className="flex items-end gap-4 h-40">
              {financeData.monthlyData.map((d) => {
                const maxVal = 10000;
                const revH = Math.round((d.revenue / maxVal) * 100);
                const expH = Math.round((d.expenses / maxVal) * 100);
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-1" style={{ height: "120px" }}>
                      <div className="flex-1 rounded-t-lg bg-teal-500 transition-all" style={{ height: `${revH}%` }} title={`Revenue: GH₵${d.revenue}`}></div>
                      <div className="flex-1 rounded-t-lg bg-slate-200 transition-all" style={{ height: `${expH}%` }} title={`Expenses: GH₵${d.expenses}`}></div>
                    </div>
                    <p className="text-xs text-slate-400">{d.month}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-teal-500 inline-block"></span>Revenue</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block"></span>Expenses</span>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Fee Collection Breakdown</p>
            <div className="space-y-4">
              {financeData.feeBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-slate-700">{item.category}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">GH₵{item.collected.toLocaleString()} / GH₵{item.amount.toLocaleString()}</p>
                      <span className={`text-xs font-bold ${item.percentage >= 60 ? "text-emerald-600" : item.percentage >= 40 ? "text-amber-600" : "text-rose-500"}`}>{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-700"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="font-semibold text-slate-800 text-sm">Recent Transactions</p>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold cursor-pointer whitespace-nowrap hover:bg-teal-700 transition-all">
              <i className="ri-add-line text-sm"></i>
              Record Payment
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Student", "Amount", "Type", "Date", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {financeData.recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200">
                        <span className="text-slate-600 text-xs font-bold">{t.student.split(" ").map((n) => n[0]).join("")}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{t.student}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold text-teal-600">GH₵{t.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{t.type}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{t.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[t.status]}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Fee Structure 2025/26</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financeData.feeBreakdown.map((item) => (
              <div key={item.category} className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-800 text-sm">{item.category}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.percentage >= 60 ? "bg-emerald-100 text-emerald-700" : item.percentage >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"}`}>{item.percentage}%</span>
                </div>
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>GH₵{item.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Total fee per student</p>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">GH₵{item.collected.toLocaleString()} collected</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
