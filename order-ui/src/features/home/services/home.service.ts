import { ordersService } from "@/features/orders/services/orders.service";
import { menuService } from "@/features/menu/services/menu.service";
import { LOW_STOCK_THRESHOLD } from "@/features/menu/constants/menu.constants";
import type { HomeDashboardData, ChannelCount } from "@/types/home";
import type { OrderChannel } from "@/types/orders";

const CHANNELS: OrderChannel[] = ["Online", "Dine-in", "Phone"];
const KITCHEN_BACKLOG_STATUSES = new Set(["New", "Preparing"]);

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

    // Order.createdAt is date-only and the mock fixture is fixed in the past
    // (see orders.constants.ts) — "today" is the most recent date actually
    // present in the data, not the real calendar date, or every stat below
    // would read zero against this fixture.
    const snapshotDate = orders.reduce(
      (latest, o) => (o.createdAt > latest ? o.createdAt : latest),
      orders[0]?.createdAt ?? ""
    );
    const todaysOrders = orders.filter((o) => o.createdAt === snapshotDate);

    const channelCounts: ChannelCount[] = CHANNELS.map((channel) => ({
      channel,
      count: todaysOrders.filter((o) => o.channel === channel).length,
    }));

    const billableOrders = todaysOrders.filter((o) => o.status !== "Cancelled");
    const revenue = billableOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = billableOrders.length > 0 ? revenue / billableOrders.length : 0;

    // Kitchen backlog is a right-now concept, not scoped to "today" — it
    // covers every order still in New/Preparing regardless of its date.
    const kitchenBacklogCount = orders.filter((o) => KITCHEN_BACKLOG_STATUSES.has(o.status)).length;

    const lowStockItems = menuItems.filter(
      (item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD
    );

    return {
      snapshot: {
        snapshotDate,
        channelCounts,
        totalOrders: todaysOrders.length,
        revenue,
        avgOrderValue,
      },
      kitchenBacklogCount,
      lowStockItems,
    };
  },
};
