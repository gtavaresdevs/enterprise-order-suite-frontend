import type { OrderLine } from "@/types/orders";

export function ItemCountBadge({ items }: { items: OrderLine[] }) {
    const totalQty = items.reduce((s, p) => s + p.quantity, 0);
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm text-slate-800 font-medium">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            <span className="text-xs text-slate-400 font-mono">{totalQty} unit{totalQty !== 1 ? "s" : ""}</span>
        </div>
    );
}