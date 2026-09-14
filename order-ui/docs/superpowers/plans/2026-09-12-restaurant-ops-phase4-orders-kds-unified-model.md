# Restaurant Ops Phase 4: Orders/KDS Repoint to Shared Order Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `features/orders` and `features/kds` two views over one real data source — the shared `Order`/`OrderStatus` model in `src/types/orders.ts` (defined in Phase 0) — so a status change made in either feature is visible in the other, and retire `types/kds.ts`'s incompatible `KdsTicket`/`TicketItem`/`TicketStatus` types entirely.

**Architecture:** `features/orders`' mock service (`orders.service.ts`) is brought in line with the established repo pattern (`menuService`/`tablesService`/Phase 3's `tableMenuService`): a module-level mutable array behind async functions (`getOrders`, `createOrder`, `updateOrderStatus`), consumed via TanStack Query with the cache key `["orders"]`. `features/kds` is retargeted to consume that *same* service and the *same* `["orders"]` cache key — not a parallel dataset — filtered client-side to the three kitchen-relevant statuses (`New`/`Preparing`/`Ready`). This is the one deliberate architectural difference from Phase 3's `table-menu` (which intentionally used a *separate* cache key to avoid one key backing two differently-filtered shapes): here, KDS and Orders must resolve to literally the same record, so sharing `["orders"]` is correct — invalidating it from either feature refreshes both. KDS's per-line-item "completed" checklist has no analog in the unified `Order` (which tracks status at the order level only) and is dropped in favor of a single, real, order-level "advance status" action per ticket — replacing a footer button that today has no `onClick` at all. The fabricated `timer`/`isRush`/`timerState`/`isActive` ticket fields are dropped rather than reinvented with fake data, since `Order.createdAt` is date-only (no time component) and can't back a real elapsed-timer; a real countdown is a future-phase/backend-gap concern, not this one's.

**Tech Stack:** React 19 + TypeScript + Vite, TanStack React Query 5, existing `features/tables` (Phase 1/3) for the Dine-in table picker.

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` — sections "Order model" (the `Order`/`OrderLine`/`Modifier` shape, already implemented in `src/types/orders.ts`), "`features/orders` — retarget to the unified Order model", and "`features/kds` — becomes the canonical status-change surface". Also `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md`'s "What's next: Phase 4" section, which is the authoritative goal statement this plan argues from.

## Global Constraints

- `MenuItem` ids `m1`-`m9` in `src/features/menu/constants/menu.constants.ts` are load-bearing — `orders.service.ts`'s mock order lines reference `m1`-`m8` by id today and must keep referencing the exact same ids after this phase's edits (the mock `ORDERS` array's item data is carried over verbatim, only its containing structure changes).
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists in this repo — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the only automated safety net.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo; use `git diff`/`git show` instead if you need to inspect something.
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare `git commit -m "..."` — this repo has pre-existing, unrelated staged/modified work (notifications/profile/settings/layouts files) from other in-progress work that must never be swept into a commit here.
- WhatsApp notification-on-status-change is explicitly OUT of scope (spec flags it as a backend/integration dependency, not frontend-fakeable) — do not build a fake notification UI for it anywhere in this phase.
- Limit Playwright/browser verification to *confirming* a fix already reasoned out from source — one dispatch at the very end, not iterative.
- Both `features/orders` and `features/kds` render inside the authenticated `ProtectedLayout`/`AppLayout` shell today and continue to — this phase does not touch routing.

---

### Task 1: Retarget `orders.service.ts` and `useOrders.ts` to the standard mock-service pattern

**Files:**
- Modify: `src/features/orders/services/orders.service.ts`
- Modify: `src/features/orders/hooks/useOrders.ts`

**Interfaces:**
- Produces: `ordersService.getOrders(): Promise<Order[]>`, `ordersService.createOrder(input: Omit<Order, "id">): Promise<Order>` (the service now generates the `id`, matching `menuService.createMenuItem`/`tablesService.createTable`'s existing convention of taking the entity minus its id), `ordersService.updateOrderStatus(id: string, status: OrderStatus): Promise<void>`. `useOrders()` returns `{ orders: Order[]; isLoading: boolean; createOrder: (input: Omit<Order, "id">) => void; isCreating: boolean; updateOrderStatus: (id: string, status: OrderStatus) => void; isUpdatingStatus: boolean }`.
- Consumed by: Task 2 (`OrdersFeature.tsx`, `DeleteOrderModal.tsx` wiring), Task 3 (`CreateOrderModal.tsx`'s `onSave` prop type must match `createOrder`'s new signature), Task 4 (KDS's hooks import `ordersService` directly, sharing the `["orders"]` cache key this task establishes).

**Current state (read before editing):**

`src/features/orders/services/orders.service.ts` currently exports a single top-level `ORDERS: Order[]` constant (154 lines total, 8 mock orders using real `m1`-`m8` `MenuItem` ids) — no functions at all. `src/features/orders/hooks/useOrders.ts` imports that raw array directly into `useState`, with only `deleteOrder` (array-splice) and `createOrder` (array-prepend, taking a full `Order` including `id`) — no status-update capability exists anywhere in this feature today.

- [ ] **Step 1: Rewrite `orders.service.ts`**

Keep every existing mock order object in the array byte-for-byte identical (same ids, same `menuItemId`s, same totals) — only wrap them in the new structure:

```typescript
import type { Order, OrderStatus } from "@/types/orders";

