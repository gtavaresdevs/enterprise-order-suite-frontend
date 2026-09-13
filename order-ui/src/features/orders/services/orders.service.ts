import type { Order, OrderStatus } from "@/types/orders";
import { ORDERS } from "../constants/orders.constants";

let orders: Order[] = [...ORDERS];

const ID_PREFIX: Record<Order["channel"], string> = {
  "Online": "DEL",
  "Dine-in": "DIN",
  "Phone": "PHN",
};

export const ordersService = {
  getOrders: async (): Promise<Order[]> => {
    // TODO: connect-backend — GET /api/v1/orders
    return new Promise((resolve) => setTimeout(() => resolve([...orders]), 300));
  },

  createOrder: async (input: Omit<Order, "id">): Promise<Order> => {
    // TODO: connect-backend — POST /api/v1/orders
    return new Promise((resolve) => {
      const id = `${ID_PREFIX[input.channel]}-${new Date().getFullYear()}-${8000 + Math.floor(Math.random() * 999)}`;
      const newOrder: Order = { ...input, id };
      orders = [newOrder, ...orders];
      setTimeout(() => resolve(newOrder), 400);
    });
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<void> => {
    // TODO: connect-backend — PATCH /api/v1/orders/{id}/status
    return new Promise((resolve) => {
      orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
      setTimeout(resolve, 300);
    });
  },
};