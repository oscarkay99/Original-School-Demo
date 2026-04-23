import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";

const staffPayroll = [
  { id: 1, name: "Mr. Samuel Agyei", role: "Mathematics Teacher", department: "Academic", salary: 3200, allowances: 450, deductions: 320, net: 3330, status: "Paid", payDate: "2026-04-25", avatar: "SA", leaveBalance: 12 },
  { id: 2, name: "Mrs. Grace Asiedu", role: "English Teacher", department: "Academic", salary: 3500, allowances: 500, deductions: 350, net: 3650, status: "Paid", payDate: "2026-04-25", avatar: "GA", leaveBalance: 8 },
  { id: 3, name: "Mr. Daniel Osei", role: "Science Teacher", department: "Academic", salary: 3000, allowances: 400, deductions: 300, net: 3100, status: "Pending", payDate: "2026-04-30", avatar: "DO", leaveBalance: 15 },
  { id: 4, name: "Ms. Patricia Adu", role: "Social Studies Teacher", department: "Academic", salary: 3100, allowances: 420, deductions: 310, net: 3210, status: "Paid", payDate: "2026-04-25", avatar: "PA", leaveBalance: 10 },
  { id: 5, name: "Mr. Emmanuel Boadu", role: "ICT Teacher", department: "Academic", salary: 2900, allowances: 380, deductions: 290, net: 2990, status: "On Leave", payDate: "2026-04-30", avatar: "EB", leaveBalance: 3 },
  { id: 6, name: "Mrs. Comfort Nyarko", role: "French Teacher", department: "Academic", salary: 3300, allowances: 460, deductions: 330, net: 3430, status: "Paid", payDate: "2026-04-25", avatar: "CN", leaveBalance: 14 },
  { id: 7, name: "Kwame Boateng", role: "Accountant", department: "Finance", salary: 2800, allowances: 350, deductions: 280, net: 2870, status: "Paid", payDate: "2026-04-25", avatar: "KB", leaveBalance: 11 },
  { id: 8, name: "Ama Serwaa", role: "Secretary", department: "Admin", salary: 2200, allowances: 280, deductions: 220, net: 2260, status: "Pending", payDate: "2026-04-30", avatar: "AS", leaveBalance: 9 },
];

const statusConfig: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  "On Leave": "bg-slate-100 text-slate-500",
};

export default function HRPayrollPage() {
  const [activeTab, setActiveTab] = useState<"payroll" | "leave" | "summary">("payroll");
  const totalPayroll = staffPayroll.reduce((a, b) => a + b.net, 0);
  const paid = staffPayroll.filter((s) => s.status === "Paid").reduce((a, b) => a + b.net, 0);
  const pending = staffPayroll.filter((s) => s.status === "Pending").reduce((a, b) => a + b.net, 0);

  return (
    <AppLayout title="HR & Payroll" subtitle="Staff management, salaries and leave tracking">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Staff", value: staffPayroll.length, icon: "ri-team-line", bg: "bg-violet-50", color: "text-violet-600" },
          { label: "Total Payroll", value: `GH₵${totalPayroll.toLocaleString()}`, icon: "ri-money-dollar-circle-line", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Paid This Month", value: `GH₵${paid.toLocaleString()}`, icon: "ri-checkbox-circle-line", bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Pending", value: `GH₵${pending.toLocaleString()}`, icon: "ri-time-line", bg: "bg-rose-50", color: "text-rose-600" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${m.bg} flex-shrink-0`}>
              <i className={`${m.icon} ${m.color} text-base`}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100 w-fit mb-4">
        {(["payroll", "leave", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "payroll" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm">April 2026 Payroll</p>
              <p className="text-xs text-slate-400 mt-0.5">Pay period: April 1 – April 30, 2026</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              <i className="ri-download-line text-sm"></i>Export Payslips
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Staff Member", "Role", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Status", "Pay Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffPayroll.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 flex-shrink-0">
                          <span className="text-violet-700 text-xs font-bold">{s.avatar}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{s.role}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">GH₵{s.salary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600">+GH₵{s.allowances}</td>
                    <td className="px-4 py-3 text-sm text-rose-500">-GH₵{s.deductions}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">GH₵{s.net.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[s.status]}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{s.payDate}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={5} className="px-4 py-3 text-sm font-bold text-slate-700">Total Payroll</td>
                  <td className="px-4 py-3 text-sm font-bold text-violet-600">GH₵{totalPayroll.toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === "leave" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-semibold text-slate-800 text-sm">Leave Balances &amp; Requests</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Staff Member", "Department", "Leave Balance", "Used", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffPayroll.map((s) => {
                  const used = 21 - s.leaveBalance;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 flex-shrink-0">
                            <span className="text-violet-700 text-xs font-bold">{s.avatar}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{s.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{s.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(s.leaveBalance / 21) * 100}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{s.leaveBalance} days</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{used} days</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-violet-600 font-medium hover:text-violet-700 cursor-pointer">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Department Payroll Breakdown</p>
            <div className="space-y-4">
              {[
                { dept: "Academic", count: 6, total: staffPayroll.filter((s) => s.department === "Academic").reduce((a, b) => a + b.net, 0) },
                { dept: "Finance", count: 1, total: staffPayroll.filter((s) => s.department === "Finance").reduce((a, b) => a + b.net, 0) },
                { dept: "Admin", count: 1, total: staffPayroll.filter((s) => s.department === "Admin").reduce((a, b) => a + b.net, 0) },
              ].map((d) => (
                <div key={d.dept}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{d.dept}</p>
                      <p className="text-xs text-slate-400">{d.count} staff</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">GH₵{d.total.toLocaleString()}</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(d.total / totalPayroll) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="font-semibold text-slate-800 text-sm mb-4">Payroll Summary</p>
            <div className="space-y-3">
              {[
                { label: "Total Basic Salaries", value: `GH₵${staffPayroll.reduce((a, b) => a + b.salary, 0).toLocaleString()}` },
                { label: "Total Allowances", value: `+GH₵${staffPayroll.reduce((a, b) => a + b.allowances, 0).toLocaleString()}` },
                { label: "Total Deductions", value: `-GH₵${staffPayroll.reduce((a, b) => a + b.deductions, 0).toLocaleString()}` },
                { label: "Net Payroll", value: `GH₵${totalPayroll.toLocaleString()}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                  <p className="text-sm text-slate-600">{item.label}</p>
                  <p className={`text-sm font-bold ${item.label.includes("Net") ? "text-violet-600" : "text-slate-800"}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
