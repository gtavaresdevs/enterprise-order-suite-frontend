import { ExternalLink } from "lucide-react";
import type { TopItem } from "@/types/analytics";

interface TopItemsListProps {
    items: TopItem[];
}

export const TopItemsList = ({ items }: TopItemsListProps) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900">Top Items</h3>
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
            {items.length === 0 ? (
                <p className="text-sm text-slate-400">No item sales recorded yet.</p>
            ) : (
                items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 -mx-2 hover:bg-slate-50 rounded-[8px] transition-colors">
                        <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{idx + 1}. {item.name}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{item.units} unit{item.units !== 1 ? "s" : ""} sold</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};