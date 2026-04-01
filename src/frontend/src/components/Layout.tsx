import {
  Bell,
  BookOpen,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { SessionData } from "../hooks/useSession";
import type { AppRole } from "../types";
import { getRoleName } from "../types";

interface NavItem {
  icon: ReactNode;
  label: string;
  id: string;
}

interface Props {
  session: SessionData;
  children: ReactNode;
  activeNav: string;
  onNavChange: (id: string) => void;
  onLogout: () => void;
}

function getNavItems(role: AppRole): NavItem[] {
  if ("teacher" in role) {
    return [
      {
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        id: "dashboard",
      },
      {
        icon: <FileText size={18} />,
        label: "My Requisitions",
        id: "requisitions",
      },
      { icon: <PlusCircle size={18} />, label: "New Requisition", id: "new" },
    ];
  }
  if ("authority" in role) {
    return [
      {
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        id: "dashboard",
      },
      { icon: <ClipboardList size={18} />, label: "Pending", id: "pending" },
      { icon: <FileText size={18} />, label: "All Requisitions", id: "all" },
      { icon: <PlusCircle size={18} />, label: "New Requisition", id: "new" },
    ];
  }
  if ("adminStaff" in role) {
    return [
      {
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        id: "dashboard",
      },
      { icon: <CheckSquare size={18} />, label: "Approved", id: "approved" },
      { icon: <FileText size={18} />, label: "All Requisitions", id: "all" },
    ];
  }
  return [];
}

export function Layout({
  session,
  children,
  activeNav,
  onNavChange,
  onLogout,
}: Props) {
  const navItems = getNavItems(session.role);
  const roleName = getRoleName(session.role);
  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className="sidebar-gradient w-64 flex-shrink-0 flex flex-col shadow-lg"
        data-ocid="layout.panel"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shadow-sm">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight font-display">
              SchoolReq
            </span>
            <p className="text-white/60 text-[10px]">MSB Institute</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-3 mb-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                activeNav === item.id
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/20">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {session.name}
              </p>
              <p className="text-white/50 text-[10px] truncate">{roleName}</p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white text-sm transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-border flex items-center justify-between px-6 h-14 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground font-display">
              {roleName} Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">
                {session.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {roleName}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
