import { NavLink, useNavigate } from "react-router-dom";
import { Layers, Settings, ChevronRight, User, Bell, Sliders, LogOut } from "lucide-react";
import { NAVIGATION_ITEMS } from "./navigation";
import { useState } from "react";

const ACCOUNT_NAV = [
  { to: "/profile",       label: "View Profile",    icon: User         },
  { to: "/notifications", label: "Notifications",   icon: Bell         },
  { to: "/preferences",   label: "Preferences",     icon: Sliders      },
  { to: "/settings",      label: "Settings",        icon: Settings     },
];

function UserChip({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function go(path: string) {
    setOpen(false);
    navigate(path);
    if (onNavigate) onNavigate();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full mt-2 flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-slate-600">AW</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold text-slate-700 truncate leading-none">Alex Watson</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Enterprise · Admin</p>
        </div>
        <ChevronRight className={`w-3 h-3 text-slate-400 flex-shrink-0 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-1.5 w-full bg-white rounded-[8px] border border-slate-200 shadow-lg shadow-slate-900/10 z-20 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-700">Alex Watson</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">a.watson@enterprise.io</p>
            </div>
            <div className="py-1">
              {ACCOUNT_NAV.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => go(to)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {label}
                </button>
              ))}
            </div>
            <div className="py-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setOpen(false);
                  localStorage.removeItem("accessToken");
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
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
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-slate-950 flex items-center justify-center flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-slate-100" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-none truncate">Enterprise</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wide uppercase">Order Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
        {NAVIGATION_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
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
                <span className="flex-1 truncate">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Account section */}
        <div className="pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Account</p>
          {ACCOUNT_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
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
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
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
  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 border-r border-slate-100 z-10 bg-white">
      <SidebarContent />
    </aside>
  );
}