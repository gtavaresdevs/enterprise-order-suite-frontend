import { NavLink } from "react-router-dom";
import { Layers, Settings, ChevronRight } from "lucide-react";
import { NAVIGATION_ITEMS } from "./navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-16 px-6 shrink-0 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-[8px] bg-blue-600 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white uppercase tracking-wide truncate">
            Order Suite
          </p>
        </div>
      </div>

      {/* Navigation Area */}
      {/* ⚠️ Scroll container defines NO padding. Inner <nav> handles it strictly. */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 px-3 py-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {NAVIGATION_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Profile & Settings Area */}
      <div className="shrink-0 p-3 flex flex-col gap-3 border-t border-slate-800/60">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="flex-1 truncate">Settings</span>
        </NavLink>

        {/* User Profile Chip - ShadCN Composed */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer group">
          <Avatar className="w-9 h-9 border border-slate-700 shrink-0 rounded-[8px]">
            <AvatarImage src="" alt="User profile" className="rounded-[8px]" />
            <AvatarFallback className="bg-slate-800 text-xs text-slate-300 font-semibold rounded-[8px]">
              AW
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-200 leading-none truncate group-hover:text-white transition-colors">
              Alex Watson
            </p>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium truncate uppercase tracking-wide">
              Enterprise · Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-800/60 z-10 bg-slate-950">
      <SidebarContent />
    </aside>
  );
}