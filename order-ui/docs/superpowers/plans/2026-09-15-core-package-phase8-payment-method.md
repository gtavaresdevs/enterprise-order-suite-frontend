# Core Package Phase 8 — Payment Method Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared PIX/Card/Cash payment-method picker used everywhere Core chooses how an order
is paid, and make payment method real, staff-visible `Order` data — not component-local UI state
that disappears after checkout.

**Architecture:** `Order` gains three optional fields (`paymentMethod`, `cardType`, `changeFor`) in
the single shared `src/types/orders.ts`. One new presentational component,
`src/components/payment/PaymentMethodPicker.tsx`, renders the PIX/Card/Cash choice plus its
conditional sub-fields (Card → Crédito/Débito, Cash → troco amount) and is consumed by both
`CreateOrderModal` (orders feature) and `CheckoutFlow` (storefront feature) — this is the first
component shared directly across two feature modules in this codebase (prior phases only shared
data at the *service* layer, e.g. `table-menu` composing `menuService`+`tablesService`), so it gets
its own top-level `src/components/payment/` location rather than living inside either feature.
`CreateOrderModal` already persists real orders via `ordersService.createOrder`, so its payment
selection becomes real `Order` data immediately and is surfaced to staff in `OrderDrawer`.
Storefront's `CheckoutFlow` does **not** yet create a real order (confirmed by reading the current
code — "Place Order" only flips local flow state to a fake success screen, with no
`ordersService` call and no customer name/phone capture anywhere in the flow); per an explicit
scope decision for this phase, that stays true — `CheckoutFlow` gets the real picker UI and, for
PIX specifically, a new mock "waiting for confirmation" screen (QR + copia-e-cola code, matching
the spec's requirement that PIX must be recognizable to a Brazilian user), but nothing is persisted
to `ordersService` from storefront yet. Full real order creation from storefront checkout (address
capture, customer identity, `ordersService.createOrder`) is explicitly deferred to Phase 9, which is
already rebuilding this flow to add the Entrega/Retirada choice and address capture that a real
order would need.

**Tech Stack:** React 19, TanStack Query (unchanged — `CreateOrderModal`'s existing
`useOrders().createOrder` mutation already covers the new fields, no hook changes needed),
`react-i18next` (Phase 7 infra, reused), `qrcode.react` (already a dependency, used by
`features/tables` for table QR codes — reused here for the mock PIX QR).

**Spec:** `docs/superpowers/specs/2026-09-15-core-package-br-i18n-ux-design.md` — read the "Payment
method (mock, but real data — supersedes the earlier 'local state only' call)" section before
starting any task. Also read `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md`'s "Standing
constraints" section (applies to every phase).

## Global Constraints

- `PaymentMethod = "PIX" | "Card" | "Cash"`, `CardType = "Credit" | "Debit"` — exact union values,
  used as i18n key suffixes (`payment:methods.PIX` etc.) so do not rename them without updating the
  locale files in the same pass.
- All Core payment methods are **in-person** — PIX is pay-now via a mock QR/waiting flow, Card and
  Cash are collected physically. No card number/details are ever collected in-app. Do not build any
  "enter your card" form.
- `changeFor` is Cash-only, optional (omitted/undefined means no change needed — not `0`).
- `cardType` is Card-only; never set it for PIX or Cash.
- Presentation-boundary only: `PaymentMethod`/`CardType` values themselves (`"PIX"`, `"Card"`,
  `"Cash"`, `"Credit"`, `"Debit"`) are stored/compared as-is in code — only their *rendered label*
  is translated, via the new `payment` i18n namespace. Never translate the stored value itself.
- Two locales only (`en`, `pt-BR`), English canonical/fallback — same as every other namespace.
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists — `yarn build` (`tsc -b && vite build`) and `yarn lint` (`eslint .`) are the
  safety net for every task.
- Commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare
  `git commit -m "..."` — this repo has unrelated pre-existing uncommitted work that must not be
  swept into a commit here.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo.
- Storefront's `CheckoutFlow` stays without real `ordersService` persistence in this phase (explicit
  scope decision — see Architecture above). Do not add a `createOrder` call there; that's Phase 9.
