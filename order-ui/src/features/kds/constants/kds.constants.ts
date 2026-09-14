import type { Order, OrderStatus } from "@/types/orders";

export const KDS_POLLING_INTERVAL = 5000;

export function getTicketChannelLabel(order: Pick<Order, "channel" | "fulfillment">): "DINE-IN" | "DELIVERY" | "PICKUP" {
    if (order.channel === "Dine-in") return "DINE-IN";
    return (order.fulfillment ?? "Pickup").toUpperCase() as "DELIVERY" | "PICKUP";
}

export const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
    New: { label: "Start Preparing", next: "Preparing" },
    Preparing: { label: "Mark Ready", next: "Ready" },
    Ready: { label: "Complete Order", next: "Completed" },
};
