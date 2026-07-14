import { Star, Plus } from "lucide-react";
import type { MenuItem } from "@/types/storefront";

export const MenuCard = ({ item, onSelect }: { item: MenuItem; onSelect: () => void }) => {
    return (
        <button
            onClick={onSelect}
            className="w-full text-left bg-white rounded-[8px] border border-slate-100 overflow-hidden flex gap-3 hover:shadow-md hover:shadow-slate-900/8 hover:border-slate-200 transition-all active:scale-[0.99]"
        >
            <div className="flex-1 p-4 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-sm font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{item.rating}
                    </span>
                </div>
            </div>
            <div className="w-24 h-24 flex-shrink-0 relative self-center mr-3">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[8px]" />
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center shadow-md">
                    <Plus className="w-3 h-3 text-white" />
                </div>
            </div>
        </button>
    );
};