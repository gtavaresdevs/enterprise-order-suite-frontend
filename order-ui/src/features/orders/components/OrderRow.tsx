import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Order } from "@/types/orders";
import { fmt, fmtDate } from "@/features/orders/constants/orders.constants";
import { StatusBadge } from "./StatusBadge";
import { ItemCountBadge } from "./ItemCountBadge";
import { ActionButton } from "./ActionButton";

export function OrderRow({ order, onView, onEdit, onDelete }: { order: Order; onView: () => void; onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.7fr_0.8fr_0.7fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-slate-50/80 transition-colors group">
            <span className="font-mono text-sm font-medium text-slate-700 truncate">{order.id}</span>
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{order.customer}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{order.phone}</p>
            </div>
            <ItemCountBadge products={order.products} />
            <span className="text-sm text-slate-500 font-mono text-[13px]">{fmtDate(order.dateCreated)}</span>
            <span className="text-sm font-semibold text-slate-800 font-mono">{fmt(order.total)}</span>
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionButton icon={Eye} label="View" onClick={onView} />
                <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />
                <ActionButton icon={Trash2} label="Cancel" onClick={onDelete} danger />
            </div>
        </div>
    );
}