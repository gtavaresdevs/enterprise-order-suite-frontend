import { useState } from "react";
import { X, User, Package, Plus, DollarSign, Minus } from "lucide-react";
import type { Order, OrderStatus } from "@/types/orders";
import { REGIONS, formatCurrency } from "@/features/orders/constants/orders.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DraftProduct {
    _key: string;
    name: string;
    sku: string;
    quantity: string;
    unitPrice: string;
    inStock: boolean;
}

const emptyProduct = (): DraftProduct => ({
    _key: Math.random().toString(36).slice(2),
    name: "", sku: "", quantity: "1", unitPrice: "", inStock: true,
});

export function CreateOrderModal({ onClose, onSave }: { onClose: () => void; onSave: (o: Order) => void }) {
    const [customer, setCustomer] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [region, setRegion] = useState(REGIONS[0]);
    const [status, setStatus] = useState<OrderStatus>("Pending");
    const [products, setProducts] = useState<DraftProduct[]>([emptyProduct()]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const grandTotal = products.reduce((s, p) => s + ((parseFloat(p.quantity) || 0) * (parseFloat(p.unitPrice) || 0)), 0);

    const updateLine = (key: string, field: keyof DraftProduct, value: string | boolean) => {
        setProducts((prev) => prev.map((p) => (p._key === key ? { ...p, [field]: value } : p)));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!customer.trim()) e.customer = "Required";
        if (!company.trim()) e.company = "Required";
        if (!email.trim()) e.email = "Required";
        products.forEach((p, i) => {
            if (!p.name.trim()) e[`pname_${i}`] = "Req";
            if (!p.sku.trim()) e[`psku_${i}`] = "Req";
            if (!p.quantity || parseFloat(p.quantity) <= 0) e[`pqty_${i}`] = "> 0";
            if (!p.unitPrice || parseFloat(p.unitPrice) <= 0) e[`pprice_${i}`] = "> 0";
        });
        return e;
    };

    const handleSubmit = () => {
        setSubmitted(true);
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        const now = new Date();
        onSave({
            id: `ORD-${now.getFullYear()}-${9000 + Math.floor(Math.random() * 999)}`,
            customer: customer.trim(), company: company.trim(), email: email.trim(),
            region, status, dateCreated: now.toISOString().slice(0, 10), total: grandTotal,
            products: products.map((p, i) => ({
                id: `PRD-${String(i + 1).padStart(4, "0")}`, name: p.name.trim(), sku: p.sku.trim().toUpperCase(),
                quantity: parseInt(p.quantity) || 1, unitPrice: parseFloat(p.unitPrice) || 0,
                inStock: p.inStock, stockQty: p.inStock ? 50 : 0,
            })),
        });
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-1 items-start">
                            <h2 className="text-base font-semibold text-slate-900">Create New Order</h2>
                            <p className="text-xs text-slate-400">Fill in the order details and add product lines below.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 text-slate-400">
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <ScrollArea className="flex-1">
                        <CardContent className="p-6 flex flex-col gap-6">

                            <div className="flex flex-col gap-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> Customer Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 uppercase">Customer Name</Label>
                                        <Input placeholder="e.g. Marcus Whitfield" value={customer} onChange={(e) => setCustomer(e.target.value)}
                                            className={submitted && errors.customer ? "border-red-300 bg-red-50" : ""} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 uppercase">Company</Label>
                                        <Input placeholder="e.g. Nexus Dynamics" value={company} onChange={(e) => setCompany(e.target.value)}
                                            className={submitted && errors.company ? "border-red-300 bg-red-50" : ""} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 uppercase">Email</Label>
                                        <Input type="email" placeholder="contact@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                            className={submitted && errors.email ? "border-red-300 bg-red-50" : ""} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 uppercase">Region</Label>
                                            <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background"
                                                value={region} onChange={(e) => setRegion(e.target.value)}>
                                                {REGIONS.map((r) => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 uppercase">Status</Label>
                                            <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background"
                                                value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                                                {(["Pending", "Processing", "Completed", "Cancelled"] as OrderStatus[]).map((s) => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Package className="w-3 h-3" /> Product Lines
                                    </p>
                                    <Button variant="secondary" size="sm" onClick={() => setProducts((prev) => [...prev, emptyProduct()])} className="h-7 text-xs">
                                        <Plus className="w-3 h-3 mr-1.5" /> Add Line
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 px-3">
                                        <span className="flex-1 text-[10px] font-semibold text-slate-400 uppercase">Product Name</span>
                                        <span className="w-24 text-[10px] font-semibold text-slate-400 uppercase">SKU</span>
                                        <span className="w-28 text-[10px] font-semibold text-slate-400 uppercase">Unit Price</span>
                                        <span className="w-20 text-[10px] font-semibold text-slate-400 uppercase">Qty</span>
                                        <span className="w-10 text-[10px] font-semibold text-slate-400 uppercase">Stk</span>
                                        <span className="w-10 text-[10px] font-semibold text-slate-400 uppercase"></span>
                                    </div>

                                    {products.map((p, i) => (
                                        <div key={p._key} className="flex items-start gap-2 bg-slate-50/60 border border-slate-100 rounded-[8px] p-2">
                                            <div className="flex-1">
                                                <Input placeholder="Product name" value={p.name} onChange={(e) => updateLine(p._key, "name", e.target.value)}
                                                    className={`h-9 ${submitted && errors[`pname_${i}`] ? "border-red-300 bg-red-50" : ""}`} />
                                            </div>
                                            <div className="w-24">
                                                <Input placeholder="SKU-1" value={p.sku} onChange={(e) => updateLine(p._key, "sku", e.target.value)}
                                                    className={`h-9 font-mono uppercase ${submitted && errors[`psku_${i}`] ? "border-red-300 bg-red-50" : ""}`} />
                                            </div>
                                            <div className="w-28 relative">
                                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                                <Input type="number" placeholder="0.00" value={p.unitPrice} onChange={(e) => updateLine(p._key, "unitPrice", e.target.value)}
                                                    className={`h-9 pl-6 font-mono ${submitted && errors[`pprice_${i}`] ? "border-red-300 bg-red-50" : ""}`} />
                                            </div>
                                            <div className="w-20">
                                                <Input type="number" placeholder="1" value={p.quantity} onChange={(e) => updateLine(p._key, "quantity", e.target.value)}
                                                    className={`h-9 font-mono ${submitted && errors[`pqty_${i}`] ? "border-red-300 bg-red-50" : ""}`} />
                                            </div>
                                            <Button variant="outline" size="icon" onClick={() => updateLine(p._key, "inStock", !p.inStock)}
                                                className={`w-10 h-9 ${p.inStock ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                                                {p.inStock ? "✓" : "✗"}
                                            </Button>
                                            <Button variant="ghost" size="icon" disabled={products.length === 1} onClick={() => setProducts((prev) => prev.filter(x => x._key !== p._key))}
                                                className="w-10 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50">
                                                <Minus className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {grandTotal > 0 && (
                                    <div className="flex justify-end mt-2">
                                        <div className="bg-slate-900 text-slate-50 rounded-[8px] px-4 py-2 flex items-center gap-3">
                                            <span className="text-xs font-medium uppercase tracking-wide">Order Total</span>
                                            <span className="font-mono font-semibold text-base">{formatCurrency(grandTotal)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </ScrollArea>

                    <CardFooter className="p-5 border-t bg-slate-50/60 flex items-center justify-between">
                        <div className="text-xs">
                            {submitted && Object.keys(errors).length > 0 && <span className="text-red-500 font-medium">Fix errors above.</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSubmit}>Create Order</Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}