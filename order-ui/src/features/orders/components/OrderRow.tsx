import { Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Order } from "@/types/orders";
import { formatCurrency, formatDate } from "@/features/orders/constants/orders.constants";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

interface OrderRowProps {
    order: Order;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function OrderRow({ order, onView, onEdit, onDelete }: OrderRowProps) {
    const hasStockIssue = order.products.some((p) => !p.inStock);
    const totalQty = order.products.reduce((acc, p) => acc + p.quantity, 0);

    return (
        <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50/80 transition-colors group">
            <div className="w-32 flex-shrink-0 flex items-center gap-2">
                {hasStockIssue && (
                    <span title="Stock issues" className="flex-shrink-0 flex items-center">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                    </span>
                )}
                <span className="font-mono text-sm font-medium text-slate-700 truncate">{order.id}</span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                <p className="text-sm font-medium text-slate-800 truncate">{order.customer}</p>
                <p className="text-xs text-slate-400 truncate">{order.company}</p>
            </div>

            <div className="w-32 flex-shrink-0 flex flex-col items-start gap-0.5">
                <span className="text-sm text-slate-800 font-medium">
                    {order.products.length} SKU{order.products.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-slate-400 font-mono">{totalQty} units total</span>
            </div>

            <div className="w-28 flex-shrink-0">
                <span className="text-[13px] text-slate-500 font-mono">{formatDate(order.dateCreated)}</span>
            </div>

            <div className="w-24 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-800 font-mono">{formatCurrency(order.total)}</span>
            </div>

            <div className="w-32 flex-shrink-0">
                <StatusBadge status={order.status} />
            </div>

            <div className="w-28 flex-shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={onView} title="View order">
                    <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={onEdit} title="Edit order">
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={onDelete} title="Delete order">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}