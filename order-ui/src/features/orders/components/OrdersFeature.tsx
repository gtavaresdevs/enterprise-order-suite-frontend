import { useState } from "react";
import { ShoppingCart, Plus, Package, Search } from "lucide-react";
import type { Order } from "@/types/orders";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useOrderFilters } from "@/features/orders/hooks/useOrderFilters";
import { STATUS_CONFIG, FILTERS } from "@/features/orders/constants/orders.constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <div className="min-h-full font-['Outfit']">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />

            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-8">

                {/* Header Area */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingCart className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Enterprise Order Suite</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 leading-tight">Order Operations</h1>
                        <p className="text-sm text-slate-400">Manage, verify, and track enterprise logistical fulfillment.</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 mt-1">
                        <Plus className="w-4 h-4" /> Create Order
                    </Button>
                </div>

                {/* 2x2 Grid constraint enforcement */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                            <Card key={s} className="border-slate-100 shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex flex-col items-start gap-1">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s}</p>
                                        <p className="text-2xl font-semibold text-slate-900 font-mono">{counts[s] ?? 0}</p>
                                    </div>
                                    <span className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${cfg.dot} bg-opacity-15`}>
                                        <cfg.Icon className={`w-4 h-4 ${cfg.dot.replace("bg-", "text-")}`} />
                                    </span>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Sticky Toolbar */}
                <div className="sticky top-4 z-30">
                    <Card className="bg-white/90 backdrop-blur-md shadow-sm">
                        <CardContent className="p-3 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search orders by ID, customer name, or status..." className="pl-9 h-9" />
                            </div>
                            <div className="w-px h-5 bg-slate-200" />
                            <div className="flex items-center gap-2">
                                {FILTERS.map((f) => (
                                    <Button key={f} variant={activeFilter === f ? "default" : "secondary"} size="sm" onClick={() => setActiveFilter(f)} className="h-8">
                                        {f} <Badge variant={activeFilter === f ? "secondary" : "outline"} className="ml-1.5 opacity-70 font-mono">{counts[f] ?? 0}</Badge>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Area */}
                <Card className="shadow-sm">
                    <CardHeader className="p-0 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                        <div className="flex items-center gap-4 px-4 py-3">
                            <span className="w-32 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order ID</span>
                            <span className="flex-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</span>
                            <span className="w-32 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Products</span>
                            <span className="w-28 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date Created</span>
                            <span className="w-24 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                            <span className="w-32 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                            <span className="w-28"></span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredOrders.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                                <Package className="w-8 h-8 text-slate-200" />
                                <div className="flex flex-col items-center gap-0.5">
                                    <p className="text-sm font-medium text-slate-500">No orders found</p>
                                    <p className="text-xs text-slate-400">Try adjusting your search or filter.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-slate-50">
                                {filteredOrders.map((order) => (
                                    <OrderRow key={order.id} order={order} onView={() => setSelectedOrder(order)} onEdit={() => setSelectedOrder(order)} onDelete={() => setDeleteTarget(order)} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-xl">
                        <span className="text-xs text-slate-400 font-mono">Showing {filteredOrders.length} of {orders.length} orders</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">via</span>
                            <Badge variant="secondary" className="font-mono text-[11px] text-slate-500 font-normal">GET /api/v1/orders</Badge>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            {deleteTarget && <DeleteOrderModal order={deleteTarget} onConfirm={() => { deleteOrder(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
            {createOpen && <CreateOrderModal onClose={() => setCreateOpen(false)} onSave={createOrder} />}
        </div>
    );
}