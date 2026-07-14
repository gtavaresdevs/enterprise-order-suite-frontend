import type { TicketStatus } from "@/types/kds";
import { TICKET_STATUS_CONFIG } from "@/features/kds/constants/kds.constants";

export function StatusBadge({ status }: { status: TicketStatus }) {
    const cfg = TICKET_STATUS_CONFIG[status] || TICKET_STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-xs font-medium tracking-wide ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status.toUpperCase()}
        </span>
    );
}
