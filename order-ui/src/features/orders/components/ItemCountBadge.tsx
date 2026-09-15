import { useTranslation } from "react-i18next";
import type { OrderLine } from "@/types/orders";

export function ItemCountBadge({ items }: { items: OrderLine[] }) {
    const { t } = useTranslation("orders");
    const totalQty = items.reduce((s, p) => s + p.quantity, 0);
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm text-slate-800 font-medium">{t("itemCount.items", { count: items.length })}</span>
            <span className="text-xs text-slate-400 font-mono">{t("itemCount.units", { count: totalQty })}</span>
        </div>
    );
}