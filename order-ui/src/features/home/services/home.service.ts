import { ordersService } from "@/features/orders/services/orders.service";
import { menuService } from "@/features/menu/services/menu.service";
import { LOW_STOCK_THRESHOLD } from "@/features/menu/constants/menu.constants";
import type {
  HomeDashboardData,
  ChannelCount,
  StatusCount,
  EarningsPeriod,
  ActiveStatus,
} from "@/types/home";
import type { Order, OrderChannel } from "@/types/orders";

const CHANNELS: OrderChannel[] = ["Online", "Dine-in", "Phone"];
const ACTIVE_STATUSES: ActiveStatus[] = ["New", "Preparing", "Ready"];
const DAY_MS = 86_400_000;

// createdAt is a date-only ISO string, so all period math is done on "YYYY-MM-DD" strings in UTC.
const addDays = (iso: string, days: number) =>
  new Date(Date.parse(iso) + days * DAY_MS).toISOString().slice(0, 10);

const monthOf = (iso: string, offset = 0) => {
  const d = new Date(Date.parse(iso));
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1)).toISOString().slice(0, 7);
};

const sum = (orders: Order[]) => orders.reduce((total, o) => total + o.total, 0);

function period(current: Order[], previous: Order[]): EarningsPeriod {
  const revenue = sum(current);
  const before = sum(previous);
  return {
    revenue,
    orders: current.length,
    deltaPct: before > 0 ? ((revenue - before) / before) * 100 : null,
  };
}

export const homeService = {
  /**
   * Composes orders + menu data into one dashboard snapshot, the same
   * cross-feature composition pattern features/table-menu's service uses.
   */
  getHomeDashboardData: async (): Promise<HomeDashboardData> => {
    const [orders, menuItems] = await Promise.all([
      ordersService.getOrders(),
      menuService.getMenuItems(),
    ]);

    // ponytail: "today" is the newest date in the data, not the calendar date — the mock
    // fixture is fixed in the past and would read zero otherwise. Swap for
    // new Date().toISOString().slice(0, 10) once orders come from the real backend.
    const snapshotDate = orders.reduce(
      (latest, o) => (o.createdAt > latest ? o.createdAt : latest),
      orders[0]?.createdAt ?? ""
    );

    const billable = orders.filter((o) => o.status !== "Cancelled");
    const between = (from: string, to: string) =>
      billable.filter((o) => o.createdAt > from && o.createdAt <= to);

    const yesterday = addDays(snapshotDate, -1);
    const weekStart = addDays(snapshotDate, -7);
    const prevWeekStart = addDays(snapshotDate, -14);

    const earnings = {
      today: period(
        billable.filter((o) => o.createdAt === snapshotDate),
        billable.filter((o) => o.createdAt === yesterday)
      ),
      week: period(between(weekStart, snapshotDate), between(prevWeekStart, weekStart)),
      month: period(
        billable.filter((o) => o.createdAt.startsWith(monthOf(snapshotDate))),
        billable.filter((o) => o.createdAt.startsWith(monthOf(snapshotDate, -1)))
      ),
      trend: Array.from({ length: 7 }, (_, i) => {
        const date = addDays(snapshotDate, i - 6);
        return { date, revenue: sum(billable.filter((o) => o.createdAt === date)) };
      }),
    };

    const todaysOrders = orders.filter((o) => o.createdAt === snapshotDate);
    const channelCounts: ChannelCount[] = CHANNELS.map((channel) => ({
      channel,
      count: todaysOrders.filter((o) => o.channel === channel).length,
    }));

    // Status counts are a right-now concept, not scoped to "today".
    const statusCounts: StatusCount[] = ACTIVE_STATUSES.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    const kitchenBacklogCount = statusCounts
      .filter((s) => s.status !== "Ready")
      .reduce((total, s) => total + s.count, 0);

    const lowStockItems = menuItems.filter(
      (item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD
    );

    return { snapshotDate, earnings, channelCounts, statusCounts, kitchenBacklogCount, lowStockItems };
  },
};
