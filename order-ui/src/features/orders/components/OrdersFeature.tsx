import { useState } from "react";
import { ShoppingCart, Plus, Search, Package } from "lucide-react";
import type { Order, OrderStatus } from "@/types/orders";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useOrderFilters } from "@/features/orders/hooks/useOrderFilters";
import { STATUS_CONFIG, FILTERS } from "@/features/orders/constants/orders.constants";
import { OrderRow } from "./OrderRow";
import { OrderDrawer } from "./OrderDrawer";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { CreateOrderModal } from "./CreateOrderModal";

export function OrdersFeature() {
    const { orders, deleteOrder, createOrder } = useOrders();
    const { search, setSearch, activeFilter, setActiveFilter, filteredOrders, counts } = useOrderFilters(orders);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="min-h-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1"><ShoppingCart className="w-4 h-4 text-slate-400" /><span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Enterprise Order Suite</span></div>
                        <h1 className="text-2xl font-semibold text-slate-900">Order Operations</h1>
                        <p className="text-sm text-slate-400 mt-1">Manage and track active delivery orders in real time.</p>
                    </div>
                    <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-slate-950 text-slate-50 text-sm font-semibold border border-slate-800 shadow-inner hover:bg-slate-800 active:scale-[0.98] transition-all mt-1">
                        <Plus className="w-3.5 h-3.5" /> New Order
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                    {(["New", "Preparing", "In Route", "Delivered"] as OrderStatus[]).map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                            <div key={s} className="bg-white rounded-[8px] border border-slate-100 px-4 py-3.5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">{s}</p>
                                    <p className="text-2xl font-semibold text-slate-900 font-mono">{counts[s] ?? 0}</p>
                                </div>
                                <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${cfg.dot.replace("bg-", "bg-").replace(/bg-(\w+)-\d+/, "bg-$1-50")}`}>
                                    <cfg.Icon className={`w-4 h-4 ${cfg.dot.replace("bg-", "text-")}`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="sticky top-4 z-30 mb-4">
                    <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[8px] px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, customer name, or status..." className="w-full h-9 pl-9 pr-4 rounded-[8px] bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-300 transition-all" />
                        </div>
                        <div className="w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                            {FILTERS.map((f) => (
                                <button key={f} onClick={() => setActiveFilter(f)} className={`h-7 px-3 rounded-[8px] text-xs font-medium transition-all ${activeFilter === f ? "bg-slate-950 text-slate-50 border border-slate-800 shadow-inner" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                    {f}<span className="ml-1.5 font-mono text-slate-400">{counts[f] ?? 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.7fr_0.8fr_0.7fr_auto] gap-4 items-center px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                        {["Order ID", "Customer", "Items", "Date", "Total", "Status", ""].map((col, i) => (
                            <span key={i} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{col}</span>
                        ))}
                    </div>
                    {filteredOrders.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <Package className="w-8 h-8 text-slate-200" />
                            <div className="text-center"><p className="text-sm font-medium text-slate-500">No orders found</p><p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filter.</p></div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredOrders.map((order) => (
                                <OrderRow key={order.id} order={order} onView={() => setSelectedOrder(order)} onEdit={() => setSelectedOrder(order)} onDelete={() => setDeleteTarget(order)} />
                            ))}
                        </div>
                    )}
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">Showing {filteredOrders.length} of {orders.length} orders</span>
                        <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">GET /api/v1/orders</span>
                    </div>
                </div>
            </div>
            {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            {deleteTarget && <DeleteOrderModal order={deleteTarget} onConfirm={() => { deleteOrder(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
            {createOpen && <CreateOrderModal onClose={() => setCreateOpen(false)} onSave={createOrder} />}
        </div>
    );
}