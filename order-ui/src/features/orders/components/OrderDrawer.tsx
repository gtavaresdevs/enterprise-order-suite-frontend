import { X, ChevronRight, Hash, Mail, MapPin, Building2, Clock, AlertTriangle } from "lucide-react";
import type { Order } from "@/types/orders";
import { formatCurrency, formatDate, STATUS_CONFIG } from "@/features/orders/constants/orders.constants";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";

interface OrderDrawerProps {
  order: Order;
  onClose: () => void;
}

function MetaCell({ icon: Icon, label, value, mono, small }: { icon: React.ElementType; label: string; value: React.ReactNode; mono?: boolean; small?: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 flex items-center justify-center">
          <Icon className="w-3 h-3 text-slate-400" />
        </div>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      {typeof value === "string" ? (
        <p className={`${mono ? "font-mono" : ""} ${small ? "text-xs" : "text-sm"} text-slate-700 font-medium leading-snug`}>{value}</p>
      ) : value}
    </div>
  );
}

export function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  const allInStock = order.products.every((p) => p.inStock);

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[520px] z-50 shadow-2xl">
        <Card className="w-full h-full rounded-none border-0 border-l flex flex-col">
          <CardHeader className="p-6 border-b flex flex-row items-start justify-between bg-white">
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-slate-400 tracking-wider uppercase">Order Details</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="font-mono text-xs font-medium text-slate-600">{order.id}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{order.customer}</h2>
              <p className="text-sm text-slate-400">{order.company}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <ScrollArea className="flex-1 bg-white">
            <CardContent className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <MetaCell icon={Hash} label="Order ID" value={order.id} mono />
                <MetaCell icon={STATUS_CONFIG[order.status].Icon} label="Status" value={<StatusBadge status={order.status} />} />
                <MetaCell icon={Mail} label="Email" value={order.email} small />
                <MetaCell icon={MapPin} label="Region" value={order.region} />
                <MetaCell icon={Building2} label="Company" value={order.company} small />
                <MetaCell icon={Clock} label="Date Created" value={formatDate(order.dateCreated)} />
              </div>

              <Separator />

              <div className="flex flex-col gap-4 items-start">
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Product Lines</h3>
                  <div className="flex items-center gap-2">
                    {!allInStock && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[8px]">
                        <AlertTriangle className="w-3 h-3" /> Stock issues
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">{order.products.length} items</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                  {order.products.map((p) => (
                    <Card key={p.id} className="border-slate-100 bg-slate-50/70 overflow-hidden shadow-none">
                      <CardContent className="p-0">
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                            <p className="text-sm font-medium text-slate-800 leading-snug truncate w-full">{p.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</span>
                              <span className="font-mono text-[11px] text-slate-400">{p.id}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                            <p className="text-sm font-semibold text-slate-900 font-mono">{formatCurrency(p.unitPrice * p.quantity)}</p>
                            <p className="text-[11px] text-slate-400">{p.quantity} × {formatCurrency(p.unitPrice)}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 flex items-center justify-between border-t ${p.inStock ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"}`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-red-400"}`} />
                            <span className={`text-[11px] font-medium ${p.inStock ? "text-emerald-700" : "text-red-600"}`}>
                              {p.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">
                            {p.inStock ? `${p.stockQty} units available` : "Back-order required"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </ScrollArea>

          <CardFooter className="p-6 border-t bg-slate-50/80 flex items-center justify-between">
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Order Total</p>
              <p className="text-2xl font-semibold text-slate-900 font-mono">{formatCurrency(order.total)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">Edit Order</Button>
              <Button>Confirm & Process</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}