let orders: Order[] = [
  {
    id: "DEL-2024-8801",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Marcus Chen",
    customerPhone: "+1 (415) 555-0182",
    items: [
      {
        menuItemId: "m1", name: "Double Smash Burger", quantity: 2, unitPrice: 14.99,
        modifiers: [
          { label: "No Onion", price: 0 },
          { label: "Extra Bacon", price: 2.00 },
          { label: "Extra Cheese", price: 1.50 },
        ],
      },
      { menuItemId: "m5", name: "Truffle Loaded Fries", quantity: 1, unitPrice: 8.99, modifiers: [] },
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
        menuItemId: "m3", name: "Margherita Pizza 12\"", quantity: 1, unitPrice: 18.99,
        modifiers: [
          { label: "Extra Crispy Crust", price: 0 },
          { label: "No Basil", price: 0 },
        ],
      },
      {
        menuItemId: "m7", name: "Caramel Latte", quantity: 2, unitPrice: 5.99,
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
        menuItemId: "m2", name: "Crispy Chicken Sandwich", quantity: 1, unitPrice: 13.49,
        modifiers: [
          { label: "Spicy Level 2", price: 0 },
          { label: "Add Avocado", price: 1.50 },
        ],
      },
      { menuItemId: "m6", name: "Strawberry Milkshake", quantity: 1, unitPrice: 7.49, modifiers: [] },
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
      { menuItemId: "m4", name: "Caesar Salad", quantity: 2, unitPrice: 11.99, modifiers: [{ label: "No Croutons", price: 0 }] },
      { menuItemId: "NM-SPARKLING-WATER", name: "Sparkling Water", quantity: 2, unitPrice: 2.49, modifiers: [] },
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
        menuItemId: "m5", name: "Truffle Loaded Fries", quantity: 1, unitPrice: 10.99,
        modifiers: [{ label: "Extra Truffle Oil", price: 1.50 }],
      },
      { menuItemId: "m8", name: "Chocolate Brownie", quantity: 2, unitPrice: 6.49, modifiers: [] },
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
        menuItemId: "m1", name: "Double Smash Burger", quantity: 3, unitPrice: 14.99,
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
      { menuItemId: "m3", name: "Margherita Pizza 12\"", quantity: 1, unitPrice: 18.99, modifiers: [] },
      { menuItemId: "m7", name: "Caramel Latte", quantity: 1, unitPrice: 5.99, modifiers: [{ label: "Almond Milk", price: 0.80 }] },
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
      { menuItemId: "m2", name: "Crispy Chicken Sandwich", quantity: 2, unitPrice: 13.49, modifiers: [{ label: "BBQ Sauce", price: 0 }] },
      { menuItemId: "m5", name: "Truffle Loaded Fries", quantity: 2, unitPrice: 8.99, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 47.96,
    status: "Preparing",
    paymentStatus: "Paid",
  },
];