- Terminology: "Cartão" for Card, "Dinheiro" for Cash, "Crédito"/"Débito" for card sub-types,
  "Troco" for change — per the spec's terminology glossary, used consistently, not reinvented
  per-file.

---

## File inventory (current state, confirmed by codebase read)

- `src/types/orders.ts` — `Order` has no payment-method fields today, only `paymentStatus: "Paid" |
  "Pending" | "PayLater"` (a different, pre-existing concept — not touched by this phase).
- `src/features/orders/constants/orders.constants.ts` — 8 mock `Order` records, none carry a
  payment method today.
- `src/features/orders/components/CreateOrderModal.tsx` — real order creation form (`onSave` calls
  `ordersService.createOrder` via `OrdersFeature`'s `useOrders().createOrder`); hardcodes
  `paymentStatus: "PayLater"` always (unchanged by this phase) and has no payment-method UI at all.
- `src/features/orders/components/OrderDrawer.tsx` — staff-facing order detail view; shows
  table/fulfillment and phone rows today, no payment-method row.
- `src/features/storefront/components/CheckoutFlow.tsx` — confirmed to have **zero** real order
  creation: "Place Order" calls `onComplete()` which only flips `StorefrontFeature`'s local
  `flowState` to `"success"`. The current "Payment Method" section is a single hardcoded, untranslatable-by-design
  fake row ("Card ending in •••• 4242" — actually already routed through i18n as a literal fake
  string, not a real chosen state).
- `src/features/storefront/components/StorefrontFeature.tsx` — owns `flowState` (`"feed" | "cart" |
  "checkout" | "success"`) via `useStorefront()`, switches which storefront screen renders.
- `src/types/storefront.ts` — `FlowState` union lives here; gains `"pixWaiting"`.
- `src/i18n/config.ts` — registers one JSON module pair per namespace; gains `payment`.
- No existing cross-feature shared component directory beyond `src/components/ui/` (shadcn
  primitives) — `src/components/payment/` is a new, deliberate top-level location for this first
  cross-feature domain component (see Architecture above).

---

### Task 1: Shared payment types, i18n namespace, and `PaymentMethodPicker` component

**Files:**
- Modify: `src/types/orders.ts`
- Create: `src/i18n/locales/en/payment.json`
- Create: `src/i18n/locales/pt-BR/payment.json`
- Modify: `src/i18n/config.ts`
- Create: `src/components/payment/PaymentMethodPicker.tsx`

**Interfaces:**
- Produces: `PaymentMethod = "PIX" | "Card" | "Cash"`, `CardType = "Credit" | "Debit"`, exported
  from `@/types/orders`. `Order` gains `paymentMethod?: PaymentMethod`, `cardType?: CardType`,
  `changeFor?: number`.
- Produces: i18n namespace `"payment"` with keys `methodLabel`, `methods.PIX`/`.Card`/`.Cash`,
  `cardTypeLabel`, `cardTypes.Credit`/`.Debit`, `changeForLabel`, `changeForPlaceholder`,
  `changeForHint`, `errors.methodRequired`, `errors.cardTypeRequired` — every later task that needs
  a payment-related label or validation message reads from this namespace, not a per-feature copy.
- Produces: `PaymentMethodPicker` component, default export none (named export), consumed by Task 2
  and Task 4:
  ```ts
  interface PaymentMethodPickerProps {
      value: PaymentMethod | null;
      onValueChange: (method: PaymentMethod) => void;
      cardType: CardType | null;
      onCardTypeChange: (type: CardType) => void;
      changeFor: string;
      onChangeForChange: (value: string) => void;
      errors?: { method?: string; cardType?: string };
  }
  export function PaymentMethodPicker(props: PaymentMethodPickerProps): JSX.Element
  ```
  `changeFor` is a raw string (the caller owns numeric parsing on submit, matching how
  `CreateOrderModal` already handles `quantity`/`unitPrice` as strings today).

- [ ] **Step 1: Add the payment types and `Order` fields**

In `src/types/orders.ts`, add after the existing `PaymentStatus` type:
```ts
export type PaymentMethod = "PIX" | "Card" | "Cash";
export type CardType = "Credit" | "Debit";
```
And add to the `Order` interface, after `paymentStatus: PaymentStatus;`:
```ts
  paymentMethod?: PaymentMethod;
  cardType?: CardType;
  changeFor?: number;
```

- [ ] **Step 2: Create the English `payment` namespace**

`src/i18n/locales/en/payment.json`:
```json
{
  "methodLabel": "Payment Method",
  "methods": {
    "PIX": "PIX",
    "Card": "Card",
    "Cash": "Cash"
  },
  "cardTypeLabel": "Card Type",
  "cardTypes": {
    "Credit": "Credit",
    "Debit": "Debit"
  },
  "changeForLabel": "Change for how much?",
  "changeForPlaceholder": "e.g. 50.00",
  "changeForHint": "Optional — leave blank if paying the exact amount",
  "errors": {
    "methodRequired": "Select a payment method.",
    "cardTypeRequired": "Select credit or debit."
  }
}
```

- [ ] **Step 3: Create the pt-BR `payment` namespace**

`src/i18n/locales/pt-BR/payment.json`:
```json
{
  "methodLabel": "Forma de Pagamento",
  "methods": {
    "PIX": "PIX",
    "Card": "Cartão",
    "Cash": "Dinheiro"
  },
  "cardTypeLabel": "Tipo de Cartão",
  "cardTypes": {
    "Credit": "Crédito",
    "Debit": "Débito"
  },
  "changeForLabel": "Troco para quanto?",
  "changeForPlaceholder": "ex. 50,00",
  "changeForHint": "Opcional — deixe em branco se for pagar o valor exato",
  "errors": {
    "methodRequired": "Selecione uma forma de pagamento.",
    "cardTypeRequired": "Selecione crédito ou débito."
  }
}
```

- [ ] **Step 4: Register the namespace in `src/i18n/config.ts`**

Add imports (after the `enPreferences`/`ptBrPreferences` imports):
```ts
import enPayment from "./locales/en/payment.json";
import ptBrPayment from "./locales/pt-BR/payment.json";
```
Add `payment: enPayment,` to the `en` resources object and `payment: ptBrPayment,` to the `"pt-BR"`
resources object (alongside `preferences:`).

- [ ] **Step 5: Write `PaymentMethodPicker`**

`src/components/payment/PaymentMethodPicker.tsx`:
```tsx
import { useTranslation } from "react-i18next";
import { QrCode, CreditCard, Banknote } from "lucide-react";
import type { PaymentMethod, CardType } from "@/types/orders";

interface PaymentMethodPickerProps {
    value: PaymentMethod | null;
    onValueChange: (method: PaymentMethod) => void;
    cardType: CardType | null;
    onCardTypeChange: (type: CardType) => void;
    changeFor: string;
    onChangeForChange: (value: string) => void;
    errors?: { method?: string; cardType?: string };
}

const METHODS: PaymentMethod[] = ["PIX", "Card", "Cash"];
const CARD_TYPES: CardType[] = ["Credit", "Debit"];

const METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
    PIX: QrCode,
    Card: CreditCard,
    Cash: Banknote,
};

export function PaymentMethodPicker({ value, onValueChange, cardType, onCardTypeChange, changeFor, onChangeForChange, errors }: PaymentMethodPickerProps) {
    const { t } = useTranslation("payment");

    return (
        <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("methodLabel")}</p>
            <div className="grid grid-cols-3 gap-2">
                {METHODS.map((method) => {
                    const Icon = METHOD_ICONS[method];
                    const selected = value === method;
                    return (
                        <button
                            key={method}
                            type="button"
                            onClick={() => onValueChange(method)}
                            className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-[8px] border text-xs font-medium transition-colors ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                        >
                            <Icon className="w-4 h-4" />
                            {t(`methods.${method}`)}
                        </button>
                    );
                })}
            </div>
            {errors?.method && <p className="text-xs text-red-500 mt-1.5">{errors.method}</p>}

            {value === "Card" && (
                <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("cardTypeLabel")}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {CARD_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => onCardTypeChange(type)}
                                className={`h-9 rounded-[8px] border text-sm font-medium transition-colors ${cardType === type ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                            >
                                {t(`cardTypes.${type}`)}
                            </button>
                        ))}
                    </div>
                    {errors?.cardType && <p className="text-xs text-red-500 mt-1.5">{errors.cardType}</p>}
                </div>
            )}

            {value === "Cash" && (
                <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("changeForLabel")}</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("changeForPlaceholder")}
                        value={changeFor}
                        onChange={(e) => onChangeForChange(e.target.value)}
                        className="w-full h-9 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">{t("changeForHint")}</p>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 6: Verify the build**

