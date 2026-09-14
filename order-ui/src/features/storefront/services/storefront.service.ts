import { menuService } from "@/features/menu/services/menu.service";
import type { MenuItem } from "@/types/menu";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        return menuService.getMenuItems();
    }
};
