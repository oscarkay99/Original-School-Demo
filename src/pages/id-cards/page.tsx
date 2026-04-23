import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { students } from "@/mocks/schoolData";

const avatarColors = ["bg-teal-600", "bg-slate-600", "bg-stone-500", "bg-cyan-700", "bg-slate-700", "bg-teal-700", "bg-slate-500"];

export default function IDCardsPage() {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [previewStudent, setPreviewStudent] = useState<typeof students[0] | null>(null);

  const filtered = students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(filtered.length === selected.length ? [] : filtered.map((s) => s.id));
  };

  return (
    <AppLayout title="ID Cards" subtitle="Generate and print student identity cards">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all w-52"
            />
          </div>
          <button onClick={selectAll} className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer transition-all whitespace-nowrap">
            {selected.length === filtered.length ? "Deselect All" : "Select All"}
          </button>
          {selected.length > 0 && (
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-2 rounded-xl font-medium">
              {selected.length} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={selected.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 cursor-pointer whitespace-nowrap transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="ri-printer-line text-sm"></i>
            Print Selected
          </button>
          <button
            disabled={selected.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="ri-download-line text-sm"></i>
            Download PDF
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((s, i) => {
          const isSelected = selected.includes(s.id);
          const avatarBg = avatarColors[i % avatarColors.length];
          return (
            <div
              key={s.id}
              className={`relative cursor-pointer transition-all duration-200 ${isSelected ? "scale-[0.97]" : "hover:-translate-y-0.5"}`}
              onClick={() => toggleSelect(s.id)}
            >
              {/* Selection indicator */}
              <div className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-teal-500 border-teal-500" : "bg-white border-slate-300"}`}>
                {isSelected && <i className="ri-check-line text-white text-xs"></i>}
              </div>

              {/* ID Card */}
              <div className={`rounded-xl overflow-hidden border-2 transition-all ${isSelected ? "border-teal-400" : "border-slate-200"}`}>
                {/* Card header */}
                <div className="bg-slate-900 px-3 py-2 flex items-center gap-2">
                  <img src="https://public.readdy.ai/ai/img_res/6d13ccf5-6ba9-4236-9071-542996229d05.png" alt="logo" className="w-5 h-5 object-contain" />
                  <div>
                    <p className="text-white text-[9px] font-bold leading-tight">EduManage Pro</p>
                    <p className="text-white/40 text-[8px] leading-tight">STUDENT ID</p>
                  </div>
                </div>
                {/* Card body */}
                <div className="bg-white px-3 py-3">
                  <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold text-sm">{s.avatar}</span>
                  </div>
                  <p className="text-center text-xs font-bold text-slate-800 leading-tight">{s.name}</p>
                  <p className="text-center text-[10px] text-slate-400 mt-0.5">{s.grade}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-center text-[9px] text-slate-400">ID: EDU-2025-{String(s.id).padStart(4, "0")}</p>
                    <p className="text-center text-[9px] text-slate-400">Valid: 2025/26</p>
                  </div>
                </div>
                {/* Card footer */}
                <div className="bg-teal-600 px-3 py-1.5">
                  <p className="text-center text-white text-[9px] font-medium">Excellence in Education</p>
                </div>
              </div>

              {/* Preview button */}
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewStudent(s); }}
                className="mt-1.5 w-full py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
              >
                Preview
              </button>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="font-bold text-slate-800 text-sm">ID Card Preview</p>
              <button onClick={() => setPreviewStudent(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-56 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg">
                <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
                  <img src="https://public.readdy.ai/ai/img_res/6d13ccf5-6ba9-4236-9071-542996229d05.png" alt="logo" className="w-7 h-7 object-contain" />
                  <div>
                    <p className="text-white text-xs font-bold">EduManage Pro</p>
                    <p className="text-white/40 text-[10px]">STUDENT IDENTITY CARD</p>
                  </div>
                </div>
                <div className="bg-white px-4 py-5">
                  <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">{previewStudent.avatar}</span>
                  </div>
                  <p className="text-center font-bold text-slate-800">{previewStudent.name}</p>
                  <p className="text-center text-xs text-slate-400 mt-0.5">{previewStudent.grade}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Student ID</span>
                      <span className="font-semibold text-slate-700">EDU-2025-{String(previewStudent.id).padStart(4, "0")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Parent</span>
                      <span className="font-semibold text-slate-700">{previewStudent.parent}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Valid Until</span>
                      <span className="font-semibold text-slate-700">July 2026</span>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-600 px-4 py-2">
                  <p className="text-center text-white text-xs font-medium">Excellence in Education</p>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Print</button>
              <button className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap">Download</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
