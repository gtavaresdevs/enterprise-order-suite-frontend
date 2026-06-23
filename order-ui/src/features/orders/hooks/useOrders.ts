import { useState } from "react";
import type { Order } from "@/types/orders";
import { ORDERS } from "@/features/orders/constants/orders.constants";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const createOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  return {
    orders,
    deleteOrder,
    createOrder,
  };
}