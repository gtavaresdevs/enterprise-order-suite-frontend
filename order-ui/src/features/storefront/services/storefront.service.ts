import { MENU } from "../constants/storefront.constants";
import type { MenuItem } from "@/types/menu";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        // Simulated API delay
        return new Promise((resolve) => setTimeout(() => resolve(MENU), 300));
    }
};