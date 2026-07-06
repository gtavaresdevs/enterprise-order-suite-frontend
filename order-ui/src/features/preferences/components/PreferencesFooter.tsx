import { Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreferencesFooterProps {
    isSaved: boolean;
    onSave: () => void;
}

export function PreferencesFooter({ isSaved, onSave }: PreferencesFooterProps) {
    return (
        <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-mono">
                Preferences are applied immediately after saving.
            </p>
            <Button
                onClick={onSave}
                className={`gap-2 h-9 px-5 rounded-[8px] text-sm font-semibold border shadow-inner transition-all active:scale-[0.98] ${isSaved
                        ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                        : "bg-slate-950 text-slate-50 border-slate-800 hover:bg-slate-800"
                    }`}
            >
                {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? "Saved!" : "Save Preferences"}
            </Button>
        </div>
    );
}