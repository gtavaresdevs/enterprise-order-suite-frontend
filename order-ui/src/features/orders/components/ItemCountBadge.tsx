import type { ProductLine } from "@/types/orders";

export function ItemCountBadge({ products }: { products: ProductLine[] }) {
    const totalQty = products.reduce((s, p) => s + p.quantity, 0);
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm text-slate-800 font-medium">{products.length} item{products.length !== 1 ? "s" : ""}</span>
            <span className="text-xs text-slate-400 font-mono">{totalQty} unit{totalQty !== 1 ? "s" : ""}</span>
        </div>
    );
}