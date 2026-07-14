import { useState, useEffect } from 'react';
import { History, PauseCircle, ChevronDown } from 'lucide-react';
import { useKdsOrders } from '../hooks/useKdsOrders';
import { useUpdateKdsStatus } from '../hooks/useUpdateKdsStatus';
import { useKdsSummary } from '../hooks/useKdsSummary';
import { KdsTicket } from './KdsTicket';

export const KdsFeature = () => {
    const { data: tickets, isLoading: isLoadingTickets } = useKdsOrders();
    const { data: summary, isLoading: isLoadingSummary } = useKdsSummary();
    const mutation = useUpdateKdsStatus();
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            setTime(`${hours}:${minutes} ${ampm}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isLoadingTickets || isLoadingSummary) {
        return <div className="p-8 text-slate-400 font-medium">Loading KDS...</div>;
    }

    return (
        <div className="h-screen w-full bg-slate-950 text-slate-50 flex flex-col overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* ── Top Navigation Bar ──────────────────────────────────────────────── */}
            <header className="flex-shrink-0 h-16 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between px-6 z-10">
                {/* Left: Station & Clock */}
                <div className="flex items-center gap-6 w-[300px]">
                    <button className="flex items-center gap-2 text-lg font-bold text-slate-50 hover:text-slate-300 transition-colors">
                        Grill Station
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="h-5 w-px bg-slate-800" />
                    <div className="font-mono text-lg font-medium text-slate-400">
                        {time || "14:32 PM"}
                    </div>
                </div>

                {/* Center: Segmented Filters */}
                <div className="flex-1 flex justify-center">
                    <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-[8px]">
                        <button className="px-6 py-1.5 rounded-[6px] bg-slate-800 text-slate-50 text-sm font-semibold shadow-sm">
                            All Tickets ({tickets?.length || 0})
                        </button>
                        <button className="px-6 py-1.5 rounded-[6px] text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
                            Dine-In ({tickets?.filter(t => t.type === 'DINE-IN').length || 0})
                        </button>
                        <button className="px-6 py-1.5 rounded-[6px] text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
                            Delivery ({tickets?.filter(t => t.type === 'DELIVERY').length || 0})
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="w-[300px] flex items-center justify-end gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                        <History className="w-4 h-4" />
                        Recall Last Ticket
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-50 transition-colors">
                        <PauseCircle className="w-4 h-4" />
                        Pause Station
                    </button>
                </div>
            </header>

            {/* ── Main Layout ─────────────────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Ticket Grid (75%) */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="flex flex-wrap gap-6 items-start content-start h-full">
                        {tickets?.map((ticket) => (
                            <KdsTicket
                                key={ticket.id}
                                ticket={ticket}
                                onItemToggle={(itemId, completed) =>
                                    mutation.mutate({ ticketId: ticket.id, itemId, completed })
                                }
                            />
                        ))}
                    </div>
                </main>

                {/* Right Sidebar: Production Summary (25%) */}
                <aside className="w-1/4 min-w-[320px] max-w-[400px] border-l border-slate-800 bg-slate-900 flex flex-col z-10 shadow-2xl">
                    <div className="p-5 border-b border-slate-800 bg-slate-900">
                        <h2 className="text-lg font-bold text-slate-50 tracking-tight">Production Summary</h2>
                        <p className="text-sm font-medium text-slate-400 mt-0.5">All Day (Active Tickets)</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {summary?.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-3 rounded-[8px] border border-slate-800/50 bg-slate-950/30 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="bg-slate-800 px-3 py-1.5 rounded-[6px] border border-slate-700 shadow-inner">
                                    <span className="font-mono text-lg font-bold text-slate-50">{item.qty}x</span>
                                </div>
                                <span className="text-base font-semibold text-slate-200 leading-snug">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};