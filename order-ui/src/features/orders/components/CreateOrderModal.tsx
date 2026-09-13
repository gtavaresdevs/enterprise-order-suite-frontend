import { useState } from "react";
import { User, Phone, Package, Plus, DollarSign, Minus, X, MapPin } from "lucide-react";
import type { Order, OrderStatus, OrderLine, OrderChannel, Fulfillment } from "@/types/orders";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import { useTables } from "@/features/tables/hooks/useTables";

interface DraftItem { _key: string; name: string; quantity: string; unitPrice: string; }
const emptyDraftItem = (): DraftItem => ({ _key: Math.random().toString(36).slice(2), name: "", quantity: "1", unitPrice: "" });

export function CreateOrderModal({ onClose, onSave }: { onClose: () => void; onSave: (o: Omit<Order, "id">) => void }) {
    const { formatCurrency } = useFormat();
    const { tables } = useTables();
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [status, setStatus] = useState<OrderStatus>("New");
    const [channel, setChannel] = useState<OrderChannel>("Phone");
    const [fulfillment, setFulfillment] = useState<Fulfillment>("Pickup");
    const [tableId, setTableId] = useState("");
    const [items, setItems] = useState<DraftItem[]>([emptyDraftItem()]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const grandTotal = items.reduce((s, p) => s + (parseFloat(p.quantity) || 0) * (parseFloat(p.unitPrice) || 0), 0);

    function validate() {
        const e: Record<string, string> = {};
        if (!customerName.trim()) e.customerName = "Name required.";
        if (!customerPhone.trim()) e.customerPhone = "Phone required.";
        if (channel === "Dine-in" && !tableId) e.table = "Table required.";
        items.forEach((p, i) => {
            if (!p.name.trim()) e[`pname_${i}`] = "Item name required.";
            if (!p.unitPrice || parseFloat(p.unitPrice) <= 0) e[`pprice_${i}`] = "Price required.";
        });
        return e;
    }

    function handleSubmit() {
        setSubmitted(true);
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;
        const now = new Date();
        const orderItems: OrderLine[] = items.map((p) => ({
            menuItemId: `CUSTOM-${p._key}`,
            name: p.name.trim(),
            quantity: parseInt(p.quantity) || 1,
            unitPrice: parseFloat(p.unitPrice) || 0,
            modifiers: [],
        }));
        const selectedTable = tables.find((t) => t.id === tableId);
        onSave({
            channel,
            fulfillment: channel === "Phone" ? fulfillment : undefined,
            table: channel === "Dine-in" ? selectedTable?.name : undefined,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            status,
            paymentStatus: "PayLater",
            createdAt: now.toISOString().slice(0, 10),
            total: grandTotal,
            items: orderItems,
        });
        onClose();
    }

    const inputCls = (err?: string) => `w-full h-9 px-3 rounded-[8px] border text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-950/10 ${err ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-slate-50 focus:border-slate-400"}`;

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>New Order</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Enter customer details and order items.</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><User className="w-3 h-3" /> Customer</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Name</label>
                                    <input className={inputCls(submitted ? errors.customerName : undefined)} placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Phone</label>
                                    <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /><input className={`${inputCls(submitted ? errors.customerPhone : undefined)} pl-8`} placeholder="+1 (555) 000-0000" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Channel</label>
                                    <select className={`${inputCls()} cursor-pointer`} value={channel} onChange={(e) => setChannel(e.target.value as OrderChannel)}>
                                        <option value="Phone">Phone</option>
                                        <option value="Dine-in">Dine-in</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Initial Status</label>
                                    <select className={`${inputCls()} cursor-pointer`} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                                        {(["New", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map((s) => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                {channel === "Dine-in" ? (
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Table</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                            <select className={`${inputCls(submitted ? errors.table : undefined)} pl-8 cursor-pointer`} value={tableId} onChange={(e) => setTableId(e.target.value)}>
                                                <option value="">Select a table...</option>
                                                {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Fulfillment</label>
                                        <select className={`${inputCls()} cursor-pointer`} value={fulfillment} onChange={(e) => setFulfillment(e.target.value as Fulfillment)}>
                                            <option value="Pickup">Pickup</option>
                                            <option value="Delivery">Delivery</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="border-t border-slate-100" />
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Package className="w-3 h-3" /> Items</p>
                                <button onClick={() => setItems((prev) => [...prev, emptyDraftItem()])} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors"><Plus className="w-3 h-3" /> Add Item</button>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-[1fr_0.5fr_0.6fr_auto] gap-2 px-2">
                                    {["Item Name", "Qty", "Price", ""].map((h) => <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</span>)}
                                </div>
                                {items.map((p, i) => (
                                    <div key={p._key} className="grid grid-cols-[1fr_0.5fr_0.6fr_auto] gap-2 items-center bg-slate-50 border border-slate-100 rounded-[8px] px-2 py-2">
                                        <input className={inputCls(submitted ? errors[`pname_${i}`] : undefined)} placeholder="e.g. Double Smash Burger" value={p.name} onChange={(e) => setItems((prev) => prev.map((x) => x._key === p._key ? { ...x, name: e.target.value } : x))} />
                                        <input className={`${inputCls()} font-mono`} placeholder="1" type="number" min="1" value={p.quantity} onChange={(e) => setItems((prev) => prev.map((x) => x._key === p._key ? { ...x, quantity: e.target.value } : x))} />
                                        <div className="relative"><DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" /><input className={`${inputCls(submitted ? errors[`pprice_${i}`] : undefined)} pl-5 font-mono`} placeholder="0.00" type="number" min="0" step="0.01" value={p.unitPrice} onChange={(e) => setItems((prev) => prev.map((x) => x._key === p._key ? { ...x, unitPrice: e.target.value } : x))} /></div>
                                        <button onClick={() => setItems((prev) => prev.filter((x) => x._key !== p._key))} disabled={items.length === 1} className="w-9 h-9 rounded-[8px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><Minus className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                            </div>
                            {grandTotal > 0 && (
                                <div className="mt-3 flex justify-end">
                                    <div className="bg-slate-900 text-slate-50 rounded-[8px] px-4 py-2 flex items-center gap-3">
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total</span>
                                        <span className="font-mono font-semibold">{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
                        <p className="text-xs">{submitted && Object.keys(errors).length > 0 && <span className="text-red-500 font-medium">Fix errors above.</span>}</p>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="h-9 px-4 rounded-[8px] border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={handleSubmit} className="h-9 px-5 rounded-[8px] bg-slate-950 text-slate-50 text-sm font-semibold border border-slate-800 shadow-inner hover:bg-slate-800 active:scale-[0.98] transition-all">Create Order</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
