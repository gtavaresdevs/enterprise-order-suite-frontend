import { ordersService } from "@/features/orders/services/orders.service";
import type { Order } from "@/types/orders";

export const trackOrderService = {
    getOrders: async (): Promise<Order[]> => {
        return ordersService.getOrders();
    },
};
