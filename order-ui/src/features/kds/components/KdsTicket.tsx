import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Alias the imported type to avoid naming collision with the component
import type { KdsTicket as KdsTicketType } from '@/types/kds';
import { STATUS_COLORS } from '../constants/kds.constants';

interface KdsTicketProps {
    ticket: KdsTicketType;
    onItemToggle: (itemId: string, completed: boolean) => void;
}

export const KdsTicket = ({ ticket, onItemToggle }: KdsTicketProps) => {
    return (
        <Card
            className={`w-[360px] flex flex-col bg-slate-900 border ${ticket.isActive
                    ? 'border-indigo-500 ring-4 ring-indigo-500/20'
                    : 'border-slate-800'
                }`}
        >
            <CardHeader className="p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="font-mono text-2xl font-bold text-slate-50 tracking-tight">
                            {ticket.id}
                        </span>
                        <p className="text-[15px] font-medium text-slate-400 mt-1">
                            {ticket.customer}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {ticket.isRush && (
                            <Badge className="bg-rose-500 text-rose-50 font-bold px-2 py-0.5 rounded-[6px] text-xs uppercase">
                                🔥 RUSH
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-slate-300 border-slate-700">
                            {ticket.type}
                        </Badge>
                    </div>
                </div>
                <div
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-[6px] font-mono text-2xl font-bold shadow-inner ${STATUS_COLORS[ticket.timerState]
                        }`}
                >
                    <Clock className="w-5 h-5 opacity-80" />
                    {ticket.timer}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-2 space-y-1">
                {ticket.items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onItemToggle(item.id, !item.completed)}
                        className="w-full text-left flex gap-3 px-3 py-3 rounded-[6px] hover:bg-slate-800 transition-colors"
                    >
                        {item.completed ? (
                            <CheckCircle className="w-7 h-7 text-emerald-500" />
                        ) : (
                            <Circle className="w-7 h-7 text-slate-600" />
                        )}
                        <div className={item.completed ? 'opacity-50' : ''}>
                            <p className="text-xl font-bold text-slate-50">
                                <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-[4px] text-lg">
                                    {item.qty}x
                                </span>
                                {item.name}
                            </p>
                        </div>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
};