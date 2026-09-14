import type { ElementType } from "react";
import type { OrderChannel } from "@/types/orders";
import type { MenuItem } from "@/types/menu";

// ── Action Contracts ─────────────────────────────────────────────────────────

export interface ActionCard {
  icon: ElementType;
  label: string;
  description: string;
  to?: string;
  copyValue?: string;
  accent: string;
  iconBg: string;
}

// ── Dashboard Data Contracts ────────────────────────────────────────────────

export interface ChannelCount {
  channel: OrderChannel;
  count: number;
}

export interface HomeSnapshot {
  snapshotDate: string;
  channelCounts: ChannelCount[];
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
}

export interface HomeDashboardData {
  snapshot: HomeSnapshot;
  kitchenBacklogCount: number;
  lowStockItems: MenuItem[];
}
