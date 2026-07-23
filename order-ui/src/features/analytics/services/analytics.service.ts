import type { AnalyticsKPI, RevenueData, ChannelData, TopItem, HeatmapData } from '@/types/analytics';
import { DollarSign, BarChart3, Clock, Percent } from "lucide-react";

export const analyticsService = {
    getKPIs: async (): Promise<AnalyticsKPI[]> => {
        return [
            { label: "Total Revenue", value: "$24,850.00", trend: "12.5%", isPositive: true, icon: DollarSign as any },
            { label: "Total Orders", value: "1,204", trend: "8.2%", isPositive: true, icon: BarChart3 as any },
            { label: "Avg Delivery Time", value: "32 mins", trend: "4 mins", isPositive: false, icon: Clock as any },
            { label: "Cancellation Rate", value: "1.2%", trend: "Stable", isPositive: true, icon: Percent as any }
        ];
    },
    getRevenue: async (): Promise<RevenueData[]> => {
        return [
            { day: "Mon", revenue: 1200 },
            { day: "Tue", revenue: 2100 },
            { day: "Wed", revenue: 1800 },
            { day: "Thu", revenue: 2400 },
            { day: "Fri", revenue: 3800 },
            { day: "Sat", revenue: 4500 },
            { day: "Sun", revenue: 4100 },
        ];
    },
    getChannels: async (): Promise<ChannelData[]> => {
        return [
            { name: "WhatsApp Orders", value: 45, color: "#10b981" },
            { name: "Web Storefront", value: 35, color: "#3b82f6" },
            { name: "POS/Walk-in", value: 20, color: "#f59e0b" },
        ];
    },
    getTopItems: async (): Promise<TopItem[]> => {
        return [
            {
                id: 1,
                name: "Truffle Burger",
                units: 342,
                trend: "+12%",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=150&h=150"
            },
            {
                id: 2,
                name: "Spicy Chicken Sandwich",
                units: 280,
                trend: "+5%",
                image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=150&h=150"
            },
            {
                id: 3,
                name: "Sweet Potato Fries",
                units: 210,
                trend: "-2%",
                image: "https://images.unsplash.com/photo-1576107248386-b4850ce721c5?auto=format&fit=crop&q=80&w=150&h=150"
            }
        ];
    },
    getHeatmap: async (): Promise<HeatmapData[]> => {
        return [
            { time: "11 AM", intensity: 30 },
            { time: "12 PM", intensity: 90 },
            { time: "1 PM", intensity: 75 },
            { time: "6 PM", intensity: 60 },
            { time: "7 PM", intensity: 100 },
            { time: "8 PM", intensity: 85 },
        ];
    }
};