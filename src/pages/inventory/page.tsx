import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "In Stock": { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  "Low Stock": { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  Critical: { bg: "bg-rose-100", text: "text-rose-600", dot: "bg-rose-400" },
};

const categoryGradients: Record<string, string> = {
  Books: "from-slate-500 to-slate-600",
  Equipment: "from-slate-500 to-slate-600",
  Electronics: "from-slate-500 to-slate-600",
  Stationery: "from-slate-500 to-slate-600",
  Furniture: "from-slate-500 to-slate-600",
  Health: "from-slate-500 to-slate-600",
};

export default function InventoryPage() {
  const { inventoryItems, addInventoryItem } = useSchoolData();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    quantity: "",
    minimumStock: "",
    unitValue: "",
    category: "Books",
  });

  const workingItems = inventoryItems.filter((item) => !removedItemIds.includes(item.id));
  const categories = ["All", ...Array.from(new Set(workingItems.map((i) => i.category)))];
  const filtered = workingItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || item.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalValue = workingItems.reduce((a, b) => a + b.value, 0);
  const lowStock = workingItems.filter((i) => i.status === "Low Stock" || i.status === "Critical").length;

  const handleSubmit = async () => {
    if (!form.itemName || !form.quantity || !form.minimumStock) return;
    setSubmitting(true);
    try {
      await addInventoryItem(form);
      setForm({ itemName: "", quantity: "", minimumStock: "", unitValue: "", category: "Books" });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = workingItems.find((item) => item.id === selectedItemId) ?? null;

  return (
    <AppLayout title="Inventory" subtitle="Track school assets and supplies">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Items", value: inventoryItems.length, icon: "ri-archive-drawer-line" },
          { label: "Total Value", value: `GH₵${totalValue.toLocaleString()}`, icon: "ri-money-dollar-circle-line" },
          { label: "Low / Critical", value: lowStock, icon: "ri-error-warning-line" },
          { label: "Categories", value: categories.length - 1, icon: "ri-folder-line" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0">
              <i className={`${m.icon} text-slate-500 text-base`}></i>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{m.label}</p>
              <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-sm"></i>
            Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Item", "Category", "Quantity", "Min Stock", "Value", "Status", "Last Updated", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => {
                const cfg = statusConfig[item.status];
                const grad = categoryGradients[item.category] || "from-slate-400 to-slate-500";
                const stockPct = Math.min(100, Math.round((item.quantity / (item.minStock * 2)) * 100));
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br ${grad} flex-shrink-0`}>
                          <i className="ri-archive-drawer-line text-white text-xs"></i>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{item.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.status === "In Stock" ? "bg-emerald-400" : item.status === "Low Stock" ? "bg-amber-400" : "bg-rose-400"}`}
                            style={{ width: `${stockPct}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{item.quantity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{item.minStock}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">GH₵{item.value.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{item.lastUpdated}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setSelectedItemId(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button onClick={() => setRemovedItemIds((prev) => [...prev, item.id])} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-500 cursor-pointer">
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Add Inventory Item</p>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "itemName", label: "Item Name", placeholder: "e.g. Textbooks - Science", type: "text" },
                { key: "quantity", label: "Quantity", placeholder: "e.g. 50", type: "number" },
                { key: "minimumStock", label: "Minimum Stock Level", placeholder: "e.g. 20", type: "number" },
                { key: "unitValue", label: "Unit Value (GH₵)", placeholder: "e.g. 50", type: "number" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 transition-all bg-slate-50 focus:bg-white" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 transition-all bg-slate-50 cursor-pointer">
                  {Object.keys(categoryGradients).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap disabled:opacity-50">{submitting ? "Saving..." : "Add Item"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800">Inventory Item</p>
              <button onClick={() => setSelectedItemId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ["Item", selectedItem.name],
                ["Category", selectedItem.category],
                ["Quantity", selectedItem.quantity],
                ["Min Stock", selectedItem.minStock],
                ["Value", `GH₵${selectedItem.value.toLocaleString()}`],
                ["Status", selectedItem.status],
                ["Last Updated", selectedItem.lastUpdated],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
