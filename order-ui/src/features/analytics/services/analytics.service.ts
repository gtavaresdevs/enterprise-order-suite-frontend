import { DollarSign, BarChart3, Calculator, Percent } from "lucide-react";
import { ordersService } from "@/features/orders/services/orders.service";
import { menuService } from "@/features/menu/services/menu.service";
import { CHANNEL_COLORS } from "../constants/analytics.constants";
import type { AnalyticsKPI, RevenueData, ChannelData, TopItem, HeatmapData } from "@/types/analytics";
import type { Order, OrderChannel } from "@/types/orders";

const CHANNELS: OrderChannel[] = ["Online", "Dine-in", "Phone"];

function billable(orders: Order[]): Order[] {
    return orders.filter((o) => o.status !== "Cancelled");
}

export const analyticsService = {
    getKPIs: async (): Promise<AnalyticsKPI[]> => {
        const orders = await ordersService.getOrders();
        const billableOrders = billable(orders);
        const revenue = billableOrders.reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = billableOrders.length > 0 ? revenue / billableOrders.length : 0;
        const cancelledCount = orders.length - billableOrders.length;
        const cancellationRate = orders.length > 0 ? (cancelledCount / orders.length) * 100 : 0;

        return [
            { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, icon: DollarSign },
            { label: "Total Orders", value: String(orders.length), icon: BarChart3 },
            { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, icon: Calculator },
            { label: "Cancellation Rate", value: `${cancellationRate.toFixed(1)}%`, icon: Percent },
        ];
    },
    getRevenue: async (): Promise<RevenueData[]> => {
        const orders = await ordersService.getOrders();
        const byDate = new Map<string, number>();
        for (const order of billable(orders)) {
            byDate.set(order.createdAt, (byDate.get(order.createdAt) ?? 0) + order.total);
        }
        return Array.from(byDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, revenue]) => ({ day, revenue }));
    },
    getChannels: async (): Promise<ChannelData[]> => {
        const orders = await ordersService.getOrders();
        const total = orders.length;
        return CHANNELS.map((channel) => ({
            name: channel,
            value: total > 0 ? Math.round((orders.filter((o) => o.channel === channel).length / total) * 100) : 0,
            color: CHANNEL_COLORS[channel],
        }));
    },
    getTopItems: async (): Promise<TopItem[]> => {
        const [orders, menuItems] = await Promise.all([ordersService.getOrders(), menuService.getMenuItems()]);
        const unitsByMenuItemId = new Map<string, number>();
        for (const order of billable(orders)) {
            for (const line of order.items) {
                unitsByMenuItemId.set(line.menuItemId, (unitsByMenuItemId.get(line.menuItemId) ?? 0) + line.quantity);
            }
        }
        return Array.from(unitsByMenuItemId.entries())
            .map(([menuItemId, units]) => {
                const menuItem = menuItems.find((m) => m.id === menuItemId);
                return menuItem ? { id: menuItem.id, name: menuItem.name, image: menuItem.image, units } : null;
            })
            .filter((item): item is TopItem => item !== null)
            .sort((a, b) => b.units - a.units)
            .slice(0, 5);
    },
    getHeatmap: async (): Promise<HeatmapData[]> => {
        const orders = await ordersService.getOrders();
        const byDate = new Map<string, number>();
        for (const order of orders) {
            byDate.set(order.createdAt, (byDate.get(order.createdAt) ?? 0) + 1);
        }
        const maxCount = Math.max(1, ...byDate.values());
        return Array.from(byDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, count]) => ({ label, intensity: Math.round((count / maxCount) * 100) }));
    },
};