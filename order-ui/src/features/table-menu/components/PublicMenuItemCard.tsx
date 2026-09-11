import type { MenuItem } from "@/types/menu";

export function PublicMenuItemCard({ item }: { item: MenuItem }) {
    return (
        <div className="w-full bg-white rounded-[8px] border border-slate-100 overflow-hidden flex gap-3">
            <div className="flex-1 p-4 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug font-outfit">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-sm font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                </div>
            </div>
            <div className="w-24 h-24 flex-shrink-0 self-center mr-3">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[8px]" />
            </div>
        </div>
    );
}
