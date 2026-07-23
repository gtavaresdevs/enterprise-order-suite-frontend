import { X, ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import type { Order, ProductLine } from "@/types/orders";
import { fmt } from "@/features/orders/constants/orders.constants";
import { StatusBadge } from "./StatusBadge";

export function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const lineTotal = (p: ProductLine) => {
    const modTotal = (p.modifiers ?? []).reduce((s, m) => s + m.price, 0);
    return p.quantity * (p.unitPrice + modTotal);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-white z-50 shadow-2xl shadow-slate-900/20 flex flex-col border-l border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-mono text-xs text-slate-400 tracking-wider uppercase">Delivery Order</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-mono text-xs font-medium text-slate-600">{order.id}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{order.customer}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={order.status} />
              <span className="text-xs text-slate-400 font-mono">ETA {order.estimatedDelivery}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Delivery Details</p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Delivery Address</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 leading-snug">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 font-mono">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{order.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Items</p>
              <span className="text-xs text-slate-400 font-mono">{order.products.length} line{order.products.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {order.products.map((p) => {
                const total = lineTotal(p);
                const hasModifiers = (p.modifiers ?? []).length > 0;
                return (
                  <div key={p.id} className="rounded-[8px] border border-slate-100 overflow-hidden bg-slate-50/50">
                    <div className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">×{p.quantity}</span>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{fmt(p.unitPrice)} each</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-900 font-mono">{fmt(total)}</p>
                      </div>
                    </div>
                    {hasModifiers && (
                      <div className="border-t border-slate-100 px-4 py-2.5 space-y-1.5">
                        {(p.modifiers ?? []).map((mod, mi) => (
                          <div key={mi} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold ${mod.type === "remove" ? "text-red-400" : "text-emerald-600"}`}>
                                {mod.type === "remove" ? "⊘" : "+"}
                              </span>
                              <span className={`text-xs ${mod.type === "remove" ? "text-red-600" : "text-slate-600"}`}>
                                {mod.label}
                              </span>
                            </div>
                            {mod.price > 0 && <span className="text-xs font-medium text-emerald-600 font-mono">+{fmt(mod.price)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Order Total</p>
            <p className="text-2xl font-semibold text-slate-900 font-mono mt-0.5">{fmt(order.total)}</p>
          </div>
          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-[8px] border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Contact Customer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}