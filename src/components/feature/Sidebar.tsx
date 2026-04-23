import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: "ri-dashboard-3-line", path: "/" },
      { label: "Statistics", icon: "ri-bar-chart-box-line", path: "/statistics" },
      { label: "AI Assistant", icon: "ri-sparkling-2-line", path: "/ai-assistant", badge: "NEW" },
    ],
  },
  {
    title: "ACADEMIC",
    items: [
      { label: "Students", icon: "ri-user-3-line", path: "/students" },
      { label: "Teachers", icon: "ri-user-star-line", path: "/teachers" },
      { label: "Classes", icon: "ri-building-4-line", path: "/classes" },
      { label: "Timetable", icon: "ri-time-line", path: "/timetable" },
      { label: "Homework", icon: "ri-book-2-line", path: "/homework" },
      { label: "Grades", icon: "ri-medal-line", path: "/grades" },
      { label: "Attendance", icon: "ri-calendar-check-line", path: "/attendance" },
      { label: "ID Cards", icon: "ri-id-card-line", path: "/id-cards" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Users", icon: "ri-shield-user-line", path: "/users" },
      { label: "Events", icon: "ri-calendar-event-line", path: "/events" },
      { label: "Notifications", icon: "ri-notification-3-line", path: "/notifications", badge: 4 },
      { label: "Reports", icon: "ri-file-chart-line", path: "/reports" },
    ],
  },
  {
    title: "FINANCE & OPS",
    items: [
      { label: "Finance", icon: "ri-money-dollar-circle-line", path: "/finance" },
      { label: "Accounts", icon: "ri-bank-line", path: "/accounts" },
      { label: "HR & Payroll", icon: "ri-team-line", path: "/hr-payroll" },
      { label: "Inventory", icon: "ri-archive-drawer-line", path: "/inventory" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", icon: "ri-settings-4-line", path: "/settings" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    OVERVIEW: true,
    ACADEMIC: true,
    ADMINISTRATION: true,
    "FINANCE & OPS": true,
    SYSTEM: true,
  });

  const toggleSection = (title: string) => {
    if (collapsed) return;
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[240px]"}`}
      style={{ background: "linear-gradient(180deg, #1a1040 0%, #0f0a2e 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-white/[0.07] flex-shrink-0 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"}`}>
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-violet-500/30">
          <img
            src="https://public.readdy.ai/ai/img_res/8977dd17-b6c0-4d52-b401-1db8661d886f.png"
            alt="EduManage Pro"
            className="w-full h-full object-cover"
          />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight truncate">EduManage Pro</p>
            <p className="text-violet-400 text-[9px] font-bold tracking-[0.18em] uppercase truncate">School Management</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
          >
            <i className="ri-menu-fold-line text-sm"></i>
          </button>
        )}
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <i className="ri-menu-unfold-line text-sm"></i>
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {navSections.map((section) => {
          const isExpanded = expandedSections[section.title] !== false;
          return (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-4 py-1.5 cursor-pointer group"
                >
                  <span className="text-[9px] font-bold text-white/25 tracking-[0.2em] uppercase">{section.title}</span>
                  <i className={`${isExpanded ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-white/20 text-xs`}></i>
                </button>
              )}
              {collapsed && <div className="mx-3 my-1.5 h-px bg-white/[0.06]"></div>}

              {(isExpanded || collapsed) && (
                <div className={`${collapsed ? "px-2" : "px-2"} space-y-0.5`}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 cursor-pointer group relative
                        ${collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2"}
                        ${isActive
                          ? "bg-violet-600/25 text-violet-300"
                          : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-violet-400"></span>
                          )}
                          <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? "text-violet-400" : "text-white/40 group-hover:text-white/70"}`}>
                            <i className={`${item.icon} text-base`}></i>
                          </span>
                          {!collapsed && (
                            <>
                              <span className={`text-[13px] font-medium flex-1 text-left whitespace-nowrap ${isActive ? "text-violet-300" : ""}`}>
                                {item.label}
                              </span>
                              {item.badge !== undefined && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeof item.badge === "string" ? "bg-violet-500/20 text-violet-400" : "bg-rose-500/20 text-rose-400"}`}>
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                          {collapsed && item.badge !== undefined && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`border-t border-white/[0.07] flex-shrink-0 ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex items-center gap-2.5 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-all ${collapsed ? "p-2 justify-center" : "p-2"}`}
          onClick={() => navigate("/settings")}
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 flex-shrink-0">
            <span className="text-white text-xs font-bold">ON</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Oscar Nyavor</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <p className="text-white/35 text-[10px] truncate">Administrator · Online</p>
              </div>
            </div>
          )}
          {!collapsed && <i className="ri-more-2-line text-white/25 text-sm flex-shrink-0"></i>}
        </div>
      </div>
    </aside>
  );
}
