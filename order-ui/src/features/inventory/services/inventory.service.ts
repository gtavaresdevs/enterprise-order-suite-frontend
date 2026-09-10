import type { MenuItem } from "@/types/menu";
import { MOCK_PRODUCTS } from "../constants/inventory.constants";

export const inventoryService = {
    getProducts: async (): Promise<MenuItem[]> => {
        // TODO: Connect real backend endpoint when ready
        // const { data } = await api.get('/api/v1/products');
        // return data;

        // Simulating network delay for realistic state testing
        return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PRODUCTS]), 400));
    },

    createProduct: async (product: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
        // const { data } = await api.post('/api/v1/products', product);
        // return data;

        return new Promise((resolve) => {
            const newProduct = {
                ...product,
                id: `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
            } as MenuItem;
            setTimeout(() => resolve(newProduct), 500);
        });
    },

    deleteProduct: async (_id: string): Promise<void> => {
        // await api.delete(`/api/v1/products/${_id}`);

        return new Promise((resolve) => setTimeout(resolve, 300));
    }
};