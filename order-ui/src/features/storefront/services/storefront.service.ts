import { MENU } from "../constants/storefront.constants";
import type { MenuItem } from "@/types/storefront";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        // Simulated API delay
        return new Promise((resolve) => setTimeout(() => resolve(MENU), 300));
    }
};