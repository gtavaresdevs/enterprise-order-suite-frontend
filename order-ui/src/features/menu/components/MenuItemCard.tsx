import { Pencil, Trash2, SlidersHorizontal, Boxes } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { LOW_STOCK_THRESHOLD } from "../constants/menu.constants";
import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
    onToggleAvailable: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailable }: MenuItemCardProps) {
    const hasAddons = item.addons && item.addons.length > 0;
    const formatPrice = (n: number) => `$${n.toFixed(2)}`;
    const lowStock = item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD;

    return (
        <div className={`group bg-white rounded-[8px] border overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-slate-900/8 hover:-translate-y-0.5 ${item.available ? "border-slate-100" : "border-slate-100 opacity-70"}`}>
            <div className="relative overflow-hidden bg-slate-100 h-44 flex-shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-slate-700 hover:bg-white shadow-md transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-red-500 hover:bg-white shadow-md transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                {!item.available && (
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm">
                        86'd
                    </div>
                )}
                {item.available && lowStock && (
                    <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm">
                        Low stock
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm border border-white/50">
                    {item.category}
                </div>
            </div>

            <div className="flex flex-col flex-1 p-4">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 font-outfit">
                        {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {item.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="font-mono text-base font-semibold text-slate-900">
                        {formatPrice(item.price)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {hasAddons && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-[8px]">
                                <SlidersHorizontal className="w-2.5 h-2.5" />
                                {item.addons!.length} addon{item.addons!.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-[8px]">
                            <Boxes className="w-2.5 h-2.5" />
                            {item.stockQuantity}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500">{item.available ? "Available" : "86'd"}</span>
                    <Switch checked={item.available} onCheckedChange={() => onToggleAvailable(item)} />
                </div>
            </div>
        </div>
    );
}
