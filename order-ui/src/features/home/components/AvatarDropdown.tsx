import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User, Bell, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all outline-none">
          <Avatar className="w-7 h-7 rounded-[8px] flex-shrink-0">
            <AvatarFallback className="text-xs font-semibold text-slate-600 bg-slate-200">
              AW
            </AvatarFallback>
          </Avatar>

          <div className="text-left hidden sm:block space-y-0.5">
            <p className="text-xs font-semibold text-slate-700 leading-none">
              Alex Watson
            </p>
            <p className="text-[10px] text-slate-400 leading-none">
              Enterprise Admin
            </p>
          </div>

          <ChevronRight
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-[8px] border border-slate-200 shadow-lg shadow-slate-900/10 p-0 overflow-hidden"
      >
        <div className="px-3 py-2.5 bg-white">
          <p className="text-xs font-semibold text-slate-700">Alex Watson</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            a.watson@enterprise.io
          </p>
        </div>

        <DropdownMenuSeparator className="m-0 bg-slate-100" />

        <div className="py-1 bg-white">
          <DropdownMenuItem
            onClick={() => handleNavigate("/profile")}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            View Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleNavigate("/notifications")}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            Notifications
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleNavigate("/preferences")}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            Preferences
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="m-0 bg-slate-100" />

        <div className="py-1 bg-white">
          <DropdownMenuItem
            onClick={() => handleNavigate("/login")}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}