Run: `yarn build`
Expected: no TypeScript/build errors. `PaymentMethodPicker` compiles but has no consumers yet — no
visible app change.

- [ ] **Step 7: Commit**

```bash
git add src/types/orders.ts src/i18n/locales/en/payment.json src/i18n/locales/pt-BR/payment.json src/i18n/config.ts src/components/payment/PaymentMethodPicker.tsx
git commit -m "feat(payment): add PaymentMethod/CardType types and shared PaymentMethodPicker component" -- src/types/orders.ts src/i18n/locales/en/payment.json src/i18n/locales/pt-BR/payment.json src/i18n/config.ts src/components/payment/PaymentMethodPicker.tsx
```

---

### Task 2: Wire payment method into `CreateOrderModal` (real, staff-created orders)

**Files:**
- Modify: `src/features/orders/components/CreateOrderModal.tsx`
- Modify: `src/features/orders/constants/orders.constants.ts`
- Modify: `src/i18n/locales/en/orders.json`
- Modify: `src/i18n/locales/pt-BR/orders.json`

**Interfaces:**
- Consumes: `PaymentMethodPicker` from `@/components/payment/PaymentMethodPicker` (Task 1),
  `PaymentMethod`/`CardType` from `@/types/orders` (Task 1).
- Produces: `CreateOrderModal`'s `onSave` payload (`Omit<Order, "id">`) now includes
  `paymentMethod`, `cardType` (Card only), `changeFor` (Cash only, parsed to a number) — consumed
  as-is by `OrdersFeature`'s existing `createOrder` mutation (`src/features/orders/hooks/useOrders.ts`,
  unchanged).

