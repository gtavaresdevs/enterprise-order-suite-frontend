import type { OrderChannel } from "@/types/orders";

export const CHANNEL_COLORS: Record<OrderChannel, string> = {
  "Online": "#3b82f6",
  "Dine-in": "#10b981",
  "Phone": "#f59e0b",
};

export const REVENUE_CHART_CONFIG = {
  margin: { top: 0, right: 0, left: -20, bottom: 0 },
  xAxisTick: { fontSize: 12, fill: '#64748b' },
  yAxisTick: { fontSize: 12, fill: '#64748b', fontFamily: 'DM Mono' },
};