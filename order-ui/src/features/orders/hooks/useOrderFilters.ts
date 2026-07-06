import { useState, useMemo } from "react";
import type { Order, OrderStatus } from "@/types/orders";

export function useOrderFilters(orders: Order[]) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.status.toLowerCase().includes(q);
      const matchFilter = activeFilter === "All" || o.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, activeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  return {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    filteredOrders,
    counts,
  };
}