- [ ] **Step 1: Add payment state and validation to `CreateOrderModal`**

In `src/features/orders/components/CreateOrderModal.tsx`, update the type-only import to add
`PaymentMethod, CardType`:
```tsx
import type { Order, OrderStatus, OrderLine, OrderChannel, Fulfillment, PaymentMethod, CardType } from "@/types/orders";
```
Add to the lucide-react import line: `Wallet` (so it reads
`import { User, Phone, Package, Plus, DollarSign, Minus, X, MapPin, Wallet } from "lucide-react";`).
Add the import:
```tsx
import { PaymentMethodPicker } from "@/components/payment/PaymentMethodPicker";
```
Add a second translation hook next to the existing `t`:
```tsx
const { t: tPayment } = useTranslation("payment");
```
Add state after the existing `items`/`errors`/`submitted` state:
```tsx
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
const [cardType, setCardType] = useState<CardType | null>(null);
const [changeFor, setChangeFor] = useState("");
```
Update `validate()` to also check payment fields, adding these two lines after the `channel ===
"Dine-in"` check:
```tsx
if (!paymentMethod) e.paymentMethod = tPayment("errors.methodRequired");
if (paymentMethod === "Card" && !cardType) e.cardType = tPayment("errors.cardTypeRequired");
```

- [ ] **Step 2: Include payment fields in the submitted order**

