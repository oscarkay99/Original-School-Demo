import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { downloadCsv } from "@/lib/download";

const accounts = [
  { id: 1, name: "Main School Account", bank: "Ghana Commercial Bank", accountNo: "****4521", balance: 45200, type: "Current", lastTx: "2026-04-22" },
  { id: 2, name: "Fees Collection Account", bank: "Ecobank Ghana", accountNo: "****8834", balance: 18000, type: "Savings", lastTx: "2026-04-21" },
  { id: 3, name: "Payroll Account", bank: "Stanbic Bank", accountNo: "****2267", balance: 26840, type: "Current", lastTx: "2026-04-20" },
  { id: 4, name: "Petty Cash", bank: "Cash on Hand", accountNo: "—", balance: 1500, type: "Cash", lastTx: "2026-04-23" },
];

const transactions = [
  { id: 1, description: "Term 2 Tuition — Ama Owusu", account: "Fees Collection", amount: 2000, type: "Credit", date: "2026-04-22", ref: "TXN-001" },
  { id: 2, description: "Electricity Bill — April", account: "Main School Account", amount: 850, type: "Debit", date: "2026-04-21", ref: "TXN-002" },
  { id: 3, description: "Term 2 Tuition — Akosua Boateng", account: "Fees Collection", amount: 2000, type: "Credit", date: "2026-04-20", ref: "TXN-003" },
  { id: 4, description: "Staff Salaries — April", account: "Payroll Account", amount: 26840, type: "Debit", date: "2026-04-20", ref: "TXN-004" },
  { id: 5, description: "Stationery Purchase", account: "Petty Cash", amount: 320, type: "Debit", date: "2026-04-19", ref: "TXN-005" },
  { id: 6, description: "Term 2 Tuition — Abena Darko", account: "Fees Collection", amount: 1500, type: "Credit", date: "2026-04-18", ref: "TXN-006" },
  { id: 7, description: "Internet Subscription", account: "Main School Account", amount: 450, type: "Debit", date: "2026-04-17", ref: "TXN-007" },
  { id: 8, description: "Lab Equipment Purchase", account: "Main School Account", amount: 3200, type: "Debit", date: "2026-04-15", ref: "TXN-008" },
];

const accountGradients = [
  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  "linear-gradient(135deg, #059669 0%, #047857 100%)",
  "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
];

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<"accounts" | "transactions">("accounts");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const totalBalance = accounts.reduce((a, b) => a + b.balance, 0);
  const totalCredits = transactions.filter((t) => t.type === "Credit").reduce((a, b) => a + b.amount, 0);
  const totalDebits = transactions.filter((t) => t.type === "Debit").reduce((a, b) => a + b.amount, 0);
  const filteredTransactions = selectedAccount
    ? transactions.filter((t) => t.account === selectedAccount)
    : transactions;

  const exportTransactions = () => {
    downloadCsv(
      "account-transactions.csv",
      ["Ref", "Description", "Account", "Amount", "Type", "Date"],
      filteredTransactions.map((t) => [t.ref, t.description, t.account, t.amount, t.type, t.date]),
    );
  };

  return (
    <AppLayout title="Accounts" subtitle="Bank accounts, balances and transaction ledger">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Balance", value: `GH₵${totalBalance.toLocaleString()}`, icon: "ri-bank-line", bg: "bg-violet-50", color: "text-violet-600" },
          { label: "Accounts", value: accounts.length, icon: "ri-wallet-3-line", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Total Credits", value: `GH₵${totalCredits.toLocaleString()}`, icon: "ri-arrow-down-circle-line", bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Total Debits", value: `GH₵${totalDebits.toLocaleString()}`, icon: "ri-arrow-up-circle-line", bg: "bg-rose-50", color: "text-rose-600" },
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
        {(["accounts", "transactions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "accounts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc, i) => (
            <div
              key={acc.id}
              onClick={() => {
                setSelectedAccount(acc.name === "Fees Collection Account" ? "Fees Collection" : acc.name === "Main School Account" ? "Main School Account" : acc.name === "Payroll Account" ? "Payroll Account" : "Petty Cash");
                setActiveTab("transactions");
              }}
              className="rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              style={{ background: accountGradients[i % accountGradients.length] }}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 bg-white blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-white text-sm">{acc.name}</p>
                    <p className="text-xs text-white/60 mt-0.5">{acc.bank}</p>
                  </div>
                  <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">{acc.type}</span>
                </div>
                <p className="text-2xl font-extrabold text-white mb-1">GH₵{acc.balance.toLocaleString()}</p>
                <p className="text-xs text-white/50 mb-4">Account: {acc.accountNo}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <p className="text-xs text-white/50">Last tx: {acc.lastTx}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAccount(acc.name === "Fees Collection Account" ? "Fees Collection" : acc.name === "Main School Account" ? "Main School Account" : acc.name === "Payroll Account" ? "Payroll Account" : "Petty Cash");
                      setActiveTab("transactions");
                    }}
                    className="text-xs text-white font-semibold hover:text-white/80 cursor-pointer"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Transaction Ledger</p>
              {selectedAccount && <p className="text-xs text-slate-400 mt-1">Filtered by {selectedAccount}</p>}
            </div>
            <button onClick={exportTransactions} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer whitespace-nowrap transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              <i className="ri-download-line text-sm"></i>Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Ref", "Description", "Account", "Amount", "Type", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{t.ref}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{t.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{t.account}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${t.type === "Credit" ? "text-emerald-600" : "text-rose-500"}`}>
                        {t.type === "Credit" ? "+" : "-"}GH₵{t.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.type === "Credit" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
