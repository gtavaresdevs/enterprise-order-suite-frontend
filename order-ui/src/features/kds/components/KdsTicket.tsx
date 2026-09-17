import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/types/orders';
import { getTicketChannelLabel, NEXT_STATUS } from '../constants/kds.constants';
import { StatusBadge } from './StatusBadge';

interface KdsTicketProps {
    order: Order;
    onAdvanceStatus: (nextStatus: Order["status"]) => void;
}

const ACTION_LABEL_KEY: Partial<Record<OrderStatus, string>> = {
    New: 'actions.startPreparing',
    Preparing: 'actions.markReady',
    Ready: 'actions.completeOrder',
};

export const KdsTicket = ({ order, onAdvanceStatus }: KdsTicketProps) => {
    const { t } = useTranslation('kds');
    const action = NEXT_STATUS[order.status];
    const actionLabelKey = ACTION_LABEL_KEY[order.status];

    return (
        <Card className="w-[360px] flex flex-col bg-slate-900 border border-slate-800 rounded-[8px] shadow-2xl flex-shrink-0">
            {/* Card Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-[8px]">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="font-mono text-2xl font-bold text-slate-50 tracking-tight leading-none">
                            {order.id}
                        </span>
                        <p className="text-[15px] font-medium text-slate-400 mt-1">
                            {order.customerName}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-2 py-0.5 rounded-[6px] text-xs font-bold tracking-wide uppercase">
                            {getTicketChannelLabel(order)}
                        </Badge>
                        <StatusBadge status={order.status} />
                    </div>
                </div>
                {order.table && (
                    <p className="text-sm font-medium text-slate-400">{order.table}</p>
                )}
            </div>

            {/* Line Items */}
            <div className="flex-1 p-4 space-y-3">
                {order.items.map((item, idx) => (
                    <div key={`${item.menuItemId}-${idx}`}>
                        <p className="text-xl font-bold leading-tight flex items-start gap-3 text-slate-50">
                            <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-[4px] text-lg leading-none">
                                {item.quantity}x
                            </span>
                            <span>{item.name}</span>
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                            <ul className="mt-2 space-y-1.5 ml-1">
                                {item.modifiers.map((mod, modIdx) => (
                                    <li key={modIdx} className="text-base font-bold flex items-center gap-2 text-slate-400">
                                        <span className="text-slate-600 text-xl leading-none">↳</span>
                                        {mod.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Button — the real, working status-advance action */}
            {action && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-[8px]">
                    <button
                        onClick={() => onAdvanceStatus(action.next)}
                        className="w-full py-4 text-lg rounded-[6px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-slate-50 hover:bg-white text-slate-950 font-bold shadow-sm"
                    >
                        {actionLabelKey ? t(actionLabelKey) : action.label}
                    </button>
                </div>
            )}
        </Card>
    );
};


