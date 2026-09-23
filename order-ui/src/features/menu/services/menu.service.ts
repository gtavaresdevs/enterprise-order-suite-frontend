import type { MenuItem } from "@/types/menu";
import { CATEGORIES, MENU_ITEMS } from "../constants/menu.constants";

let items: MenuItem[] = [...MENU_ITEMS];
let categories: string[] = [...CATEGORIES];

export const menuService = {
    getMenuItems: async (): Promise<MenuItem[]> => {
        // TODO: connect-backend — GET /api/v1/menu-items
        return new Promise((resolve) => setTimeout(() => resolve([...items]), 300));
    },

    getCategories: async (): Promise<string[]> => {
        // TODO: connect-backend — GET /api/v1/menu-categories
        return new Promise((resolve) => setTimeout(() => resolve([...categories]), 200));
    },

    createCategory: async (name: string): Promise<string> => {
        // TODO: connect-backend — POST /api/v1/menu-categories
        return new Promise((resolve, reject) => {
            const trimmed = name.trim();
            if (!trimmed) {
                reject(new Error("categoryNameRequired"));
                return;
            }
            if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
                reject(new Error("categoryNameTaken"));
                return;
            }
            categories = [...categories, trimmed];
            setTimeout(() => resolve(trimmed), 300);
        });
    },

    renameCategory: async ({ oldName, newName }: { oldName: string; newName: string }): Promise<string> => {
        // TODO: connect-backend — PATCH /api/v1/menu-categories/{name}
        return new Promise((resolve, reject) => {
            const trimmed = newName.trim();
            if (!trimmed) {
                reject(new Error("categoryNameRequired"));
                return;
            }
            if (trimmed.toLowerCase() !== oldName.toLowerCase() && categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
                reject(new Error("categoryNameTaken"));
                return;
            }
            categories = categories.map((c) => (c === oldName ? trimmed : c));
            items = items.map((i) => (i.category === oldName ? { ...i, category: trimmed } : i));
            setTimeout(() => resolve(trimmed), 300);
        });
    },

    deleteCategory: async (name: string): Promise<void> => {
        // TODO: connect-backend — DELETE /api/v1/menu-categories/{name}
        return new Promise((resolve, reject) => {
            if (items.some((i) => i.category === name)) {
                reject(new Error("categoryInUse"));
                return;
            }
            categories = categories.filter((c) => c !== name);
            setTimeout(resolve, 300);
        });
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
