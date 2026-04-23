import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  sidebarCollapsed?: boolean;
}

const pageMap: Record<string, { icon: string }> = {
  "/": { icon: "ri-dashboard-3-line" },
  "/statistics": { icon: "ri-bar-chart-2-line" },
  "/ai-assistant": { icon: "ri-sparkling-2-line" },
  "/students": { icon: "ri-group-line" },
  "/teachers": { icon: "ri-user-star-line" },
  "/users": { icon: "ri-shield-user-line" },
  "/attendance": { icon: "ri-calendar-check-line" },
  "/inventory": { icon: "ri-archive-drawer-line" },
  "/id-cards": { icon: "ri-id-card-line" },
  "/reports": { icon: "ri-file-chart-line" },
  "/settings": { icon: "ri-settings-4-line" },
  "/finance": { icon: "ri-money-dollar-circle-line" },
  "/events": { icon: "ri-calendar-event-line" },
  "/grades": { icon: "ri-medal-line" },
  "/timetable": { icon: "ri-time-line" },
  "/homework": { icon: "ri-book-2-line" },
  "/classes": { icon: "ri-building-4-line" },
  "/notifications": { icon: "ri-notification-3-line" },
  "/hr-payroll": { icon: "ri-team-line" },
  "/accounts": { icon: "ri-bank-line" },
};

export default function TopBar({ title = "Dashboard", subtitle, sidebarCollapsed }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const page = pageMap[location.pathname] || { icon: "ri-dashboard-3-line" };

  return (
    <header
      className={`h-16 flex items-center px-6 gap-4 fixed top-0 right-0 z-20 border-b border-slate-100 transition-all duration-300 ${sidebarCollapsed ? "left-[72px]" : "left-[240px]"}`}
      style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <i className={`${page.icon} text-violet-600 text-base`}></i>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-extrabold text-slate-800 leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Quick nav icons */}
      <div className="hidden lg:flex items-center gap-1">
        <Link to="/students" className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <i className="ri-group-line text-sm"></i>
        </Link>
        <Link to="/attendance" className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <i className="ri-calendar-check-line text-sm"></i>
        </Link>
        <Link to="/reports" className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <i className="ri-file-chart-line text-sm"></i>
        </Link>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 w-52 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
        <i className="ri-search-line text-slate-400 text-sm flex-shrink-0"></i>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything…"
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1 min-w-0"
        />
      </div>

      {/* Notifications */}
      <button
        onClick={() => navigate("/notifications")}
        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer relative"
      >
        <i className="ri-notification-3-line text-base"></i>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
      </button>

      {/* User */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => navigate("/settings")}
      >
        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-xs font-bold group-hover:ring-2 group-hover:ring-violet-300 transition-all">
          ON
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-extrabold text-slate-800 leading-tight">Oscar Nyavor</p>
          <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
        </div>
        <i className="ri-arrow-down-s-line text-slate-400 text-sm hidden md:block"></i>
      </div>
    </header>
  );
}