const ID_PREFIX: Record<Order["channel"], string> = {
  "Online": "DEL",
  "Dine-in": "DIN",
  "Phone": "PHN",
};

export const ordersService = {
  getOrders: async (): Promise<Order[]> => {
    // TODO: connect-backend — GET /api/v1/orders
    return new Promise((resolve) => setTimeout(() => resolve([...orders]), 300));
  },

  createOrder: async (input: Omit<Order, "id">): Promise<Order> => {
    // TODO: connect-backend — POST /api/v1/orders
    return new Promise((resolve) => {
      const id = `${ID_PREFIX[input.channel]}-${new Date().getFullYear()}-${8000 + Math.floor(Math.random() * 999)}`;
      const newOrder: Order = { ...input, id };
      orders = [newOrder, ...orders];
      setTimeout(() => resolve(newOrder), 400);
    });
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<void> => {
    // TODO: connect-backend — PATCH /api/v1/orders/{id}/status
    return new Promise((resolve) => {
      orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
      setTimeout(resolve, 300);
    });
  },
};
```

- [ ] **Step 2: Rewrite `useOrders.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "@/types/orders";
import { ordersService } from "@/features/orders/services/orders.service";

export function useOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersService.getOrders,
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Order, "id">) => ordersService.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    orders,
    isLoading,
    createOrder: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateOrderStatus: (id: string, status: OrderStatus) => updateStatusMutation.mutate({ id, status }),
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
```

- [ ] **Step 3: Verify build**

Run: `yarn build`
Expected: TypeScript errors ARE expected at this point in `OrdersFeature.tsx`/`DeleteOrderModal.tsx`/`CreateOrderModal.tsx` (they still call the old `deleteOrder`/pass full `Order` objects) — Tasks 2-3 fix those. Confirm the errors are confined to those three files and `orders.service.ts`/`useOrders.ts` themselves compile with no errors (check the `tsc` output lists only the three consumer files, not the two files this step edited).

- [ ] **Step 4: Commit**

```bash
git add src/features/orders/services/orders.service.ts src/features/orders/hooks/useOrders.ts
git commit -m "$(cat <<'EOF'
feat(orders): retarget orders.service.ts to the standard mock-service pattern

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XbkrhhmxHSPaRw5msg29un
EOF
)" -- src/features/orders/services/orders.service.ts src/features/orders/hooks/useOrders.ts
```

---

### Task 2: Wire `OrdersFeature.tsx`/`DeleteOrderModal.tsx` to the new hook — cancel becomes a status change, not a deletion

**Files:**
- Modify: `src/features/orders/components/OrdersFeature.tsx`
- Modify: `src/features/orders/components/DeleteOrderModal.tsx`

**Interfaces:**
- Consumes: `useOrders()`'s new shape from Task 1 (`isLoading`, `updateOrderStatus`, and `createOrder` now expecting `Omit<Order, "id">`).
- Produces: nothing new consumed by later tasks — `DeleteOrderModal`'s `onConfirm`/`onCancel` prop contract is unchanged, only what `OrdersFeature.tsx` does inside `onConfirm` changes.

**Current state (read before editing):**

`OrdersFeature.tsx` currently: `const { orders, deleteOrder, createOrder } = useOrders();`, no loading state anywhere, and:
```tsx
{deleteTarget && <DeleteOrderModal order={deleteTarget} onConfirm={() => { deleteOrder(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
```
The orders table area currently only branches on `filteredOrders.length === 0`, with no loading branch — since `orders` used to come from `useState(ORDERS)` (synchronous), there was never a loading gap; after Task 1, `orders` starts empty until the query resolves.

`DeleteOrderModal.tsx` currently reads: `<p className="text-xs text-slate-500 mt-0.5">This will remove the order from the queue.</p>` — inaccurate after this task, since the order is no longer removed.

- [ ] **Step 1: Update `OrdersFeature.tsx`'s hook destructure**

Change:
```tsx
const { orders, deleteOrder, createOrder } = useOrders();
```
to:
```tsx
const { orders, isLoading, createOrder, updateOrderStatus } = useOrders();
```

- [ ] **Step 2: Add a loading branch to the orders table**

Find:
```tsx
{filteredOrders.length === 0 ? (
    <div className="py-16 flex flex-col items-center gap-3">
        <Package className="w-8 h-8 text-slate-200" />
        <div className="text-center"><p className="text-sm font-medium text-slate-500">No orders found</p><p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filter.</p></div>
    </div>
) : (
```
Replace with:
```tsx
{isLoading ? (
    <div className="py-16 flex justify-center">
        <p className="text-sm text-slate-400 font-mono animate-pulse">Loading orders...</p>
    </div>
) : filteredOrders.length === 0 ? (
    <div className="py-16 flex flex-col items-center gap-3">
        <Package className="w-8 h-8 text-slate-200" />
        <div className="text-center"><p className="text-sm font-medium text-slate-500">No orders found</p><p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filter.</p></div>
    </div>
) : (
```
(the closing `)}` for this ternary chain, and the `<div className="divide-y ...">` branch after it, are unchanged — only the opening condition gains one new branch).

- [ ] **Step 3: Change the cancel action to a status update**

Change:
```tsx
{deleteTarget && <DeleteOrderModal order={deleteTarget} onConfirm={() => { deleteOrder(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
```
to:
```tsx
{deleteTarget && <DeleteOrderModal order={deleteTarget} onConfirm={() => { updateOrderStatus(deleteTarget.id, "Cancelled"); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
```

- [ ] **Step 4: Fix `DeleteOrderModal.tsx`'s now-inaccurate copy**

Change:
```tsx
<p className="text-xs text-slate-500 mt-0.5">This will remove the order from the queue.</p>
```
to:
```tsx
<p className="text-xs text-slate-500 mt-0.5">This will mark the order as Cancelled.</p>
```

- [ ] **Step 5: Verify build**

Run: `yarn build`
Expected: `OrdersFeature.tsx`/`DeleteOrderModal.tsx` now compile clean. `CreateOrderModal.tsx` still errors (Task 3 fixes it) — confirm the remaining error is confined to that one file.

- [ ] **Step 6: Commit**

```bash
git add src/features/orders/components/OrdersFeature.tsx src/features/orders/components/DeleteOrderModal.tsx
git commit -m "$(cat <<'EOF'
fix(orders): cancel sets status to Cancelled instead of deleting the order

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XbkrhhmxHSPaRw5msg29un
EOF
)" -- src/features/orders/components/OrdersFeature.tsx src/features/orders/components/DeleteOrderModal.tsx
```

---

### Task 3: Add a channel/table/fulfillment picker to `CreateOrderModal.tsx`

**Files:**
- Modify: `src/features/orders/components/CreateOrderModal.tsx`

**Interfaces:**
- Consumes: `useTables()` from `src/features/tables/hooks/useTables.ts` (existing, unchanged — returns `{ tables: Table[]; isLoading; ... }`, `Table { id, name, qrCodeUrl }`), `ordersService.createOrder`'s new `Omit<Order, "id">` input shape (Task 1) via the `createOrder` mutate function passed down as `onSave`.
- Produces: `CreateOrderModal`'s `onSave` prop type changes from `(o: Order) => void` to `(o: Omit<Order, "id">) => void` — matches exactly what `OrdersFeature.tsx` already passes (`createOrder` from Task 1/2, no further change needed there).

**Current state (read before editing):**

`CreateOrderModal.tsx` currently hardcodes `channel: "Phone", fulfillment: "Pickup"` in its `handleSubmit`, generates its own `id` (`PHN-${year}-${random}`), and has no channel/table UI at all — just Name, Phone, and Initial Status fields. Per the spec, staff create orders for exactly two channels here — `Phone` (staff enters on the customer's behalf) and `Dine-in` (waiter enters after the customer views the QR menu) — `Online` orders are self-service via the shared link and are never staff-created, so this picker offers only those two.

- [ ] **Step 1: Rewrite `CreateOrderModal.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `yarn build`
Expected: clean, zero TypeScript errors anywhere in `src/features/orders/` (Tasks 1-3 together fully resolve `features/orders`).

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/components/CreateOrderModal.tsx
git commit -m "$(cat <<'EOF'
feat(orders): add channel/table/fulfillment picker to CreateOrderModal

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XbkrhhmxHSPaRw5msg29un
EOF
)" -- src/features/orders/components/CreateOrderModal.tsx
```

---

### Task 4: Retarget `features/kds` onto the shared `Order` model

**Files:**
- Delete: `src/types/kds.ts`
- Delete: `src/features/kds/services/kds.service.ts`
- Modify: `src/features/kds/constants/kds.constants.ts`
- Modify: `src/features/kds/hooks/useKdsOrders.ts`
- Modify: `src/features/kds/hooks/useKdsSummary.ts`
- Modify: `src/features/kds/hooks/useUpdateKdsStatus.ts`
- Modify: `src/features/kds/components/KdsTicket.tsx`
- Modify: `src/features/kds/components/StatusBadge.tsx`
- Modify: `src/features/kds/components/KdsFeature.tsx`

**Interfaces:**
- Consumes: `ordersService.getOrders`/`ordersService.updateOrderStatus` from Task 1, sharing the exact `["orders"]` TanStack Query cache key `useOrders()` (Task 1) uses — this is what makes a KDS-driven status change visible on the Orders admin page and vice versa.
- Produces: `useKdsOrders()` returns a `useQuery` result whose `data` is `Order[]` filtered to `New`/`Preparing`/`Ready`. `useKdsSummary(orders: Order[]): ProductionSummaryItem[]` (now a pure synchronous derivation, not a query). `useUpdateKdsStatus()` returns a mutation taking `{ orderId: string; status: OrderStatus }`. `getTicketChannelLabel` and `NEXT_STATUS` exported from `kds.constants.ts` for `KdsTicket.tsx`/`KdsFeature.tsx` to share.

This task is kept as one unit rather than split further: `KdsFeature.tsx`'s JSX wiring to `<KdsTicket>` (the mutation payload shape, the prop names) cannot compile correctly unless `KdsTicket.tsx` changes in the same commit — splitting them would leave an intermediate task with a broken build.

**Current state (read before editing):**

`src/types/kds.ts` defines `TicketStatus` (lowercase `'pending'|'preparing'|'ready'`), `Modifier { name; color? }`, `TicketItem { id; qty; name; completed; modifiers? }`, `KdsTicket { id; customer; type: 'DELIVERY'|'DINE-IN'|'PICKUP'; status; isRush; timer; timerState; isActive; items }`, `KdsSummaryItem { qty; name }`. Confirmed by grep: exactly 3 consumers, all inside `features/kds` (`kds.service.ts`, `components/StatusBadge.tsx`, `components/KdsTicket.tsx`) — safe to delete once those 3 files stop importing it (this task migrates all 3).

`kds.service.ts` holds its own disconnected mock dataset (`mockTickets`, ids like `"#ORD-8802"` — unrelated to Orders' `"DEL-2024-8801"` scheme) and per-line-item `updateTicketStatus(ticketId, itemId, completed)`.

`kds.constants.ts` currently: `KDS_POLLING_INTERVAL = 5000`, `STATUS_COLORS` (for the timer pill — being removed), `TICKET_STATUS_CONFIG` (lowercase-keyed pill/dot map — being replaced by reusing `features/orders`' `STATUS_CONFIG`).

`KdsTicket.tsx`'s footer "Mark Order Ready" button (`components/KdsTicket.tsx` around line 102) has **no `onClick` at all** — style changes when `allCompleted` but clicking does nothing; there is currently no way to change a ticket's overall status from the KDS UI. This task fixes that as its core deliverable.

- [ ] **Step 1: Rewrite `kds.constants.ts`**

```typescript
import type { Order, OrderStatus } from "@/types/orders";

export const KDS_POLLING_INTERVAL = 5000;

export function getTicketChannelLabel(order: Pick<Order, "channel" | "fulfillment">): "DINE-IN" | "DELIVERY" | "PICKUP" {
    if (order.channel === "Dine-in") return "DINE-IN";
    return (order.fulfillment ?? "Pickup").toUpperCase() as "DELIVERY" | "PICKUP";
}

export const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
    New: { label: "Start Preparing", next: "Preparing" },
    Preparing: { label: "Mark Ready", next: "Ready" },
    Ready: { label: "Complete Order", next: "Completed" },
};
```

- [ ] **Step 2: Delete `kds.service.ts`**

```bash
git rm src/features/kds/services/kds.service.ts
```

- [ ] **Step 3: Rewrite `useKdsOrders.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { Order } from '@/types/orders';
import { ordersService } from '@/features/orders/services/orders.service';
import { KDS_POLLING_INTERVAL } from '../constants/kds.constants';

const KDS_STATUSES: Order["status"][] = ["New", "Preparing", "Ready"];

export const useKdsOrders = () => {
    return useQuery({
        queryKey: ['orders'],
        queryFn: ordersService.getOrders,
        select: (orders) => orders.filter((order) => KDS_STATUSES.includes(order.status)),
        refetchInterval: KDS_POLLING_INTERVAL,
    });
};
```

- [ ] **Step 4: Rewrite `useKdsSummary.ts`**

```typescript
import { useMemo } from "react";
import type { Order } from "@/types/orders";

export interface ProductionSummaryItem {
    name: string;
    qty: number;
}

export function useKdsSummary(orders: Order[]): ProductionSummaryItem[] {
    return useMemo(() => {
        const totals = new Map<string, number>();
        orders.forEach((order) => {
            order.items.forEach((item) => {
                totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity);
            });
        });
        return Array.from(totals, ([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
    }, [orders]);
}
```

This replaces the old disconnected `MOCK_SUMMARY` array (whose item names never matched the ticket mock's item names) with a real aggregation over the same orders the ticket board shows.

- [ ] **Step 5: Rewrite `useUpdateKdsStatus.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from '@/types/orders';
import { ordersService } from '@/features/orders/services/orders.service';

export const useUpdateKdsStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            ordersService.updateOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};
```

- [ ] **Step 6: Rewrite `components/StatusBadge.tsx`**

```tsx
import type { OrderStatus } from "@/types/orders";
import { STATUS_CONFIG } from "@/features/orders/constants/orders.constants";

export function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-xs font-medium tracking-wide ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status.toUpperCase()}
        </span>
    );
}
```

This reuses `features/orders`' existing 5-state color palette (`STATUS_CONFIG`) instead of keeping a second, duplicate lowercase-keyed palette in `features/kds` — the two features' `StatusBadge` components stay separate (each still owns its own presentational component per this repo's per-feature convention), but they now share one source of truth for status colors.

- [ ] **Step 7: Rewrite `KdsTicket.tsx`**

```tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types/orders';
import { getTicketChannelLabel, NEXT_STATUS } from '../constants/kds.constants';
import { StatusBadge } from './StatusBadge';

interface KdsTicketProps {
    order: Order;
    onAdvanceStatus: (nextStatus: Order["status"]) => void;
}

export const KdsTicket = ({ order, onAdvanceStatus }: KdsTicketProps) => {
    const action = NEXT_STATUS[order.status];

    return (
        <Card className="w-[360px] flex flex-col bg-slate-900 border border-slate-800 rounded-[8px] shadow-2xl flex-shrink-0">
            {/* Card Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-[8px]">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="font-mono text-2xl font-bold text-slate-50 tracking-tight leading-none">
                            {order.id}
                        </span>
                        <p className="text-[15px] font-medium text-slate-400 mt-1">
                            {order.customerName}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-2 py-0.5 rounded-[6px] text-xs font-bold tracking-wide uppercase">
                            {getTicketChannelLabel(order)}
                        </Badge>
                        <StatusBadge status={order.status} />
                    </div>
                </div>
                {order.table && (
                    <p className="text-sm font-medium text-slate-400">{order.table}</p>
                )}
            </div>

            {/* Line Items */}
            <div className="flex-1 p-4 space-y-3">
                {order.items.map((item, idx) => (
                    <div key={`${item.menuItemId}-${idx}`}>
                        <p className="text-xl font-bold leading-tight flex items-start gap-3 text-slate-50">
                            <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-[4px] text-lg leading-none">
                                {item.quantity}x
                            </span>
                            <span>{item.name}</span>
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                            <ul className="mt-2 space-y-1.5 ml-1">
                                {item.modifiers.map((mod, modIdx) => (
                                    <li key={modIdx} className="text-base font-bold flex items-center gap-2 text-slate-400">
                                        <span className="text-slate-600 text-xl leading-none">↳</span>
                                        {mod.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Button — the real, working status-advance action */}
            {action && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-[8px]">
                    <button
                        onClick={() => onAdvanceStatus(action.next)}
                        className="w-full py-4 text-lg rounded-[6px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-slate-50 hover:bg-white text-slate-950 font-bold shadow-sm"
                    >
                        {action.label}
                    </button>
                </div>
            )}
        </Card>
    );
};
```

Dropped from the old version, deliberately, with no replacement: the per-item `completed` checkbox interaction (no analog in `Order`, which tracks status per-order only), the 🔥 RUSH badge, the `isActive` glowing border, and the elapsed-time timer pill — `Order.createdAt` is date-only (`"2024-11-20"`, no time component), so there is no real data to back a live countdown; inventing one would be exactly the kind of decorative-but-meaningless mock this redesign is removing elsewhere (e.g. Home's `ChatAssistant`). A real elapsed-timer feature is a candidate for a future phase once `createdAt` carries a timestamp — not blocking this one.

- [ ] **Step 8: Update `KdsFeature.tsx`'s wiring**

Change the hook calls and loading check:
```tsx
const { data: tickets, isLoading: isLoadingTickets } = useKdsOrders();
const { data: summary, isLoading: isLoadingSummary } = useKdsSummary();
const mutation = useUpdateKdsStatus();
```
to:
```tsx
const { data: tickets, isLoading: isLoadingTickets } = useKdsOrders();
const summary = useKdsSummary(tickets ?? []);
const mutation = useUpdateKdsStatus();
```
and:
```tsx
if (isLoadingTickets || isLoadingSummary) {
```
to:
```tsx
if (isLoadingTickets) {
```

Add the import at the top of the file:
```tsx
import { getTicketChannelLabel } from '../constants/kds.constants';
```

Change the three segmented-filter count expressions:
```tsx
Dine-In ({tickets?.filter(t => t.type === 'DINE-IN').length || 0})
...
Delivery ({tickets?.filter(t => t.type === 'DELIVERY').length || 0})
...
Pickup ({tickets?.filter(t => t.type === 'PICKUP').length || 0})
```
to:
```tsx
Dine-In ({tickets?.filter((t) => getTicketChannelLabel(t) === 'DINE-IN').length || 0})
...
Delivery ({tickets?.filter((t) => getTicketChannelLabel(t) === 'DELIVERY').length || 0})
...
Pickup ({tickets?.filter((t) => getTicketChannelLabel(t) === 'PICKUP').length || 0})
```

Change the ticket-rendering block:
```tsx
{tickets?.map((ticket) => (
    <KdsTicket
        key={ticket.id}
        ticket={ticket}
        onItemToggle={(itemId, completed) =>
            mutation.mutate({ ticketId: ticket.id, itemId, completed })
        }
    />
))}
```
to:
```tsx
{tickets?.map((order) => (
    <KdsTicket
        key={order.id}
        order={order}
        onAdvanceStatus={(nextStatus) => mutation.mutate({ orderId: order.id, status: nextStatus })}
    />
))}
```

Change the summary-rendering block (drop the now-unnecessary optional chain, `summary` is always an array):
```tsx
{summary?.map((item, idx) => (
```
to:
```tsx
{summary.map((item, idx) => (
```

- [ ] **Step 9: Delete `src/types/kds.ts`**

All 3 of its original consumers (`kds.service.ts` — deleted in Step 2; `components/StatusBadge.tsx` and `components/KdsTicket.tsx` — retargeted in Steps 6-7) no longer reference it.

```bash
git rm src/types/kds.ts
```

- [ ] **Step 10: Verify build and grep for stragglers**

Run: `yarn build`
Expected: clean, zero TypeScript errors anywhere in `src/features/kds/`.

Run: `grep -rn "types/kds\|KdsTicket\b.*from\|TicketStatus\|TicketItem\|KdsSummaryItem" src/ --include="*.ts" --include="*.tsx"`
Expected: no remaining reference to the deleted type file or its exported names anywhere in `src/` (the `KdsTicket` component name itself, exported from `components/KdsTicket.tsx`, is expected and fine — this grep is checking for the deleted *type* imports, not the component).

- [ ] **Step 11: Commit**

```bash
git add -A -- src/types/kds.ts src/features/kds
git status --porcelain -- src/types/kds.ts src/features/kds
```
Confirm the staged files are exactly: the deleted `src/types/kds.ts`, the deleted `src/features/kds/services/kds.service.ts`, and the modified `kds.constants.ts`/`useKdsOrders.ts`/`useKdsSummary.ts`/`useUpdateKdsStatus.ts`/`KdsTicket.tsx`/`StatusBadge.tsx`/`KdsFeature.tsx`. If anything else appears staged, unstage it (`git restore --staged <file>`) before committing.

```bash
git commit -m "$(cat <<'EOF'
feat(kds): retarget to the shared Order model, make status-advance real

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XbkrhhmxHSPaRw5msg29un
EOF
)" -- src/types/kds.ts src/features/kds
```
(Adjust the pathspec to match whatever `git status --porcelain` actually shows staged, in case deleted-file pathspecs behave differently in this git version — the goal is an exact, minimal commit.)

---

### Task 5: Full verification

**Files:** none (verification only).

**Interfaces:** N/A.

- [ ] **Step 1: Full build**

Run: `yarn build`
Expected: clean pass, zero TypeScript errors.

- [ ] **Step 2: Lint**

Run: `yarn lint`
Expected: no NEW lint errors introduced by this plan's changes (this repo has pre-existing lint debt unrelated to this work — e.g. `features/profile`/`features/settings`/`features/auth`/`features/analytics` already have pre-existing errors per Phase 3's verification; confirm any reported file/line is not one this plan touched). Do NOT use `git stash` to check this — see Global Constraints.

- [ ] **Step 3: Confirm zero stray references to the old per-feature types, statically**

Run: `grep -rn "type: 'DELIVERY'\|isRush\|timerState\|onItemToggle" src/features/kds/`
Expected: zero results — confirms every fabricated/dropped field and the old toggle callback are fully gone from `features/kds`, not just from the files this plan explicitly listed.

- [ ] **Step 4: Browser-verify the shared-record behavior**

Dispatch the `ui-behavior-verifier` agent (per this repo's `verify-ui` skill) with this requirement: log in, navigate to `/orders`, confirm the order list renders (not stuck on "Loading orders..."). Open "New Order", select channel "Dine-in", confirm a "Table" dropdown appears (populated from `/tables`' seed data — e.g. "Table 1"–"Patio 1"), fill in a customer name/phone, add one item with a price, submit, and confirm the new order appears at the top of the list with the selected table shown in its subtitle (e.g. "Dine-in · Table 1"). Then click "Cancel" (trash icon) on any order, confirm the confirmation modal now reads "This will mark the order as Cancelled," confirm on it, and confirm the order **remains in the list** with a "Cancelled" status badge (not removed). Then navigate to `/kds`, confirm ticket cards render for orders in New/Preparing/Ready status only (the just-cancelled order and any Completed orders must NOT appear on the KDS board), confirm each ticket's channel badge and status badge render correctly, and click a ticket's status-advance button (e.g. "Start Preparing" on a New ticket) — confirm the ticket updates to show "Mark Ready" next and the status badge changes. Finally, navigate back to `/orders` and confirm that same order's status badge reflects the KDS-driven change (proves both features read/write the same underlying record). This feature is mock data end-to-end; ignore any network 404s unrelated to orders/KDS data.

- [ ] **Step 5: Report**

Summarize: build clean, lint clean (or pre-existing-only debt), Orders and KDS verified live sharing one data source (a KDS status change is visible on the Orders page and vice versa), CreateOrderModal's channel/table/fulfillment picker verified working, cancel verified as a status change rather than a deletion, `types/kds.ts` fully retired with zero stragglers.
