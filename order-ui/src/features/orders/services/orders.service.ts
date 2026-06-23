import type { Order } from "@/types/orders";

/**
 * Service Layer: API Communication Only
 * Currently acts as a structural boundary blueprint. Replace mock promises
 * with real Axios/fetch calls once endpoints are available.
 */
export const OrdersService = {
  getOrders: async (): Promise<Order[]> => {
    // Expected API: GET /api/v1/orders
    throw new Error("Not implemented - replace with actual API call");
  },

  createOrder: async (order: Omit<Order, "id">): Promise<Order> => {
    // Expected API: POST /api/v1/orders
    throw new Error("Not implemented - replace with actual API call");
  },

  deleteOrder: async (id: string): Promise<void> => {
    // Expected API: DELETE /api/v1/orders/{id}
    throw new Error("Not implemented - replace with actual API call");
  }
};