import { useState, useMemo } from "react";
import type { Order, OrderFilter } from "@/types/orders";

export function useOrderFilters(orders: Order[]) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("All");

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.customer.toLowerCase().includes(query) ||
        o.company.toLowerCase().includes(query) ||
        o.status.toLowerCase().includes(query);
        
      const matchFilter = activeFilter === "All" || o.status === activeFilter;
      
      return matchSearch && matchFilter;
    });
  }, [orders, search, activeFilter]);

  const counts = useMemo(() => {
    const countsMap: Record<string, number> = { All: orders.length };
    orders.forEach((o) => {
      countsMap[o.status] = (countsMap[o.status] ?? 0) + 1;
    });
    return countsMap;
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