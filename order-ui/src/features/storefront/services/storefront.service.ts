import { menuService } from "@/features/menu/services/menu.service";
import type { MenuItem } from "@/types/menu";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        const items = await menuService.getMenuItems();
        return items.filter((item) => item.available);
    }
};