In `handleSubmit`, update the `onSave({...})` call to add the three fields (after
`paymentStatus: "PayLater",`):
```tsx
paymentMethod: paymentMethod ?? undefined,
cardType: paymentMethod === "Card" ? (cardType ?? undefined) : undefined,
changeFor: paymentMethod === "Cash" && changeFor ? parseFloat(changeFor) : undefined,
```

- [ ] **Step 3: Render the picker**

Add a new section after the existing Items section's closing `</div>` (i.e. after the `{grandTotal
> 0 && (...)}` block, still inside the scrollable `space-y-5` container), mirroring the existing
section structure:
```tsx
<div className="border-t border-slate-100" />
<div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Wallet className="w-3 h-3" /> {t("createModal.paymentSectionLabel")}</p>
    <PaymentMethodPicker
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        cardType={cardType}
        onCardTypeChange={setCardType}
        changeFor={changeFor}
        onChangeForChange={setChangeFor}
        errors={{
            method: submitted ? errors.paymentMethod : undefined,
            cardType: submitted ? errors.cardType : undefined,
        }}
    />
</div>
```

- [ ] **Step 4: Add the new i18n keys**

In `src/i18n/locales/en/orders.json`, add to the `"createModal"` object (after
`"itemsSectionLabel": "Items",`):
```json
"paymentSectionLabel": "Payment",
```
In `src/i18n/locales/pt-BR/orders.json`, add to the `"createModal"` object at the same position:
```json
"paymentSectionLabel": "Pagamento",
```

- [ ] **Step 5: Give the mock order fixture realistic payment data**

In `src/features/orders/constants/orders.constants.ts`, add a `paymentMethod` (and `cardType`/
`changeFor` where applicable) field to each of the 8 `ORDERS` entries, matching the eventual real
DTO shape:
- `DEL-2024-8801`: `paymentMethod: "PIX",`
- `DEL-2024-8802`: `paymentMethod: "Card", cardType: "Credit",`
- `DEL-2024-8803`: `paymentMethod: "Cash", changeFor: 30,`
- `PHN-2024-8804`: `paymentMethod: "Cash",`
- `DEL-2024-8805`: `paymentMethod: "PIX",`
- `DEL-2024-8806`: `paymentMethod: "Card", cardType: "Debit",`
- `DIN-2024-8807`: `paymentMethod: "Cash",`
- `DEL-2024-8808`: `paymentMethod: "PIX",`

Add each field on its own line directly after that order's `paymentStatus: ...,` line.

- [ ] **Step 6: Verify the build**

Run: `yarn build` then `yarn lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/orders/components/CreateOrderModal.tsx src/features/orders/constants/orders.constants.ts src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json
git commit -m "feat(orders): capture real payment method on staff-created orders" -- src/features/orders/components/CreateOrderModal.tsx src/features/orders/constants/orders.constants.ts src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json
```

---

### Task 3: Surface payment method to staff in `OrderDrawer`

**Files:**
- Modify: `src/features/orders/components/OrderDrawer.tsx`
- Modify: `src/i18n/locales/en/orders.json`
- Modify: `src/i18n/locales/pt-BR/orders.json`

**Interfaces:**
- Consumes: `Order.paymentMethod`/`.cardType`/`.changeFor` (Task 1), `payment` namespace's
  `methods.*`/`cardTypes.*` keys (Task 1) for the method/card-type labels.

- [ ] **Step 1: Add a payment row to the order-details section**

In `src/features/orders/components/OrderDrawer.tsx`, add `Wallet` to the lucide-react import:
```tsx
import { X, ChevronRight, Phone, MapPin, Wallet } from "lucide-react";
```
Add a second translation hook next to the existing `t`:
```tsx
const { t: tPayment } = useTranslation("payment");
```
Add a new row inside the existing `<div className="space-y-3">` block (the one containing the
table/fulfillment and phone rows), after the phone row's closing `</div>`, only rendered when a
payment method exists:
```tsx
{order.paymentMethod && (
  <div className="flex items-start gap-2.5">
    <div className="w-7 h-7 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Wallet className="w-3.5 h-3.5 text-slate-500" />
    </div>
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t("drawer.paymentLabel")}</p>
      <p className="text-sm font-medium text-slate-700 mt-0.5 leading-snug">
        {tPayment(`methods.${order.paymentMethod}`)}
        {order.cardType ? ` · ${tPayment(`cardTypes.${order.cardType}`)}` : ""}
        {order.changeFor != null ? ` · ${t("drawer.changeForValue", { amount: formatCurrency(order.changeFor) })}` : ""}
      </p>
    </div>
  </div>
)}
```

- [ ] **Step 2: Add the new i18n keys**

In `src/i18n/locales/en/orders.json`, add to the `"drawer"` object (after `"phoneLabel": "Phone",`):
```json
"paymentLabel": "Payment Method",
"changeForValue": "Change for {{amount}}",
```
In `src/i18n/locales/pt-BR/orders.json`, add to the `"drawer"` object at the same position:
```json
"paymentLabel": "Forma de Pagamento",
"changeForValue": "Troco para {{amount}}",
```

- [ ] **Step 3: Verify the build**

Run: `yarn build` then `yarn lint`
Expected: no errors. Manually cross-check that `OrderDrawer`'s import of `useTranslation` already
exists at the top of the file (it does — used for the existing `t`) so only the second hook call is
new.

- [ ] **Step 4: Commit**

```bash
git add src/features/orders/components/OrderDrawer.tsx src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json
git commit -m "feat(orders): show payment method in the order detail drawer" -- src/features/orders/components/OrderDrawer.tsx src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json
```

---

### Task 4: Wire the picker + mock PIX waiting screen into Storefront `CheckoutFlow`

**Files:**
- Modify: `src/types/storefront.ts`
- Create: `src/features/storefront/components/PixWaitingMock.tsx`
- Modify: `src/features/storefront/components/CheckoutFlow.tsx`
- Modify: `src/features/storefront/components/StorefrontFeature.tsx`
- Modify: `src/i18n/locales/en/storefront.json`
- Modify: `src/i18n/locales/pt-BR/storefront.json`

**Interfaces:**
- Consumes: `PaymentMethodPicker` (Task 1), `PaymentMethod`/`CardType` from `@/types/orders` (Task
  1), `payment` namespace's `errors.methodRequired`/`errors.cardTypeRequired` (Task 1).
- Produces: `FlowState` gains `"pixWaiting"`. `CheckoutFlow`'s prop changes from `onComplete: () =>
  void` to `onPlaceOrder: (method: PaymentMethod) => void` — `StorefrontFeature` decides whether to
  route through the new PIX waiting screen or straight to success. `PixWaitingMock` is a
  self-contained component: `{ onConfirmed: () => void }`, no other props.
- Per the scope decision recorded in Architecture above, this task does **not** call
  `ordersService.createOrder` — the picker's selections are captured in local component state only
  and are not persisted from this flow in this phase.

- [ ] **Step 1: Add the new flow state**

In `src/types/storefront.ts`, change:
```ts
export type FlowState = "feed" | "cart" | "checkout" | "success";
```
to:
```ts
export type FlowState = "feed" | "cart" | "checkout" | "pixWaiting" | "success";
```

- [ ] **Step 2: Write the mock PIX waiting screen**

`src/features/storefront/components/PixWaitingMock.tsx`:
```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Loader2 } from "lucide-react";

