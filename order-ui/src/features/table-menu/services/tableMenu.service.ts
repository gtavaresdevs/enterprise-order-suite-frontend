import { menuService } from "@/features/menu/services/menu.service";
import { tablesService } from "@/features/tables/services/tables.service";
import type { MenuItem } from "@/types/menu";
import type { Table } from "@/types/tables";

export const tableMenuService = {
    getPublicMenu: async (): Promise<MenuItem[]> => {
        const items = await menuService.getMenuItems();
        return items.filter((item) => item.available);
    },

    getTable: async (tableId: string): Promise<Table | null> => {
        // TODO: connect-backend — needs a PUBLIC GET /api/v1/tables/{id}; do NOT wire this
        // to the admin GET /api/v1/tables, this route is unauthenticated.
        const tables = await tablesService.getTables();
        return tables.find((t) => t.id === tableId) ?? null;
    },
};
