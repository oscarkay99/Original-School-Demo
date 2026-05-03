import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import { downloadCsv } from "@/lib/download";

const reportTypes = [
  { id: "academic", label: "Academic Performance", icon: "ri-bar-chart-2-line", gradient: "from-slate-500 to-slate-600", desc: "GPA trends, subject performance, top performers" },
  { id: "attendance", label: "Attendance Report", icon: "ri-calendar-check-line", gradient: "from-slate-500 to-slate-600", desc: "Daily, weekly, monthly attendance summaries" },
  { id: "finance", label: "Financial Report", icon: "ri-money-dollar-circle-line", gradient: "from-slate-500 to-slate-600", desc: "Fee collection, outstanding balances, expenses" },
  { id: "inventory", label: "Inventory Report", icon: "ri-archive-drawer-line", gradient: "from-slate-500 to-slate-600", desc: "Stock levels, asset valuation, reorder alerts" },
];

export default function ReportsPage() {
  const { students, attendanceData, financeData, inventoryItems } = useSchoolData();
  const [activeReport, setActiveReport] = useState("academic");
  const avgGpa = students.length
    ? (students.reduce((a, b) => a + b.gpa, 0) / students.length).toFixed(2)
    : "0.00";
  const avgAttendance = students.length
    ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / students.length)
    : 0;

  const exportActiveReport = () => {
    if (activeReport === "academic") {
      downloadCsv(
        "academic-report.csv",
        ["Student", "Grade", "GPA", "Attendance"],
        [...students].sort((a, b) => b.gpa - a.gpa).map((s) => [s.name, s.grade, s.gpa, `${s.attendance}%`]),
      );
      return;
    }

    if (activeReport === "attendance") {
      downloadCsv(
        "attendance-report.csv",
        ["Date", "Present", "Absent", "Late", "Total"],
        attendanceData.map((d) => [d.date, d.present, d.absent, d.late, d.total]),
      );
      return;
    }

    if (activeReport === "finance") {
      downloadCsv(
        "finance-report.csv",
        ["Category", "Collected", "Target", "Percentage"],
        financeData.feeBreakdown.map((item) => [item.category, item.collected, item.amount, `${item.percentage}%`]),
      );
      return;
    }

    downloadCsv(
      "inventory-report.csv",
      ["Item", "Category", "Quantity", "Min Stock", "Status", "Value"],
      inventoryItems.map((item) => [item.name, item.category, item.quantity, item.minStock, item.status, item.value]),
    );
  };

  return (
    <AppLayout title="Reports" subtitle="Generate and view comprehensive school reports">
      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              activeReport === r.id
                ? "border-slate-800 bg-slate-900 shadow-lg scale-105"
                : "border-slate-100 bg-white hover:-translate-y-0.5"
            }`}
            style={{}}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${r.gradient} mb-3`}>
              <i className={`${r.icon} text-white text-base`}></i>
            </div>
            <p className={`text-sm font-bold leading-tight ${activeReport === r.id ? "text-white" : "text-slate-800"}`}>{r.label}</p>
            <p className={`text-xs mt-1 leading-relaxed ${activeReport === r.id ? "text-white/60" : "text-slate-400"}`}>{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {activeReport === "academic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-slate-800 text-sm">GPA Distribution</p>
              <button onClick={exportActiveReport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-medium cursor-pointer">
                <i className="ri-download-line text-sm"></i>Export
              </button>
            </div>
            <div className="space-y-3">
              {[
                { range: "3.5 - 4.0 (Excellent)", count: students.filter((s) => s.gpa >= 3.5).length, color: "from-emerald-400 to-teal-500" },
                { range: "3.0 - 3.4 (Good)", count: students.filter((s) => s.gpa >= 3.0 && s.gpa < 3.5).length, color: "from-cyan-400 to-sky-500" },
                { range: "2.5 - 2.9 (Average)", count: students.filter((s) => s.gpa >= 2.5 && s.gpa < 3.0).length, color: "from-amber-400 to-orange-500" },
                { range: "Below 2.5 (Needs Help)", count: students.filter((s) => s.gpa < 2.5).length, color: "from-rose-400 to-pink-500" },
              ].map((item) => (
                <div key={item.range}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-600">{item.range}</p>
                    <p className="text-xs font-bold text-slate-700">{item.count} students</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${students.length ? (item.count / students.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>{avgGpa}</p>
                <p className="text-xs text-slate-500 mt-0.5">School Average GPA</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>{students.filter((s) => s.gpa >= 3.5).length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Excellent Performers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Student Performance Table</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...students].sort((a, b) => b.gpa - a.gpa).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.grade}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{s.gpa}</p>
                    <p className="text-xs text-slate-400">{s.attendance}% att.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Weekly Attendance Summary</p>
            <div className="space-y-4">
              {attendanceData.map((d) => {
                const pct = d.total ? Math.round((d.present / d.total) * 100) : 0;
                return (
                  <div key={d.date}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-slate-700">{new Date(d.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 font-semibold">{d.present} present</span>
                        <span className="text-rose-500 font-semibold">{d.absent} absent</span>
                        <span className="font-bold text-slate-700">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 90 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : pct >= 75 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-700">{avgAttendance}%</p>
                  <p className="text-xs text-emerald-500">Avg Rate</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-rose-600">{students.filter((s) => s.attendance < 80).length}</p>
                  <p className="text-xs text-rose-400">At Risk</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-700">{students.filter((s) => s.attendance === 100).length}</p>
                  <p className="text-xs text-amber-500">Perfect</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Individual Attendance</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...students].sort((a, b) => b.attendance - a.attendance).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                    <span className="text-slate-600 text-xs font-bold">{s.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${s.attendance >= 90 ? "bg-emerald-400" : s.attendance >= 80 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${s.attendance}%` }}></div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 80 ? "text-amber-600" : "text-rose-500"}`}>{s.attendance}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReport === "finance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Revenue Overview</p>
            <div className="space-y-4">
              {financeData.feeBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-slate-700">{item.category}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-600 font-semibold">GH₵{item.collected.toLocaleString()}</span>
                      <span className="text-slate-400">/ GH₵{item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.percentage >= 60 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : item.percentage >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Financial Summary</p>
            <div className="space-y-3">
              {[
                { label: "Total Expected Revenue", value: `GH₵${financeData.totalRevenue.toLocaleString()}`, color: "text-slate-800" },
                { label: "Amount Collected", value: `GH₵${financeData.collected.toLocaleString()}`, color: "text-emerald-600" },
                { label: "Outstanding Balance", value: `GH₵${financeData.outstanding.toLocaleString()}`, color: "text-rose-500" },
                { label: "Total Expenses", value: `GH₵${financeData.expenses.toLocaleString()}`, color: "text-amber-600" },
                { label: "Net Position", value: `GH₵${(financeData.collected - financeData.expenses).toLocaleString()}`, color: "text-emerald-700" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                  <p className="text-sm text-slate-600">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReport === "inventory" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="font-semibold text-slate-800 text-sm mb-4">Inventory Status Report</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "In Stock", count: inventoryItems.filter((item) => item.status === "In Stock").length, gradient: "from-teal-500 to-teal-600" },
                { label: "Low Stock", count: inventoryItems.filter((item) => item.status === "Low Stock").length, gradient: "from-slate-500 to-slate-600" },
                { label: "Critical", count: inventoryItems.filter((item) => item.status === "Critical").length, gradient: "from-slate-700 to-slate-800" },
              ].map((s) => (
              <div key={s.label} className={`rounded-xl p-4 text-center bg-gradient-to-br ${s.gradient}`}>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.count}</p>
                <p className="text-white/80 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center">Detailed inventory report available for download</p>
          <div className="flex justify-center mt-3">
            <button onClick={exportActiveReport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold cursor-pointer hover:opacity-90 shadow-md">
              <i className="ri-download-line"></i>
              Download Full Report
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
