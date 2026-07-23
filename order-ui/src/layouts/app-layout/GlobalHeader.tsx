import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarDropdown } from "./AvatarDropdown";

export function GlobalHeader() {
  return (
    <header className="hidden lg:flex items-center justify-end h-16 px-6 bg-transparent">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="relative w-9 h-9 rounded-[8px] border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </Button>

        <AvatarDropdown />
      </div>
    </header>
  );
}
