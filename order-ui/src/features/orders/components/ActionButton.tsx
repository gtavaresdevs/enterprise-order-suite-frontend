import React from "react";

export function ActionButton({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
    return (
        <button title={label} onClick={onClick} className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors ${danger ? "text-slate-400 hover:text-red-600 hover:bg-red-50" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}>
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}