const MOCK_PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136mock-pix-code-0000-0000-0000000000005204000053039865405 0.005802BR5910RESTAURANTE6009SAOPAULO62070503***6304ABCD";
const AUTO_CONFIRM_MS = 2800;

export const PixWaitingMock = ({ onConfirmed }: { onConfirmed: () => void }) => {
    const { t } = useTranslation("storefront");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const timer = setTimeout(onConfirmed, AUTO_CONFIRM_MS);
        return () => clearTimeout(timer);
    }, [onConfirmed]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(MOCK_PIX_CODE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard permission denied by the browser — nothing to recover here.
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-5">
                <QRCodeCanvas value={MOCK_PIX_CODE} size={180} />
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-5">{t("pixWaiting.title")}</p>
            <button onClick={handleCopy} className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors max-w-full">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{copied ? t("pixWaiting.copied") : t("pixWaiting.copyCodeButton")}</span>
            </button>
            <div className="flex items-center gap-2 mt-6 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">{t("pixWaiting.waitingMessage")}</span>
            </div>
        </div>
    );
};
```

- [ ] **Step 3: Rewrite `CheckoutFlow` to use the real picker**

Replace the full contents of `src/features/storefront/components/CheckoutFlow.tsx` with:
```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin } from "lucide-react";
import type { PaymentMethod, CardType } from "@/types/orders";
import { PaymentMethodPicker } from "@/components/payment/PaymentMethodPicker";

