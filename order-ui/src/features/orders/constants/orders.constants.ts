import { Clock, Loader2, Bike, CheckCircle2 } from "lucide-react";
import type { OrderStatus } from "@/types/orders";

export const STATUS_CONFIG: Record<OrderStatus, { pill: string; dot: string; Icon: React.ElementType }> = {
  New: { pill: "text-blue-700 bg-blue-50 border border-blue-200", dot: "bg-blue-500", Icon: Clock },
  Preparing: { pill: "text-amber-700 bg-amber-50 border border-amber-200", dot: "bg-amber-400", Icon: Loader2 },
  "In Route": { pill: "text-violet-700 bg-violet-50 border border-violet-200", dot: "bg-violet-500", Icon: Bike },
  Delivered: { pill: "text-emerald-700 bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
};

export const FILTERS: Array<OrderStatus | "All"> = ["All", "New", "Preparing", "In Route", "Delivered"];

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });