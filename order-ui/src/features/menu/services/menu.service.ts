import type { MenuItem } from "@/types/menu";
import { MENU_ITEMS } from "../constants/menu.constants";

let items: MenuItem[] = [...MENU_ITEMS];

export const menuService = {
    getMenuItems: async (): Promise<MenuItem[]> => {
        // TODO: connect-backend — GET /api/v1/menu-items
        return new Promise((resolve) => setTimeout(() => resolve([...items]), 300));
    },

    createMenuItem: async (item: Omit<MenuItem, "id">): Promise<MenuItem> => {
        // TODO: connect-backend — POST /api/v1/menu-items
        return new Promise((resolve) => {
            const newItem: MenuItem = { ...item, id: `m-${Math.random().toString(36).slice(2, 9)}` };
            items = [...items, newItem];
            setTimeout(() => resolve(newItem), 400);
        });
    },

    updateMenuItem: async (item: MenuItem): Promise<MenuItem> => {
        // TODO: connect-backend — PATCH /api/v1/menu-items/{id}
        return new Promise((resolve) => {
            items = items.map((i) => (i.id === item.id ? item : i));
            setTimeout(() => resolve(item), 300);
        });
    },

    deleteMenuItem: async (id: string): Promise<void> => {
        // TODO: connect-backend — DELETE /api/v1/menu-items/{id}
        return new Promise((resolve) => {
            items = items.filter((i) => i.id !== id);
            setTimeout(resolve, 300);
        });
    },
};
