import { useMemo } from "react";
import type { Order } from "@/types/orders";

export interface ProductionSummaryItem {
    name: string;
    qty: number;
}

export function useKdsSummary(orders: Order[]): ProductionSummaryItem[] {
    return useMemo(() => {
        const totals = new Map<string, number>();
        orders.forEach((order) => {
            order.items.forEach((item) => {
                totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity);
            });
        });
        return Array.from(totals, ([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
    }, [orders]);
}
