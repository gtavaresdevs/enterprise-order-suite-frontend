export const KDS_POLLING_INTERVAL = 5000;

export const STATUS_COLORS: Record<string, string> = {
    good: 'bg-emerald-500 text-emerald-50',
    late: 'bg-rose-500 text-rose-50 animate-pulse',
};

export const TICKET_STATUS_CONFIG: Record<string, { pill: string; dot: string }> = {
    pending: { pill: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
    preparing: { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    ready: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};