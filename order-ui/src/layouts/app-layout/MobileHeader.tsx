import { Menu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex lg:hidden flex-shrink-0 items-center h-16 px-4 bg-white border-b border-slate-200">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 -ml-2 shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2.5 ml-2">
        <div className="w-7 h-7 rounded-[8px] bg-blue-600 flex items-center justify-center shrink-0">
          <Layers className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Order Suite
        </span>
      </div>
    </header>
  );
}