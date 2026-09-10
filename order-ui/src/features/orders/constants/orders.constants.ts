import { Clock, Loader2, PackageCheck, CheckCircle2, XCircle } from "lucide-react";
import type { OrderStatus } from "@/types/orders";

export const STATUS_CONFIG: Record<OrderStatus, { pill: string; dot: string; Icon: React.ElementType }> = {
  New: { pill: "text-blue-700 bg-blue-50 border border-blue-200", dot: "bg-blue-500", Icon: Clock },
  Preparing: { pill: "text-amber-700 bg-amber-50 border border-amber-200", dot: "bg-amber-400", Icon: Loader2 },
  Ready: { pill: "text-violet-700 bg-violet-50 border border-violet-200", dot: "bg-violet-500", Icon: PackageCheck },
  Completed: { pill: "text-emerald-700 bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  Cancelled: { pill: "text-rose-700 bg-rose-50 border border-rose-200", dot: "bg-rose-500", Icon: XCircle },
};

export const FILTERS: Array<OrderStatus | "All"> = ["All", "New", "Preparing", "Ready", "Completed", "Cancelled"];