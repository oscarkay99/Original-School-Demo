import { useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import { canAccessRoute, normalizeRole } from "@/lib/access";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  sidebarCollapsed?: boolean;
  onOpenSidebar?: () => void;
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
  "/parents": { icon: "ri-parent-line" },
  "/meetings": { icon: "ri-vidicon-line" },
};

const searchablePages = [
  { path: "/", label: "Dashboard" },
  { path: "/students", label: "Students" },
  { path: "/teachers", label: "Teachers" },
  { path: "/parents", label: "Parents" },
  { path: "/attendance", label: "Attendance" },
  { path: "/grades", label: "Grades" },
  { path: "/classes", label: "Classes" },
  { path: "/timetable", label: "Timetable" },
  { path: "/homework", label: "Homework" },
  { path: "/events", label: "Events" },
  { path: "/meetings", label: "Meetings" },
  { path: "/notifications", label: "Notifications" },
  { path: "/reports", label: "Reports" },
  { path: "/finance", label: "Finance" },
  { path: "/accounts", label: "Accounts" },
  { path: "/hr-payroll", label: "HR & Payroll" },
  { path: "/inventory", label: "Inventory" },
  { path: "/statistics", label: "Statistics" },
  { path: "/ai-assistant", label: "AI Assistant" },
  { path: "/settings", label: "Settings" },
];

export default function TopBar({ title = "Dashboard", subtitle, sidebarCollapsed, onOpenSidebar }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserRole, currentUserName } = useSchoolData();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const role = normalizeRole(currentUserRole);
  const initials = currentUserName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
  const quickLinks = [
    { path: "/students", icon: "ri-group-line" },
    { path: "/attendance", icon: "ri-calendar-check-line" },
    { path: "/reports", icon: "ri-file-chart-line" },
  ].filter((item) => canAccessRoute(role, item.path));
  const visibleSearchPages = useMemo(
    () => searchablePages.filter((item) => canAccessRoute(role, item.path)),
    [role]
  );
  const filteredSearchPages = visibleSearchPages.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.path.toLowerCase().includes(search.toLowerCase())
  );

  const page = pageMap[location.pathname] || { icon: "ri-dashboard-3-line" };

  return (
    <header
      className={`h-16 flex items-center px-4 md:px-6 gap-3 md:gap-4 fixed top-0 right-0 z-20 border-b border-slate-100 transition-all duration-300 left-0 md:${sidebarCollapsed ? "left-[72px]" : "left-[240px]"}`}
      style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}
    >
      <button
        onClick={onOpenSidebar}
        className="md:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer flex-shrink-0"
      >
        <i className="ri-menu-line text-base"></i>
      </button>

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
        {quickLinks.map((item) => (
          <Link key={item.path} to={item.path} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <i className={`${item.icon} text-sm`}></i>
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="hidden md:block relative">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 w-52 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
        <i className="ri-search-line text-slate-400 text-sm flex-shrink-0"></i>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredSearchPages[0]) {
              navigate(filteredSearchPages[0].path);
              setSearch("");
              setSearchOpen(false);
            }
          }}
          placeholder="Search pages…"
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1 min-w-0"
        />
      </div>
        {searchOpen && (
          <div className="absolute top-full mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            {filteredSearchPages.length > 0 ? (
              filteredSearchPages.slice(0, 6).map((item) => (
                <button
                  key={item.path}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    navigate(item.path);
                    setSearch("");
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <i className={`${pageMap[item.path]?.icon ?? "ri-arrow-right-line"} text-violet-600 text-sm`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.path}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-xs text-slate-400">No matching pages</p>
            )}
          </div>
        )}
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
      <button
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => navigate(canAccessRoute(role, "/settings") ? "/settings" : "/")}
      >
        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-xs font-bold group-hover:ring-2 group-hover:ring-violet-300 transition-all">
          {initials}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-extrabold text-slate-800 leading-tight">{currentUserName}</p>
          <p className="text-[10px] text-slate-400 font-medium">{role}</p>
        </div>
        <i className="ri-arrow-down-s-line text-slate-400 text-sm hidden md:block"></i>
      </button>
    </header>
  );
}
