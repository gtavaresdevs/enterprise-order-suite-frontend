import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/orders";
import { STATUS_CONFIG } from "@/features/orders/constants/orders.constants";

export function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];

    return (
        <Badge variant="outline" className={`gap-1.5 rounded-[8px] font-medium tracking-wide ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </Badge>
    );
}