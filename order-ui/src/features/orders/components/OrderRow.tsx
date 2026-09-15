import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Order } from "@/types/orders";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import { StatusBadge } from "./StatusBadge";
import { ItemCountBadge } from "./ItemCountBadge";
import { ActionButton } from "./ActionButton";

export function OrderRow({ order, onView, onEdit, onDelete }: { order: Order; onView: () => void; onEdit: () => void; onDelete: () => void }) {
    const { t } = useTranslation("orders");
    const { formatCurrency, formatDate } = useFormat();
    return (
        <div className="orders-table-row grid grid-cols-[1fr_1.2fr_0.8fr_0.7fr_0.8fr_0.7fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-slate-50/80 transition-colors group">
            <span className="font-mono text-sm font-medium text-slate-700 truncate">{order.id}</span>
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{order.customerName}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{order.channel}{order.table ? ` · ${order.table}` : order.fulfillment ? ` · ${order.fulfillment}` : ""}</p>
            </div>
            <ItemCountBadge items={order.items} />
            <span className="text-sm text-slate-500 font-mono text-[13px]">{formatDate(order.createdAt)}</span>
            <span className="text-sm font-semibold text-slate-800 font-mono">{formatCurrency(order.total)}</span>
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionButton icon={Eye} label={t("row.viewAction")} onClick={onView} />
                <ActionButton icon={Pencil} label={t("row.editAction")} onClick={onEdit} />
                <ActionButton icon={Trash2} label={t("row.cancelAction")} onClick={onDelete} danger />
            </div>
        </div>
    );
}