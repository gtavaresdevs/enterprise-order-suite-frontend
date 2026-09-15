import { NavLink, useNavigate } from "react-router-dom";
import { Layers, Settings, ChevronRight, User, Bell, Sliders, LogOut } from "lucide-react";
import { NAVIGATION_ITEMS, ADMINISTRATION_ITEMS, type NavItem } from "./navigation";
import { useState, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import { useTranslation } from "react-i18next";
import { useProfileSummary } from "@/features/profile/hooks/useProfileSummary";
import type { Role } from "@/types/auth";

const ACCOUNT_NAV = [
  { to: "/profile",       label: "View Profile",    labelKey: "account.viewProfile", icon: User         },
  { to: "/notifications", label: "Notifications",   labelKey: "nav.notifications",   icon: Bell         },
  { to: "/preferences",   label: "Preferences",     labelKey: "nav.preferences",     icon: Sliders      },
  { to: "/settings",      label: "Settings",        labelKey: "nav.settings",        icon: Settings     },
];

function UserChip({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation("shell");
  const { displayName, email, role, initials } = useProfileSummary();

  function go(path: string) {
    setOpen(false);
    navigate(path);
    if (onNavigate) onNavigate();
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full mt-2 flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-slate-600">{initials}</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold text-slate-700 truncate leading-none">{displayName}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Enterprise · {role}</p>
        </div>
        <ChevronRight className={`w-3 h-3 text-slate-400 flex-shrink-0 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-1.5 w-full bg-white rounded-[8px] border border-slate-200 shadow-lg shadow-slate-900/10 z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-700">{displayName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{email}</p>
            </div>
            <div className="py-1">
              {ACCOUNT_NAV.map(({ to, labelKey, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => go(to)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
            <div className="py-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setOpen(false);
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("role");
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t("account.signOut")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SidebarContentProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function SidebarContent({ onNavigate, collapsed = false }: SidebarContentProps) {
  const { user } = useAuth();
  const { t } = useTranslation("shell");

  const hasAccess = (roles?: Role[]) => {
    if (!roles || !roles.length) return true;
    if (!user) return false;
    return roles.some((role) => user.roles.includes(role));
  };

  const renderNavItem = ({ to, labelKey, icon: Icon, end }: NavItem, collapsed: boolean) => {
    if (!to) return null;
    const label = t(labelKey);
    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm font-medium transition-all group ${
            isActive
              ? "bg-slate-950 text-slate-50 shadow-inner"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600"}`} />
            <span className={`flex-1 truncate ${collapsed ? "sr-only" : ""}`}>{label}</span>
            {isActive && !collapsed && <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card text-foreground">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-slate-950 flex items-center justify-center flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-slate-100" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none truncate">Enterprise</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">Order Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="app-shell-padded flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">{t("nav.navigationSection")}</p>}
        {NAVIGATION_ITEMS.map((item) => renderNavItem(item, collapsed))}

        {/* Administration Section */}
        {ADMINISTRATION_ITEMS.filter(item => hasAccess(item.roles)).map(section => (
          <div key={section.label} className="pt-4">
            {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">{t(section.labelKey)}</p>}
            {section.children?.filter(child => hasAccess(child.roles)).map((item) => renderNavItem(item, collapsed))}
          </div>
        ))}

        {/* Account section */}
        <div className="pt-4">
          {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">{t("nav.accountSection")}</p>}
          {ACCOUNT_NAV.map((item) => renderNavItem(item, collapsed))}
        </div>
      </nav>

      {/* Bottom user chip */}
      <div className="px-3 pb-4 shrink-0">
        <UserChip onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { preferences } = usePreferencesContext();

  const autoCollapsed = useSyncExternalStore(
    (onStoreChange) => {
      if (preferences.sidebarNavigation !== "auto") return () => {};
      const media = window.matchMedia("(max-width: 1280px)");
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => preferences.sidebarNavigation === "auto" && window.matchMedia("(max-width: 1280px)").matches,
    () => false
  );

  const collapsed = preferences.sidebarNavigation === "collapsed"
    || (preferences.sidebarNavigation === "auto" && autoCollapsed);

  return (
    <aside className={`hidden lg:flex flex-col shrink-0 border-r border-border z-10 bg-card transition-[width] duration-200 ${collapsed ? "w-[72px]" : "w-[220px]"}`}>
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}