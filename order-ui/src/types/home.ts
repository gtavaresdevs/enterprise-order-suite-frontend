import type { OrderChannel } from "@/types/orders";
import type { MenuItem } from "@/types/menu";

// ── Dashboard Data Contracts ────────────────────────────────────────────────

export interface ChannelCount {
  channel: OrderChannel;
  count: number;
}

export type ActiveStatus = "New" | "Preparing" | "Ready";

export interface StatusCount {
  status: ActiveStatus;
  count: number;
}

export interface EarningsPeriod {
  revenue: number;
  orders: number;
  /** % change vs the previous equivalent period; null when there is nothing to compare against. */
  deltaPct: number | null;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface HomeEarnings {
  today: EarningsPeriod;
  week: EarningsPeriod;
  month: EarningsPeriod;
  /** Last 7 days ending on the snapshot date, oldest first. */
  trend: DailyRevenue[];
}

export interface HomeDashboardData {
  snapshotDate: string;
  earnings: HomeEarnings;
  channelCounts: ChannelCount[];
  statusCounts: StatusCount[];
  kitchenBacklogCount: number;
  lowStockItems: MenuItem[];
}