export const CheckoutFlow = ({ onBack, onPlaceOrder }: { onBack: () => void; onPlaceOrder: (method: PaymentMethod) => void }) => {
    const { t } = useTranslation("storefront");
    const { t: tPayment } = useTranslation("payment");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [cardType, setCardType] = useState<CardType | null>(null);
    const [changeFor, setChangeFor] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handlePlaceOrder = () => {
        setSubmitted(true);
        if (!paymentMethod) return;
        if (paymentMethod === "Card" && !cardType) return;
        onPlaceOrder(paymentMethod);
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col">
            <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 flex-shrink-0">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-slate-900 -ml-1">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[17px] font-semibold text-slate-900 ml-2">{t("checkout.title")}</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <section>
                    <h2 className="text-sm font-bold text-slate-900 mb-2 px-1">{t("checkout.deliveryAddressLabel")}</h2>
                    <div className="bg-white rounded-[8px] border border-slate-100 p-4 shadow-sm relative">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-slate-400"><MapPin className="w-5 h-5" /></div>
                            <div>
                                <p className="font-semibold text-slate-900">{t("checkout.customerName")}</p>
                                <p className="text-slate-600 text-sm mt-0.5">{t("checkout.addressLine1")}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-4">
                        <PaymentMethodPicker
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                            cardType={cardType}
                            onCardTypeChange={setCardType}
                            changeFor={changeFor}
                            onChangeForChange={setChangeFor}
                            errors={{
                                method: submitted && !paymentMethod ? tPayment("errors.methodRequired") : undefined,
                                cardType: submitted && paymentMethod === "Card" && !cardType ? tPayment("errors.cardTypeRequired") : undefined,
                            }}
                        />
                    </div>
                </section>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 pb-8">
                <button onClick={handlePlaceOrder} className="w-full h-[52px] bg-slate-950 text-slate-50 rounded-[8px] font-semibold text-[15px] hover:bg-slate-900">
                    {t("checkout.placeOrderButton")}
                </button>
            </div>
        </div>
    );
};
```

- [ ] **Step 4: Route through the PIX waiting screen from `StorefrontFeature`**

In `src/features/storefront/components/StorefrontFeature.tsx`, add the import:
```tsx
import { PixWaitingMock } from "./PixWaitingMock";
```
Replace:
```tsx
{flowState === "checkout" && <CheckoutFlow onBack={() => setFlowState("cart")} onComplete={() => setFlowState("success")} />}
{flowState === "success" && <SuccessView onBack={() => { setCart([]); setFlowState("feed"); }} />}
```
with:
```tsx
{flowState === "checkout" && <CheckoutFlow onBack={() => setFlowState("cart")} onPlaceOrder={(method) => setFlowState(method === "PIX" ? "pixWaiting" : "success")} />}
{flowState === "pixWaiting" && <PixWaitingMock onConfirmed={() => setFlowState("success")} />}
{flowState === "success" && <SuccessView onBack={() => { setCart([]); setFlowState("feed"); }} />}
```

- [ ] **Step 5: Update storefront i18n — remove the dead fake-card keys, add PIX-waiting keys**

In `src/i18n/locales/en/storefront.json`, in the `"checkout"` object, remove the
`"paymentMethodLabel"` and `"cardEndingLabel"` keys (now dead — `PaymentMethodPicker` renders its
own label from the `payment` namespace). Add a new top-level `"pixWaiting"` object (after the
`"checkout"` object, before `"success"`):
```json
"pixWaiting": {
    "title": "Waiting for payment confirmation...",
    "copyCodeButton": "Copy PIX code",
    "copied": "Copied!",
    "waitingMessage": "This won't take long"
},
```

In `src/i18n/locales/pt-BR/storefront.json`, remove the same two keys from `"checkout"`, and add:
```json
"pixWaiting": {
    "title": "Aguardando confirmação de pagamento...",
    "copyCodeButton": "Copiar código PIX",
    "copied": "Copiado!",
    "waitingMessage": "Isso não vai demorar"
},
```

- [ ] **Step 6: Verify the build**

Run: `yarn build` then `yarn lint`
Expected: no errors. `CreditCard` must no longer be imported in `CheckoutFlow.tsx` (it's unused
after the rewrite) — confirm the import line only has `ArrowLeft, MapPin`.

- [ ] **Step 7: Commit**

```bash
git add src/types/storefront.ts src/features/storefront/components/PixWaitingMock.tsx src/features/storefront/components/CheckoutFlow.tsx src/features/storefront/components/StorefrontFeature.tsx src/i18n/locales/en/storefront.json src/i18n/locales/pt-BR/storefront.json
git commit -m "feat(storefront): wire real PIX/Card/Cash picker and mock PIX waiting screen into checkout" -- src/types/storefront.ts src/features/storefront/components/PixWaitingMock.tsx src/features/storefront/components/CheckoutFlow.tsx src/features/storefront/components/StorefrontFeature.tsx src/i18n/locales/en/storefront.json src/i18n/locales/pt-BR/storefront.json
```

---

## Final verification (whole-branch, after all tasks)

Per the roadmap's standing process: after all 4 tasks land, run a final whole-branch review pass
looking specifically for cross-task issues invisible to any single task's review (e.g. a shared key
renamed in one task but not consumed correctly in another), then one `verify-ui` browser pass:

1. Staff side: open Orders → New Order, fill the form, pick each of PIX/Card (both sub-types)/Cash
   in turn, confirm validation blocks submission with no method chosen and Card with no sub-type
   chosen, submit a Cash order with a change amount, then open that order's detail drawer and
   confirm the payment method (and card type / change amount, where applicable) renders correctly.
2. Storefront side: add an item to cart, go to checkout, confirm the picker renders with no
   fake "Card ending in" row, select PIX and place the order — confirm the mock QR/waiting screen
   appears and auto-advances to the success screen after a few seconds; separately select
   Card/Credit or Cash and confirm placing the order goes straight to success (no PIX screen).
3. Toggle EN↔PT-BR (Preferences) and confirm the picker's labels, the PIX waiting screen copy, and
   the drawer's payment row all switch language live with no reload.
