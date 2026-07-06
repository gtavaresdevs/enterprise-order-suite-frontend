import { Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types/inventory";

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const hasModifiers = product.modifiers && product.modifiers.length > 0;
    const formatPrice = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div className={`group bg-white rounded-[8px] border overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-slate-900/8 hover:-translate-y-0.5 ${product.available ? "border-slate-100" : "border-slate-100 opacity-70"}`}>
            {/* Image Overlay Header */}
            <div className="relative overflow-hidden bg-slate-100 h-44 flex-shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                {/* Actions - Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(product)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-slate-700 hover:bg-white shadow-md transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-red-500 hover:bg-white shadow-md transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Badges */}
                {!product.available && (
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm">
                        Unavailable
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm border border-white/50">
                    {product.category}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col flex-1 p-4">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 font-outfit">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {product.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="font-mono text-base font-semibold text-slate-900">
                        {formatPrice(product.basePrice)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {hasModifiers && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-[8px]">
                                <SlidersHorizontal className="w-2.5 h-2.5" />
                                {product.modifiers.length} mod{product.modifiers.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">
                            {product.id}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}