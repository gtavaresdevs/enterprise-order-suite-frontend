import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Alias the imported type to avoid naming collision with the component
import type { KdsTicket as KdsTicketType } from '@/types/kds';
import { STATUS_COLORS } from '../constants/kds.constants';

interface KdsTicketProps {
    ticket: KdsTicketType;
    onItemToggle: (itemId: string, completed: boolean) => void;
}

export const KdsTicket = ({ ticket, onItemToggle }: KdsTicketProps) => {
    const allCompleted = ticket.items.every(item => item.completed);

    return (
        <Card
            className={`w-[360px] flex flex-col bg-slate-900 border rounded-[8px] shadow-2xl flex-shrink-0 ${ticket.isActive
                    ? 'border-indigo-500 ring-4 ring-indigo-500/20'
                    : 'border-slate-800'
                }`}
        >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-[8px]">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="font-mono text-2xl font-bold text-slate-50 tracking-tight leading-none">
                            {ticket.id}
                        </span>
                        <p className="text-[15px] font-medium text-slate-400 mt-1">
                            {ticket.customer}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {ticket.isRush && (
                            <Badge className="bg-rose-500 hover:bg-rose-500 text-rose-50 font-bold px-2 py-0.5 rounded-[6px] text-xs uppercase tracking-wide border-0">
                                🔥 RUSH
                            </Badge>
                        )}
                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-2 py-0.5 rounded-[6px] text-xs font-bold tracking-wide uppercase">
                            {ticket.type}
                        </Badge>
                    </div>
                </div>

                {/* Timer Pill */}
                <div
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-[6px] font-mono text-2xl font-bold tracking-wider shadow-inner ${STATUS_COLORS[ticket.timerState] || ''
                        }`}
                >
                    <Clock className="w-5 h-5 opacity-80" />
                    {ticket.timer}
                </div>
            </div>

            {/* Line Items */}
            <div className="flex-1 p-2 space-y-1">
                {ticket.items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onItemToggle(item.id, !item.completed)}
                        className={`w-full text-left flex gap-3 px-3 py-3 rounded-[6px] transition-colors active:scale-[0.99] ${
                            item.completed ? 'hover:bg-slate-800/50' : 'hover:bg-slate-800'
                        }`}
                    >
                        <div className="mt-0.5 flex-shrink-0">
                            {item.completed ? (
                                <CheckCircle className="w-7 h-7 text-emerald-500" />
                            ) : (
                                <Circle className="w-7 h-7 text-slate-600 stroke-[1.5]" />
                            )}
                        </div>
                        <div className={`flex-1 ${item.completed ? 'opacity-50' : ''}`}>
                            <p className={`text-xl font-bold leading-tight flex items-start gap-3 ${
                                item.completed ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-50'
                            }`}>
                                <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-[4px] text-lg leading-none">
                                    {item.qty}x
                                </span>
                                <span>{item.name}</span>
                            </p>
                            
                            {item.modifiers && item.modifiers.length > 0 && (
                                <ul className="mt-2 space-y-1.5 ml-1">
                                    {item.modifiers.map((mod, modIdx) => (
                                        <li key={modIdx} className={`text-base font-bold flex items-center gap-2 ${mod.color || 'text-slate-400'}`}>
                                            <span className="text-slate-600 text-xl leading-none">↳</span>
                                            {mod.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-[8px]">
                <button
                    className={`w-full py-4 text-lg rounded-[6px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                        allCompleted
                            ? 'bg-slate-50 hover:bg-white text-slate-950 font-bold shadow-sm'
                            : 'bg-transparent border-2 border-slate-700 text-slate-400 font-semibold hover:border-slate-600 hover:text-slate-300'
                    }`}
                >
                    {allCompleted && <CheckCircle className="w-5 h-5" />}
                    Mark Order Ready
                </button>
            </div>
        </Card>
    );
};