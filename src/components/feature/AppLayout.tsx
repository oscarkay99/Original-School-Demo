import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <TopBar
        title={title}
        subtitle={subtitle}
        sidebarCollapsed={collapsed}
        onOpenSidebar={() => setMobileOpen(true)}
      />
      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${collapsed ? "md:ml-[72px]" : "md:ml-[240px]"}`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
