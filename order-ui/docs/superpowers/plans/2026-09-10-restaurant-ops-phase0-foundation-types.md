# Restaurant Ops Redesign — Phase 0: Foundation Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four incompatible, duplicated data shapes (`orders.ts`'s `Order`, `kds.ts`'s `KdsTicket` untouched for now, `storefront.ts`'s `MenuItem`, `inventory.ts`'s `Product`) with the two unified domain types the redesign spec defines (`Order`, `MenuItem`), plus an additive `Table` stub — with every existing consumer migrated in the same pass, per this repo's `migrate-shared-type` skill.

**Architecture:** Type-first migration. Each task edits one shared type file and every file that imports it (component → hook → service → constants chain), in one atomic pass, verified by `yarn build` at the end of the task — never leaving the old and new shapes both compiling. `kds.ts`'s `KdsTicket` is explicitly NOT touched in this phase (it has no dependency on `orders.ts`/`storefront.ts`/`inventory.ts` today, and retargeting it involves a real design decision — its per-item `completed` flag has no equivalent on the shared `OrderLine` — that belongs to the later KDS-retarget phase, not foundation types).

**Tech Stack:** React + TypeScript + Vite, TanStack React Query, Tailwind (inline classes), lucide-react icons. No test suite — `yarn lint` + `yarn build` (`tsc -b && vite build`) are the only automated safety net.

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md`

## Global Constraints

- Target `Order` shape (verbatim from spec): `channel: "Online"|"Dine-in"|"Phone"`, `fulfillment?: "Pickup"|"Delivery"`, `table?: string`, `customerName`, `customerPhone`, `items: OrderLine[]`, `status: "New"|"Preparing"|"Ready"|"Completed"|"Cancelled"`, `paymentStatus: "Paid"|"Pending"|"PayLater"`, `createdAt`, `total`.
- Target `MenuItem` shape (verbatim from spec): `id, name, description, category, price, image, stockQuantity: number, available: boolean, sizes?: SizeOption[], addons?: AddonOption[]`.
- `Modifier` is `{ label: string; price: number }` only — no `type: "remove"|"addon"` discriminator (that field does not exist in the spec's shape and must be dropped).
- New/rebuilt mock fixtures must be shaped like the eventual real DTO now (per this repo's CLAUDE.md), even for fields the backend doesn't support yet (`channel`, `fulfillment`, `table`, `paymentStatus`, `stockQuantity`, `available`).
- No new data-fetching/state library; no changes to `auth`/`profile`/`src/api/client.ts`.
- `@/*` path alias for all imports — never relative `../../`.
- Every task ends green on `yarn build` (`tsc -b && vite build`) before moving to the next task.

---

## Task 1: Unify the `Order` type and migrate every `orders` feature consumer

**Files:**
- Modify: `src/types/orders.ts` (rewrite)
- Modify: `src/features/orders/constants/orders.constants.ts`
- Modify: `src/features/orders/services/orders.service.ts`
- Modify: `src/features/orders/hooks/useOrders.ts` (no field-level change, verify only)
- Modify: `src/features/orders/hooks/useOrderFilters.ts`
- Modify: `src/features/orders/components/CreateOrderModal.tsx`
- Modify: `src/features/orders/components/DeleteOrderModal.tsx`
- Modify: `src/features/orders/components/OrderRow.tsx`
- Modify: `src/features/orders/components/OrderDrawer.tsx`
- Modify: `src/features/orders/components/ItemCountBadge.tsx`
- Modify: `src/features/orders/components/StatusBadge.tsx` (no field-level change, verify only)
- Modify: `src/features/orders/components/OrdersFeature.tsx`

**Interfaces:**
- Produces: `Order`, `OrderLine`, `Modifier`, `OrderChannel`, `Fulfillment`, `OrderStatus`, `PaymentStatus` exported from `@/types/orders`, consumed by Task 2's storefront work not at all (storefront has its own checkout `CartItem`, untouched) and by the later Orders/KDS-retarget phases.

- [ ] **Step 1: Rewrite `src/types/orders.ts`**

```ts
export type OrderChannel = "Online" | "Dine-in" | "Phone";
export type Fulfillment = "Pickup" | "Delivery";
export type OrderStatus = "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "PayLater";

export interface Modifier {
  label: string;
  price: number;
}

export interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers?: Modifier[];
}

export interface Order {
  id: string;
  channel: OrderChannel;
  fulfillment?: Fulfillment;
  table?: string;
  customerName: string;
  customerPhone: string;
  items: OrderLine[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  total: number;
}
```

(`DraftProduct` is removed from this shared file — it was only ever consumed by `CreateOrderModal.tsx`, so it becomes a component-local `DraftItem` interface in Step 6, not a shared domain type.)

- [ ] **Step 2: Rewrite `src/features/orders/constants/orders.constants.ts`**

```ts
import { Clock, Loader2, PackageCheck, CheckCircle2, XCircle } from "lucide-react";
import type { OrderStatus } from "@/types/orders";

export const STATUS_CONFIG: Record<OrderStatus, { pill: string; dot: string; Icon: React.ElementType }> = {
  New: { pill: "text-blue-700 bg-blue-50 border border-blue-200", dot: "bg-blue-500", Icon: Clock },
  Preparing: { pill: "text-amber-700 bg-amber-50 border border-amber-200", dot: "bg-amber-400", Icon: Loader2 },
  Ready: { pill: "text-violet-700 bg-violet-50 border border-violet-200", dot: "bg-violet-500", Icon: PackageCheck },
  Completed: { pill: "text-emerald-700 bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  Cancelled: { pill: "text-rose-700 bg-rose-50 border border-rose-200", dot: "bg-rose-500", Icon: XCircle },
};

export const FILTERS: Array<OrderStatus | "All"> = ["All", "New", "Preparing", "Ready", "Completed", "Cancelled"];
```

- [ ] **Step 3: Rewrite the mock fixture in `src/features/orders/services/orders.service.ts`**

```ts
import type { Order } from "@/types/orders";

export const ORDERS: Order[] = [
  {
    id: "DEL-2024-8801",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Marcus Chen",
    customerPhone: "+1 (415) 555-0182",
    items: [
      {
        menuItemId: "ITM-001", name: "Double Smash Burger", quantity: 2, unitPrice: 14.99,
        modifiers: [
          { label: "No Onion", price: 0 },
          { label: "Extra Bacon", price: 2.00 },
          { label: "Extra Cheese", price: 1.50 },
        ],
      },
      { menuItemId: "ITM-002", name: "Loaded Fries", quantity: 1, unitPrice: 8.99, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 42.47,
    status: "Preparing",
    paymentStatus: "Paid",
  },
  {
    id: "DEL-2024-8802",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Alicia Torres",
    customerPhone: "+1 (628) 555-0294",
    items: [
      {
        menuItemId: "ITM-003", name: "Margherita Pizza 12\"", quantity: 1, unitPrice: 18.99,
        modifiers: [
          { label: "Extra Crispy Crust", price: 0 },
          { label: "No Basil", price: 0 },
        ],
      },
      {
        menuItemId: "ITM-004", name: "Caramel Latte", quantity: 2, unitPrice: 5.99,
        modifiers: [
          { label: "Oat Milk", price: 0.80 },
          { label: "No Sugar", price: 0 },
        ],
      },
    ],
    createdAt: "2024-11-20",
    total: 43.56,
    status: "New",
    paymentStatus: "Paid",
  },
  {
    id: "DEL-2024-8803",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Jordan Webb",
    customerPhone: "+1 (510) 555-0371",
    items: [
      {
        menuItemId: "ITM-005", name: "Crispy Chicken Sandwich", quantity: 1, unitPrice: 13.49,
        modifiers: [
          { label: "Spicy Level 2", price: 0 },
          { label: "Add Avocado", price: 1.50 },
        ],
      },
      { menuItemId: "ITM-006", name: "Strawberry Milkshake", quantity: 1, unitPrice: 7.49, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 23.48,
    status: "Ready",
    paymentStatus: "Paid",
  },
  {
    id: "PHN-2024-8804",
    channel: "Phone",
    fulfillment: "Pickup",
    customerName: "Priya Nair",
    customerPhone: "+1 (415) 555-0449",
    items: [
      { menuItemId: "ITM-007", name: "Caesar Salad", quantity: 2, unitPrice: 11.99, modifiers: [{ label: "No Croutons", price: 0 }] },
      { menuItemId: "ITM-008", name: "Sparkling Water", quantity: 2, unitPrice: 2.49, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 29.94,
    status: "Completed",
    paymentStatus: "PayLater",
  },
  {
    id: "DEL-2024-8805",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Lena Fischer",
    customerPhone: "+1 (408) 555-0512",
    items: [
      {
        menuItemId: "ITM-009", name: "Truffle Fries", quantity: 1, unitPrice: 10.99,
        modifiers: [{ label: "Extra Truffle Oil", price: 1.50 }],
      },
      { menuItemId: "ITM-010", name: "Chocolate Brownie", quantity: 2, unitPrice: 6.49, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 25.47,
    status: "New",
    paymentStatus: "Paid",
  },
  {
    id: "DEL-2024-8806",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Mateo Rivera",
    customerPhone: "+1 (650) 555-0673",
    items: [
      {
        menuItemId: "ITM-011", name: "Double Smash Burger", quantity: 3, unitPrice: 14.99,
        modifiers: [{ label: "No Pickles", price: 0 }, { label: "Truffle Mayo", price: 1.00 }],
      },
    ],
    createdAt: "2024-11-20",
    total: 50.97,
    status: "Ready",
    paymentStatus: "Paid",
  },
  {
    id: "DIN-2024-8807",
    channel: "Dine-in",
    table: "Table 4",
    customerName: "Sophie Laurent",
    customerPhone: "+1 (415) 555-0821",
    items: [
      { menuItemId: "ITM-012", name: "Margherita Pizza 12\"", quantity: 1, unitPrice: 18.99, modifiers: [] },
      { menuItemId: "ITM-013", name: "Caramel Latte", quantity: 1, unitPrice: 5.99, modifiers: [{ label: "Almond Milk", price: 0.80 }] },
    ],
    createdAt: "2024-11-19",
    total: 25.78,
    status: "Completed",
    paymentStatus: "PayLater",
  },
  {
    id: "DEL-2024-8808",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Kwame Asante",
    customerPhone: "+1 (415) 555-0934",
    items: [
      { menuItemId: "ITM-014", name: "Crispy Chicken Sandwich", quantity: 2, unitPrice: 13.49, modifiers: [{ label: "BBQ Sauce", price: 0 }] },
      { menuItemId: "ITM-015", name: "Loaded Fries", quantity: 2, unitPrice: 8.99, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 47.96,
    status: "Preparing",
    paymentStatus: "Paid",
  },
];
```

- [ ] **Step 4: Update `src/features/orders/hooks/useOrderFilters.ts`**

Change the search predicate's `o.customer` to `o.customerName` — everything else (the `OrderStatus | "All"` filter state, `counts`) is unchanged:

```ts
import { useState, useMemo } from "react";
import type { Order, OrderStatus } from "@/types/orders";

export function useOrderFilters(orders: Order[]) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.status.toLowerCase().includes(q);
      const matchFilter = activeFilter === "All" || o.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, activeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  return { search, setSearch, activeFilter, setActiveFilter, filteredOrders, counts };
}
```

`useOrders.ts` needs no edits — it only holds `Order[]` state generically, no field access.

- [ ] **Step 5: Rewrite `src/features/orders/components/ItemCountBadge.tsx`**

```tsx
import type { OrderLine } from "@/types/orders";

export function ItemCountBadge({ items }: { items: OrderLine[] }) {
    const totalQty = items.reduce((s, p) => s + p.quantity, 0);
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm text-slate-800 font-medium">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            <span className="text-xs text-slate-400 font-mono">{totalQty} unit{totalQty !== 1 ? "s" : ""}</span>
        </div>
    );
}
```

- [ ] **Step 6: Rewrite `src/features/orders/components/CreateOrderModal.tsx`**

Drop the Email and Delivery Address fields (not on the new `Order` type); rename `customer`→`customerName`, `phone`→`customerPhone`; default new manual orders to `channel: "Phone"`, `fulfillment: "Pickup"`, `paymentStatus: "PayLater"` (staff-entered, pay-later per spec — the channel/table/fulfillment picker UI itself is added in the later Orders-retarget phase, not here); status options use the new 5-value `OrderStatus`; local draft item state becomes a component-local `DraftItem` type (not shared) mapped to `OrderLine` on submit.

```tsx
import { useState } from "react";
import { User, Phone, Package, Plus, DollarSign, Minus, X } from "lucide-react";
import type { Order, OrderStatus, OrderLine } from "@/types/orders";
import { useFormat } from "@/features/preferences/hooks/useFormat";

interface DraftItem { _key: string; name: string; quantity: string; unitPrice: string; }
const emptyDraftItem = (): DraftItem => ({ _key: Math.random().toString(36).slice(2), name: "", quantity: "1", unitPrice: "" });

export function CreateOrderModal({ onClose, onSave }: { onClose: () => void; onSave: (o: Order) => void }) {
    const { formatCurrency } = useFormat();
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [status, setStatus] = useState<OrderStatus>("New");
    const [items, setItems] = useState<DraftItem[]>([emptyDraftItem()]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const grandTotal = items.reduce((s, p) => s + (parseFloat(p.quantity) || 0) * (parseFloat(p.unitPrice) || 0), 0);

    function validate() {
        const e: Record<string, string> = {};
        if (!customerName.trim()) e.customerName = "Name required.";
        if (!customerPhone.trim()) e.customerPhone = "Phone required.";
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
        const id = `PHN-${now.getFullYear()}-${8000 + Math.floor(Math.random() * 999)}`;
        const orderItems: OrderLine[] = items.map((p, i) => ({
            menuItemId: `ITM-${String(i + 1).padStart(3, "0")}`,
            name: p.name.trim(),
            quantity: parseInt(p.quantity) || 1,
            unitPrice: parseFloat(p.unitPrice) || 0,
            modifiers: [],
        }));
        onSave({
            id,
            channel: "Phone",
            fulfillment: "Pickup",
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
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Initial Status</label>
                                    <select className={`${inputCls()} cursor-pointer`} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                                        {(["New", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map((s) => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
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
```

- [ ] **Step 7: Update `src/features/orders/components/DeleteOrderModal.tsx`**

Only the `order.customer` reference changes:

```tsx
import { AlertTriangle } from "lucide-react";
import type { Order } from "@/types/orders";

export function DeleteOrderModal({ order, onConfirm, onCancel }: { order: Order; onConfirm: () => void; onCancel: () => void }) {
    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onCancel} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="px-6 py-5 border-b border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-[8px] bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Cancel Order</h3>
                                <p className="text-xs text-slate-500 mt-0.5">This will remove the order from the queue.</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <p className="text-sm text-slate-600">Cancel <span className="font-mono font-medium text-slate-800">{order.id}</span> for <span className="font-medium text-slate-800">{order.customerName}</span>?</p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                        <button onClick={onCancel} className="h-8 px-4 rounded-[8px] border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Keep Order</button>
                        <button onClick={onConfirm} className="h-8 px-4 rounded-[8px] bg-red-600 text-white text-sm font-semibold border border-red-700/50 hover:bg-red-700 transition-colors">Cancel Order</button>
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 8: Rewrite `src/features/orders/components/OrderRow.tsx`**

Add a small channel label, rename fields, swap `ItemCountBadge`'s prop:

```tsx
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Order } from "@/types/orders";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import { StatusBadge } from "./StatusBadge";
import { ItemCountBadge } from "./ItemCountBadge";
import { ActionButton } from "./ActionButton";

export function OrderRow({ order, onView, onEdit, onDelete }: { order: Order; onView: () => void; onEdit: () => void; onDelete: () => void }) {
    const { formatCurrency, formatDate } = useFormat();
    return (
        <div className="orders-table-row grid grid-cols-[1fr_1.2fr_0.8fr_0.7fr_0.8fr_0.7fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-slate-50/80 transition-colors group">
            <span className="font-mono text-sm font-medium text-slate-700 truncate">{order.id}</span>
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{order.customerName}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{order.channel}{order.table ? ` · ${order.table}` : order.fulfillment ? ` · ${order.fulfillment}` : ""}</p>
            </div>
            <ItemCountBadge items={order.items} />
            <span className="text-sm text-slate-500 font-mono text-[13px]">{formatDate(order.createdAt)}</span>
            <span className="text-sm font-semibold text-slate-800 font-mono">{formatCurrency(order.total)}</span>
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionButton icon={Eye} label="View" onClick={onView} />
                <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />
                <ActionButton icon={Trash2} label="Cancel" onClick={onDelete} danger />
            </div>
        </div>
    );
}
```

- [ ] **Step 9: Rewrite `src/features/orders/components/OrderDrawer.tsx`**

Drop the Email/Delivery-Address blocks (not on the new type); show Channel + Table/Fulfillment + Phone instead; `order.products`→`order.items`; modifiers no longer carry a `remove`/`addon` type, so render them uniformly:

```tsx
import { X, ChevronRight, Phone, MapPin } from "lucide-react";
import type { Order, OrderLine } from "@/types/orders";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import { StatusBadge } from "./StatusBadge";

export function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const { formatCurrency, formatDate } = useFormat();
  const lineTotal = (p: OrderLine) => {
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
              <span className="font-mono text-xs text-slate-400 tracking-wider uppercase">{order.channel} Order</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-mono text-xs font-medium text-slate-600">{order.id}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{order.customerName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={order.status} />
              <span className="text-xs text-slate-400 font-mono">{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Order Details</p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{order.table ? "Table" : "Fulfillment"}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 leading-snug">{order.table ?? order.fulfillment ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 font-mono">{order.customerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Items</p>
              <span className="text-xs text-slate-400 font-mono">{order.items.length} line{order.items.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {order.items.map((p, idx) => {
                const total = lineTotal(p);
                const hasModifiers = (p.modifiers ?? []).length > 0;
                return (
                  <div key={`${p.menuItemId}-${idx}`} className="rounded-[8px] border border-slate-100 overflow-hidden bg-slate-50/50">
                    <div className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">×{p.quantity}</span>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatCurrency(p.unitPrice)} each</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-900 font-mono">{formatCurrency(total)}</p>
                      </div>
                    </div>
                    {hasModifiers && (
                      <div className="border-t border-slate-100 px-4 py-2.5 space-y-1.5">
                        {(p.modifiers ?? []).map((mod, mi) => (
                          <div key={mi} className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{mod.label}</span>
                            {mod.price > 0 && <span className="text-xs font-medium text-emerald-600 font-mono">+{formatCurrency(mod.price)}</span>}
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
            <p className="text-2xl font-semibold text-slate-900 font-mono mt-0.5">{formatCurrency(order.total)}</p>
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
```

- [ ] **Step 10: Update `src/features/orders/components/OrdersFeature.tsx`**

Replace the hardcoded 4-status stat grid with the 5-status one and widen the grid:

```tsx
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
                        <p className="text-sm text-slate-400 mt-1">Manage and track active orders across every channel in real time.</p>
                    </div>
                    <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-slate-950 text-slate-50 text-sm font-semibold border border-slate-800 shadow-inner hover:bg-slate-800 active:scale-[0.98] transition-all mt-1">
                        <Plus className="w-3.5 h-3.5" /> New Order
                    </button>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-6">
                    {(["New", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map((s) => {
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
```

- [ ] **Step 11: Re-grep and build**

Run: `grep -rn "\.company\b\|\.deliveryAddress\b\|\.estimatedDelivery\b\|ProductLine\|DraftProduct\|order\.products\|order\.customer\b\|order\.phone\b\|order\.email\b" src/features/orders src/types/orders.ts`
Expected: no matches (every old field/type name is gone).

Run: `yarn build`
Expected: exits 0, no TypeScript errors.

- [ ] **Step 12: Commit**

```bash
git add src/types/orders.ts src/features/orders
git commit -m "feat(orders): unify Order type to channel/fulfillment/table shared model"
```

---

## Task 2: Create the shared `MenuItem` type and migrate `storefront`

**Files:**
- Create: `src/types/menu.ts`
- Modify: `src/types/storefront.ts` (remove `MenuItem`/`SizeOption`/`AddonOption`, keep `CartItem`/`FlowState`)
- Modify: `src/features/storefront/constants/storefront.constants.ts`
- Modify: `src/features/storefront/services/storefront.service.ts`
- Modify: `src/features/storefront/components/MenuCard.tsx`

**Interfaces:**
- Produces: `MenuItem`, `SizeOption`, `AddonOption` exported from `@/types/menu` — this is the file Task 3 (inventory) and the later `features/menu`/`features/tables` phases import from.
- Consumes: nothing from Task 1.

- [ ] **Step 1: Create `src/types/menu.ts`**

```ts
export interface SizeOption {
  id: string;
  label: string;
  price: number;
}

export interface AddonOption {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stockQuantity: number;
  available: boolean;
  sizes?: SizeOption[];
  addons?: AddonOption[];
}
```

- [ ] **Step 2: Rewrite `src/types/storefront.ts`**

```ts
export interface CartItem {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
}

export type FlowState = "feed" | "cart" | "checkout" | "success";
```

- [ ] **Step 3: Update `src/features/storefront/constants/storefront.constants.ts`**

Drop `rating` from every item, add `stockQuantity` and `available`, import `MenuItem` from `@/types/menu`:

```ts
import type { MenuItem } from "@/types/menu";

export const CATEGORIES = ["Burgers", "Chicken", "Pizza", "Salads", "Sides", "Drinks", "Desserts"];

export const MENU: MenuItem[] = [
    {
        id: "m1", name: "Double Smash Burger", price: 14.99, category: "Burgers", stockQuantity: 40, available: true,
        description: "Two smashed beef patties, cheddar, pickles, shredded lettuce, house sauce on a brioche bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Regular (6oz)", price: 0 }, { id: "s2", label: "Double Patty (10oz)", price: 4.00 }],
        addons: [{ id: "a1", label: "Extra Bacon", price: 2.00 }, { id: "a2", label: "Extra Cheese", price: 1.50 }, { id: "a3", label: "Avocado", price: 1.50 }, { id: "a4", label: "Truffle Mayo", price: 1.00 }],
    },
    {
        id: "m2", name: "Crispy Chicken Sandwich", price: 13.49, category: "Chicken", stockQuantity: 35, available: true,
        description: "Double-fried chicken thigh, spicy mayo, coleslaw, pickled jalapeños on a toasted potato roll.",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Classic", price: 0 }, { id: "s2", label: "Spicy +1 Level", price: 0.50 }],
        addons: [{ id: "a1", label: "Add Avocado", price: 1.50 }, { id: "a2", label: "BBQ Sauce", price: 0.50 }],
    },
    {
        id: "m3", name: "Margherita Pizza 12\"", price: 18.99, category: "Pizza", stockQuantity: 20, available: true,
        description: "San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil on a hand-tossed crust.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "10\" Personal", price: -3.00 }, { id: "s2", label: "12\" Standard", price: 0 }, { id: "s3", label: "16\" Large", price: 6.00 }],
        addons: [{ id: "a1", label: "Extra Cheese", price: 2.00 }, { id: "a2", label: "Truffle Oil", price: 2.50 }, { id: "a3", label: "Pepperoni", price: 2.50 }],
    },
    {
        id: "m4", name: "Caesar Salad", price: 11.99, category: "Salads", stockQuantity: 25, available: true,
        description: "Romaine hearts, house-made Caesar dressing, Parmigiano-Reggiano, anchovy croutons.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Grilled Chicken", price: 4.00 }, { id: "a2", label: "Jumbo Shrimp", price: 5.50 }],
    },
    {
        id: "m5", name: "Truffle Loaded Fries", price: 10.99, category: "Sides", stockQuantity: 30, available: true,
        description: "Hand-cut fries, truffle oil, aged Parmesan, fresh herbs, garlic aioli dipping sauce.",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Truffle Oil", price: 1.50 }, { id: "a2", label: "Bacon Crumbles", price: 1.50 }],
    },
    {
        id: "m6", name: "Strawberry Milkshake", price: 7.49, category: "Drinks", stockQuantity: 50, available: true,
        description: "House-churned vanilla ice cream blended with fresh strawberry compote, topped with whipped cream.",
        image: "https://images.unsplash.com/photo-1541658016709-82763f21784a?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Regular (16oz)", price: 0 }, { id: "s2", label: "Large (24oz)", price: 2.00 }],
        addons: [{ id: "a1", label: "Extra Scoop", price: 1.50 }],
    },
    {
        id: "m7", name: "Caramel Latte", price: 5.99, category: "Drinks", stockQuantity: 45, available: true,
        description: "Double-shot espresso, steamed whole milk, house caramel drizzle, served hot or iced.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Hot", price: 0 }, { id: "s2", label: "Iced", price: 0.50 }],
        addons: [{ id: "a1", label: "Oat Milk", price: 0.80 }, { id: "a2", label: "Almond Milk", price: 0.80 }, { id: "a3", label: "Extra Shot", price: 1.00 }],
    },
    {
        id: "m8", name: "Chocolate Brownie", price: 6.49, category: "Desserts", stockQuantity: 15, available: true,
        description: "Warm fudge brownie, single-origin chocolate, salted caramel swirl, served with vanilla bean ice cream.",
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Ice Cream", price: 1.50 }, { id: "a2", label: "Hot Fudge Sauce", price: 0.75 }],
    },
];
```

- [ ] **Step 4: Update `src/features/storefront/services/storefront.service.ts`**

Only the import source changes:

```ts
import { MENU } from "../constants/storefront.constants";
import type { MenuItem } from "@/types/menu";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        // Simulated API delay
        return new Promise((resolve) => setTimeout(() => resolve(MENU), 300));
    }
};
```

- [ ] **Step 5: Update `src/features/storefront/components/MenuCard.tsx`**

Drop the star-rating badge (no `rating` field on the new type) and import from `@/types/menu`:

```tsx
import { Plus } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export const MenuCard = ({ item, onSelect }: { item: MenuItem; onSelect: () => void }) => {
    return (
        <button
            onClick={onSelect}
            className="w-full text-left bg-white rounded-[8px] border border-slate-100 overflow-hidden flex gap-3 hover:shadow-md hover:shadow-slate-900/8 hover:border-slate-200 transition-all active:scale-[0.99]"
        >
            <div className="flex-1 p-4 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-sm font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                </div>
            </div>
            <div className="w-24 h-24 flex-shrink-0 relative self-center mr-3">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[8px]" />
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center shadow-md">
                    <Plus className="w-3 h-3 text-white" />
                </div>
            </div>
        </button>
    );
};
```

- [ ] **Step 6: Re-grep and build**

Run: `grep -rn "\.rating\b" src/features/storefront src/types/storefront.ts src/types/menu.ts`
Expected: no matches.

Run: `grep -rln "MenuItem" src/features/storefront src/types/storefront.ts | xargs grep -L "@/types/menu"`
Expected: no output (every remaining `MenuItem` reference in storefront imports from `@/types/menu`, not `@/types/storefront`).

Run: `yarn build`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/types/menu.ts src/types/storefront.ts src/features/storefront
git commit -m "feat(menu): introduce shared MenuItem type, migrate storefront off local MenuItem"
```

---

## Task 3: Migrate `inventory` onto the shared `MenuItem`, delete `src/types/inventory.ts`

**Files:**
- Delete: `src/types/inventory.ts`
- Modify: `src/features/inventory/services/inventory.service.ts`
- Modify: `src/features/inventory/constants/inventory.constants.ts`
- Modify: `src/features/inventory/components/ProductCard.tsx`
- Modify: `src/features/inventory/components/AddProductModal.tsx`

**Interfaces:**
- Consumes: `MenuItem` from `@/types/menu` (Task 2).
- Produces: nothing new — `useInventory.ts` and `InventoryFeature.tsx` need no edits (they don't reference `Product`/`MenuItem` fields directly beyond what's already generic: `p.name`, `p.category`, `p.description`, `p.available` all still exist on `MenuItem`, and `modifiersCount`'s `p.modifiers` becomes `p.addons` in this task).

- [ ] **Step 1: Delete `src/types/inventory.ts`**

Run: `rm src/types/inventory.ts`

- [ ] **Step 2: Rewrite `src/features/inventory/services/inventory.service.ts`**

```ts
import type { MenuItem } from "@/types/menu";
import { MOCK_PRODUCTS } from "../constants/inventory.constants";

export const inventoryService = {
    getProducts: async (): Promise<MenuItem[]> => {
        // TODO: Connect real backend endpoint when ready
        // const { data } = await api.get('/api/v1/products');
        // return data;

        // Simulating network delay for realistic state testing
        return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PRODUCTS]), 400));
    },

    createProduct: async (product: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
        // const { data } = await api.post('/api/v1/products', product);
        // return data;

        return new Promise((resolve) => {
            const newProduct = {
                ...product,
                id: `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
            } as MenuItem;
            setTimeout(() => resolve(newProduct), 500);
        });
    },

    deleteProduct: async (_id: string): Promise<void> => {
        // await api.delete(`/api/v1/products/${_id}`);

        return new Promise((resolve) => setTimeout(resolve, 300));
    }
};
```

- [ ] **Step 3: Rewrite `src/features/inventory/constants/inventory.constants.ts`**

`basePrice`→`price`, `modifiers`→`addons` (each modifier gains a generated `id`), add `stockQuantity` (varied values, useful later for the low-stock view the spec's Home/Menu phases add):

```ts
import type { MenuItem } from "@/types/menu";

export const CATEGORIES = [
    "All",
    "Burgers",
    "Chicken",
    "Pizza",
    "Salads",
    "Sides",
    "Drinks",
    "Desserts"
];

export const MOCK_PRODUCTS: MenuItem[] = [
    {
        id: "PRD-001",
        name: "Double Smash Burger",
        description: "Two smashed beef patties, cheddar, pickles, shredded lettuce, house sauce on a brioche bun.",
        category: "Burgers",
        price: 14.99,
        stockQuantity: 18,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Patty", price: 4.00 }, { id: "a2", label: "Extra Bacon", price: 2.00 }, { id: "a3", label: "Avocado", price: 1.50 }],
        available: true,
    },
    {
        id: "PRD-002",
        name: "Crispy Chicken Sandwich",
        description: "Double-fried chicken thigh, spicy mayo, coleslaw, pickled jalapeños on a toasted potato roll.",
        category: "Chicken",
        price: 13.49,
        stockQuantity: 22,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Spicy Upgrade", price: 0.50 }, { id: "a2", label: "Extra Sauce", price: 0.50 }],
        available: true,
    },
    {
        id: "PRD-003",
        name: "Margherita Pizza 12\"",
        description: "San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil on a hand-tossed crust.",
        category: "Pizza",
        price: 18.99,
        stockQuantity: 9,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Cheese", price: 2.00 }, { id: "a2", label: "Truffle Oil", price: 2.50 }],
        available: true,
    },
    {
        id: "PRD-004",
        name: "Caesar Salad",
        description: "Romaine hearts, house-made Caesar dressing, Parmigiano-Reggiano, anchovy croutons.",
        category: "Salads",
        price: 11.99,
        stockQuantity: 25,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Grilled Chicken", price: 4.00 }, { id: "a2", label: "Shrimp", price: 5.50 }],
        available: true,
    },
    {
        id: "PRD-005",
        name: "Truffle Loaded Fries",
        description: "Hand-cut fries, truffle oil, aged Parmesan, fresh herbs, garlic aioli dipping sauce.",
        category: "Sides",
        price: 10.99,
        stockQuantity: 4,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Truffle", price: 1.50 }, { id: "a2", label: "Bacon Crumbles", price: 1.50 }],
        available: true,
    },
    {
        id: "PRD-006",
        name: "Strawberry Milkshake",
        description: "House-churned vanilla ice cream, fresh strawberry compote, topped with whipped cream.",
        category: "Drinks",
        price: 7.49,
        stockQuantity: 30,
        image: "https://images.unsplash.com/photo-1541658016709-82763f21784a?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Scoop", price: 1.50 }],
        available: true,
    },
    {
        id: "PRD-007",
        name: "Caramel Latte",
        description: "Double-shot espresso, steamed whole milk, house caramel drizzle, served hot or iced.",
        category: "Drinks",
        price: 5.99,
        stockQuantity: 28,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Oat Milk", price: 0.80 }, { id: "a2", label: "Almond Milk", price: 0.80 }, { id: "a3", label: "Extra Shot", price: 1.00 }],
        available: true,
    },
    {
        id: "PRD-008",
        name: "Chocolate Brownie",
        description: "Warm fudge brownie, single-origin chocolate, salted caramel swirl, vanilla bean ice cream.",
        category: "Desserts",
        price: 6.49,
        stockQuantity: 12,
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Ice Cream", price: 1.50 }, { id: "a2", label: "Chocolate Sauce", price: 0.75 }],
        available: true,
    },
    {
        id: "PRD-009",
        name: "Spicy Chicken Wings",
        description: "Crispy double-fried wings tossed in house buffalo or Korean gochujang glaze, 8 pieces.",
        category: "Chicken",
        price: 15.99,
        stockQuantity: 0,
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=480&h=320&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Sauce", price: 0.50 }, { id: "a2", label: "Ranch Dip", price: 0.75 }, { id: "a3", label: "Blue Cheese Dip", price: 0.75 }],
        available: false,
    },
];
```

- [ ] **Step 4: Rewrite `src/features/inventory/components/ProductCard.tsx`**

`Product`→`MenuItem`, `basePrice`→`price`, `modifiers`→`addons`:

```tsx
import { Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import type { MenuItem } from "@/types/menu";

interface ProductCardProps {
    product: MenuItem;
    onEdit: (product: MenuItem) => void;
    onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const hasAddons = product.addons && product.addons.length > 0;
    const formatPrice = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div className={`group bg-white rounded-[8px] border overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-slate-900/8 hover:-translate-y-0.5 ${product.available ? "border-slate-100" : "border-slate-100 opacity-70"}`}>
            {/* Image Overlay Header */}
            <div className="relative overflow-hidden bg-slate-100 h-44 flex-shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                {/* Actions - Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(product)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-slate-700 hover:bg-white shadow-md transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-red-500 hover:bg-white shadow-md transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Badges */}
                {!product.available && (
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm">
                        Unavailable
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm border border-white/50">
                    {product.category}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col flex-1 p-4">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 font-outfit">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {product.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="font-mono text-base font-semibold text-slate-900">
                        {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {hasAddons && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-[8px]">
                                <SlidersHorizontal className="w-2.5 h-2.5" />
                                {product.addons!.length} addon{product.addons!.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">
                            {product.id}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 5: Update `src/features/inventory/components/AddProductModal.tsx`**

`basePrice`→`price`, `modifiers: []`→`addons: []`, add `stockQuantity: 0` (new items start out-of-stock until the future Menu-CRUD phase adds a stock input):

```tsx
    const handleSubmit = () => {
        onSubmit({
            name,
            description: desc,
            price: parseFloat(price) || 0,
            category,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format", // Placeholder for actual upload
            stockQuantity: 0,
            addons: [],
            available: true
        });
    };
```

(Only this function body changes — every other line of the file, including all JSX, is unchanged.)

- [ ] **Step 6: Re-grep and build**

Run: `grep -rn "\.basePrice\b\|\.modifiers\b\|from \"@/types/inventory\"\|from '@/types/inventory'" src/features/inventory`
Expected: no matches.

Run: `yarn build`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add -A src/types/inventory.ts src/features/inventory
git commit -m "feat(inventory): migrate Product to shared MenuItem, delete duplicate type"
```

---

## Task 4: Add the `Table` type stub

**Files:**
- Create: `src/types/tables.ts`

**Interfaces:**
- Produces: `Table` exported from `@/types/tables` — no consumers yet (the `features/tables` module that uses it is a later phase). This task exists purely so the shared-types layer matches the spec's three target types before any dependent feature work begins.

- [ ] **Step 1: Create `src/types/tables.ts`**

```ts
export interface Table {
  id: string;
  name: string;
  qrCodeUrl: string;
}
```

- [ ] **Step 2: Build**

Run: `yarn build`
Expected: exits 0 (new unused-but-exported file compiles cleanly).

- [ ] **Step 3: Commit**

```bash
git add src/types/tables.ts
git commit -m "feat(tables): add shared Table type stub for upcoming tables feature"
```

---

## Task 5: Navigation cleanup and dead-code removal

**Files:**
- Modify: `src/layouts/app-layout/navigation.ts`
- Delete: `src/features/batches/` (confirmed empty: only empty `components/`, `hooks/`, `services/` subdirectories, no files)

**Interfaces:**
- Consumes: nothing from Tasks 1-4.
- Produces: nothing consumed elsewhere — pure cleanup.

- [ ] **Step 1: Remove the "Security" entry from `src/layouts/app-layout/navigation.ts`**

```ts
import {
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  Shield,
  Users,
  UserCog,
  KeySquare,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  roles?: Role[];
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: Home, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/inventory", label: "Inventory", icon: Package, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
];

export const ADMINISTRATION_ITEMS: NavItem[] = [
  {
    label: "Administration",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      { to: "/administration/users", label: "Users", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
      { to: "/administration/administrators", label: "Administrators", icon: UserCog, roles: ["SUPER_ADMIN"] },
      { to: "/administration/roles", label: "Roles & Permissions", icon: KeySquare, roles: ["SUPER_ADMIN"] },
    ],
  },
];
```

(The `/security` → `/settings` redirect route in `src/app/router.tsx:129-132` stays — it's a harmless legacy-URL fallback, not a nav item, and the spec only calls out removing the nav entry.)

- [ ] **Step 2: Delete the empty batches folder**

Run: `rm -rf src/features/batches`

- [ ] **Step 3: Re-grep and build**

Run: `grep -rn "features/batches\|/security\", label: \"Security\"" src`
Expected: no matches.

Run: `yarn lint && yarn build`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A src/layouts/app-layout/navigation.ts src/features/batches
git commit -m "chore: remove redundant Security nav item and empty batches feature folder"
```

---

## Task 6: Full-phase verification

**Files:** none (verification only)

- [ ] **Step 1: Full re-grep for every retired symbol across the whole repo**

Run: `grep -rn "ProductLine\|DraftProduct\|from \"@/types/inventory\"\|order\.products\b\|order\.company\b\|order\.deliveryAddress\b\|order\.estimatedDelivery\b\|\.rating\b" src`

Expected: no matches. If any remain, fix them before proceeding — this is the exit condition the `migrate-shared-type` skill requires, not "the build passes" alone.

- [ ] **Step 2: Full lint + build**

Run: `yarn lint`
Expected: exits 0.

Run: `yarn build`
Expected: exits 0.

- [ ] **Step 3: Manual smoke check (only if something above looks uncertain)**

Only if `yarn build` passes but you want a real-browser sanity check before calling Phase 0 done: use the `verify-ui` skill to load `/orders` and `/inventory` with the test credentials in the `order-ui-test-login` memory, confirm the Orders table renders with the 5-status filter bar and the Inventory grid renders with prices/addon counts. Skip this step entirely if `yarn build`/`yarn lint` are clean and a source read of the changed files already confirms correctness — per this repo's CLAUDE.md, browser verification is for behavior, not for discovering fixes, and Playwright should only be used when something is genuinely uncertain.

- [ ] **Step 4: Final commit if Step 3 produced fixes**

Only if Step 3 required code changes:

```bash
git add -A
git commit -m "fix: address smoke-test findings from Phase 0 foundation migration"
```
