# Phase 9 — Delivery Zones + WhatsApp Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the storefront checkout a real Entrega/Retirada (Delivery/Pickup) choice gated to
configured neighborhood ("bairro") delivery zones with an ETA estimate, make storefront checkout
actually create a real `Order` (it currently doesn't — see Global Constraints), add a public
order-status timeline page customers can check, and add a WhatsApp business number config plus
"notify customer via WhatsApp" deep links on the two real status-change surfaces (Orders, KDS).

**Architecture:** Extend the shared `Order`/`PreferencesState` types with delivery-zone/ETA/WhatsApp
fields (mock-backed, per this repo's standing rule of shaping fields like the eventual real DTO
now). Delivery zones are configured as part of `PreferencesState` (the existing "restaurant config
hub" feature, already the documented home for WhatsApp business number and ordering-link display
per the spec) and persist through the existing preferences draft-then-Save flow — no new backend
service needed. "WhatsApp notifications" are implemented as `https://wa.me/<phone>?text=...` deep
links (a real, working browser feature, not a backend integration) rather than faked automatic
sending — automatic sending on every status change stays the backend dependency the spec already
flags and is explicitly out of scope here. The public order-status page is a new `features/track-order`
module mirroring the existing `features/table-menu` module's public/unauthenticated pattern, reading
the same `["orders"]` TanStack Query cache key Orders/KDS already share so a staff-made status change
is reflected there live (same mechanism Phase 4 verified for Orders↔KDS).

**Tech Stack:** React + TypeScript, TanStack Query, react-router-dom, react-i18next, Tailwind,
lucide-react icons — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` (read the
"Fulfillment", "WhatsApp notifications", `features/administration`/`features/preferences` sections,
and "Backend gaps" #6). Roadmap: `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md`.

## Global Constraints

- `MenuItem` ids `m1`-`m9` are load-bearing — do not touch `src/features/menu/constants/menu.constants.ts`.
- Never show a `MenuItem` where `available === false` in any customer-facing view.
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the only
  automated safety net; run both at the end of every task below.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo.
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare
  `git commit -m "..."`.
- Limit Playwright/browser verification to *confirming* a fix already reasoned out from source —
  at most one dispatch at the very end of the whole branch, not per task.
- `/storefront`, `/kds`, `/table-menu` (and the new `/track-order` this plan adds) render OUTSIDE
  the authenticated `ProtectedLayout`/`AppLayout` shell — no login required.
- **Pre-existing gap this plan closes as a prerequisite**: `StorefrontFeature`'s checkout flow
  (`src/features/storefront/components/CheckoutFlow.tsx`) currently never calls
  `ordersService.createOrder` — `onPlaceOrder` just flips `flowState` to `"pixWaiting"`/`"success"`.
  `CheckoutFlow` also renders a hardcoded fake "Delivery Address" block (`t("checkout.customerName")`
  = literal "Marcus T.", `t("checkout.addressLine1")` = literal "123 Main St, Apt 4B") with no real
  fulfillment/customer inputs at all. Task 4 below replaces this with real inputs and a real
  `createOrder` call — without it, "status-timeline" tracking in Task 6 would have no real order to
  track for Online orders.
- Every new/changed user-facing string needs a matching key added to BOTH
  `src/i18n/locales/en/<namespace>.json` and `src/i18n/locales/pt-BR/<namespace>.json` — the repo
  has zero tolerance for English-only strings post-Phase-7. A new namespace (`trackOrder`) must also
  be registered in `src/i18n/config.ts`'s `resources` object for both languages.

---

## File Structure

- `src/types/orders.ts` — add `DeliveryZone` interface; extend `Order` with `deliveryZone?`/`etaMinutes?`.
- `src/types/preferences.ts` — extend `PreferencesState` with `whatsappNumber`/`deliveryZones`.
- `src/types/storefront.ts` — add `PlaceOrderInput` interface (checkout → hook contract).
- `src/app/providers/PreferencesProvider.tsx` — extend `DEFAULT_PREFERENCES`.
- `src/features/preferences/components/StorefrontSection.tsx` — add WhatsApp number field + ordering link copy row.
- `src/features/preferences/components/DeliveryZonesSection.tsx` — **new**, zone list + inline add/remove/toggle.
- `src/features/preferences/components/PreferencesFeature.tsx` — render the new section.
- `src/features/storefront/constants/storefront.constants.ts` — add `PICKUP_ETA_MINUTES`.
- `src/features/storefront/components/CheckoutFlow.tsx` — rewrite: customer inputs, fulfillment/zone picker with gating, ETA display.
- `src/features/storefront/components/CartOverlay.tsx` — drop the hardcoded flat `$3.50` delivery-fee assumption (fee is now decided at checkout, per selected zone).
- `src/features/storefront/hooks/useStorefront.ts` — add `placeOrder` mutation + `placedOrder` state.
- `src/features/storefront/components/StorefrontFeature.tsx` — wire the real flow through.
- `src/features/storefront/components/SuccessView.tsx` — show real order id/ETA, working "Track Order" link.
- `src/features/orders/components/CreateOrderModal.tsx` — add zone picker parity for staff Phone+Delivery orders.
- `src/features/track-order/` — **new feature module**: `services/trackOrder.service.ts`, `hooks/useTrackOrder.ts`, `components/TrackOrderFeature.tsx`, `index.ts`.
- `src/pages/TrackOrder.tsx` — **new**, thin route entry.
- `src/app/router.tsx` — register `/track-order`.
- `src/utils/whatsapp.ts` — **new**, `buildWhatsAppLink(phone, message)`.
- `src/features/orders/components/OrderDrawer.tsx` — wire the existing dead "Contact Customer" button.
- `src/features/kds/components/KdsTicket.tsx` — add a secondary "Notify Customer" action.
- i18n: `preferences`, `storefront`, `orders`, `kds` namespaces get new keys (en + pt-BR); new `trackOrder` namespace (en + pt-BR) registered in `src/i18n/config.ts`.

---

### Task 1: Shared types — `DeliveryZone`, `Order` fields, `PreferencesState` fields

**Files:**
- Modify: `src/types/orders.ts`
- Modify: `src/types/preferences.ts`
- Modify: `src/types/storefront.ts`
- Modify: `src/app/providers/PreferencesProvider.tsx:19-33` (`DEFAULT_PREFERENCES`)

**Interfaces:**
- Produces: `DeliveryZone { id: string; neighborhood: string; feeAmount: number; etaMinutes: number; active: boolean }` (exported from `@/types/orders`) — every later task that touches zones imports this exact shape.
- Produces: `Order.deliveryZone?: string` (the zone's `neighborhood`, not its id — mirrors how `Order.table` already stores the table's `name`, not its id) and `Order.etaMinutes?: number`.
- Produces: `PreferencesState.whatsappNumber: string` (digits-only convention, e.g. `"5511999998888"`, empty string = not configured) and `PreferencesState.deliveryZones: DeliveryZone[]`.
- Produces: `PlaceOrderInput` (in `@/types/storefront`) — the contract `CheckoutFlow` (Task 4) hands to `useStorefront.placeOrder` (Task 4).

- [ ] **Step 1: Add `DeliveryZone` and extend `Order` in `src/types/orders.ts`**

```ts
export type OrderChannel = "Online" | "Dine-in" | "Phone";
export type Fulfillment = "Pickup" | "Delivery";
export type OrderStatus = "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "PayLater";
export type PaymentMethod = "PIX" | "Card" | "Cash";
export type CardType = "Credit" | "Debit";

export interface DeliveryZone {
  id: string;
  neighborhood: string;
  feeAmount: number;
  etaMinutes: number;
  active: boolean;
}

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
  deliveryZone?: string;
  etaMinutes?: number;
  customerName: string;
  customerPhone: string;
  items: OrderLine[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  cardType?: CardType;
  changeFor?: number;
  createdAt: string;
  total: number;
}
```

- [ ] **Step 2: Extend `PreferencesState` in `src/types/preferences.ts`**

```ts
import type { DeliveryZone } from "@/types/orders";

export type ThemeOption = "light" | "dark" | "system";
export type SidebarOption = "expanded" | "collapsed" | "auto";

export interface PreferencesState {
    theme: ThemeOption;
    fontSize: string;
    compactMode: boolean;
    denseTable: boolean;
    reducedMotion: boolean;
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    sidebarNavigation: SidebarOption;
    storefrontLogo: string | null;
    storefrontCover: string | null;
    storefrontBrandColor: string;
    whatsappNumber: string;
    deliveryZones: DeliveryZone[];
}
```

- [ ] **Step 3: Add `PlaceOrderInput` to `src/types/storefront.ts`**

```ts
import type { DeliveryZone, Fulfillment, PaymentMethod, CardType } from "@/types/orders";

export interface CartItem {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
}

export type FlowState = "feed" | "cart" | "checkout" | "pixWaiting" | "success";

export interface PlaceOrderInput {
    customerName: string;
    customerPhone: string;
    fulfillment: Fulfillment;
    deliveryZone?: DeliveryZone;
    paymentMethod: PaymentMethod;
    cardType?: CardType;
    changeFor?: number;
}
```

- [ ] **Step 4: Extend `DEFAULT_PREFERENCES` in `src/app/providers/PreferencesProvider.tsx`**

Add two fields to the existing object literal (do not touch the other fields):

```ts
export const DEFAULT_PREFERENCES: PreferencesState = {
    theme: "light",
    fontSize: FONT_SIZES[1],
    compactMode: false,
    denseTable: true,
    reducedMotion: false,
    language: DEFAULT_LANGUAGE,
    timezone: TIMEZONES[0],
    dateFormat: DEFAULT_LANGUAGE === "Português (Brasil)" ? "DD/MM/YYYY" : DATE_FORMATS[0],
    currency: DEFAULT_LANGUAGE === "Português (Brasil)" ? "BRL — Real Brasileiro" : CURRENCIES[0],
    sidebarNavigation: "expanded",
    storefrontLogo: null,
    storefrontCover: null,
    storefrontBrandColor: "#0f172a",
    whatsappNumber: "",
    deliveryZones: [],
};
```

- [ ] **Step 5: Verify types compile**

Run: `yarn build`
Expected: succeeds (these are additive/optional fields, so no existing consumer breaks yet — `Order.deliveryZone`/`etaMinutes` are optional, `PreferencesState`'s two new fields are always supplied by `DEFAULT_PREFERENCES`).

- [ ] **Step 6: Commit**

```bash
git add src/types/orders.ts src/types/preferences.ts src/types/storefront.ts src/app/providers/PreferencesProvider.tsx
git commit -m "feat(types): add DeliveryZone, Order eta/zone fields, WhatsApp/zones preferences" -- src/types/orders.ts src/types/preferences.ts src/types/storefront.ts src/app/providers/PreferencesProvider.tsx
```

---

### Task 2: Preferences — WhatsApp business number + ordering link

**Files:**
- Modify: `src/features/preferences/components/StorefrontSection.tsx`
- Modify: `src/i18n/locales/en/preferences.json`
- Modify: `src/i18n/locales/pt-BR/preferences.json`

**Interfaces:**
- Consumes: `usePreferencesContext()` → `{ preferences: PreferencesState, updatePreference }` (existing, `src/app/providers/PreferencesProvider.tsx`). Reads `preferences.whatsappNumber`, writes via `updatePreference("whatsappNumber", value)`.
- Produces: nothing new consumed by later tasks — this is a leaf UI addition. (Task 7's WhatsApp deep links use the *customer's* `order.customerPhone`, not this restaurant business number, so there's no dependency.)

- [ ] **Step 1: Read the current preferences.json structure for the `storefrontSection` key**

Run: `Read src/i18n/locales/en/preferences.json` — confirm the `storefrontSection` object's existing keys (`title`, `description`, `previewStore`, `storeLogo`, etc.) before adding siblings, so key names/style stay consistent.

- [ ] **Step 2: Add a WhatsApp number field + ordering-link row to `StorefrontSection.tsx`**

Add a `Phone` icon import from `lucide-react` (`ExternalLink, Copy, Check` already partly imported — add `Phone` and `Copy`, `Check` if not present) and this block after the existing brand-color block (before the closing `</div>` of the `px-5 py-5 space-y-5` container), plus a small local copy-state hook mirroring `QuickActions.tsx`'s `handleCopy` pattern (`${window.location.origin}/storefront`):

```tsx
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Store, Camera, ImagePlus, ExternalLink, Phone, Copy, Check } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";

// ...inside StorefrontSection, alongside the other hooks:
const [linkCopied, setLinkCopied] = useState(false);
const orderingLink = `${window.location.origin}/storefront`;

const handleCopyLink = async () => {
    try {
        await navigator.clipboard.writeText(orderingLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    } catch {
        // Clipboard permission denied by the browser — nothing to recover here.
    }
};
```

```tsx
                <div className="border-t border-slate-50" />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.whatsappLabel")}</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={preferences.whatsappNumber}
                            onChange={(e) => updatePreference("whatsappNumber", e.target.value.replace(/[^\d]/g, ""))}
                            placeholder={t("storefrontSection.whatsappPlaceholder")}
                            className={`${inputCls} pl-8 font-mono`}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{t("storefrontSection.whatsappHint")}</p>
                </div>

                <div className="border-t border-slate-50" />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.orderingLinkLabel")}</label>
                    <div className="flex items-center gap-2">
                        <input type="text" readOnly value={orderingLink} className={`${inputCls} font-mono text-xs`} />
                        <button
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                        >
                            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {linkCopied ? t("storefrontSection.linkCopied") : t("storefrontSection.copyLink")}
                        </button>
                    </div>
                </div>
```

(`useNavigate` import above is only needed if not already imported — it already is, at the top of the existing file; do not duplicate the import line.)

- [ ] **Step 3: Add the new keys to `src/i18n/locales/en/preferences.json`** inside the existing `storefrontSection` object:

```json
"whatsappLabel": "WhatsApp Business Number",
"whatsappPlaceholder": "5511999998888",
"whatsappHint": "Digits only, with country code — used to build WhatsApp links for customer notifications.",
"orderingLinkLabel": "Shareable Ordering Link",
"copyLink": "Copy Link",
"linkCopied": "Copied!"
```

- [ ] **Step 4: Add the pt-BR equivalents to `src/i18n/locales/pt-BR/preferences.json`** inside the same `storefrontSection` object:

```json
"whatsappLabel": "Número do WhatsApp Business",
"whatsappPlaceholder": "5511999998888",
"whatsappHint": "Somente números, com código do país — usado para montar links de WhatsApp para notificar clientes.",
"orderingLinkLabel": "Link de Pedidos Compartilhável",
"copyLink": "Copiar Link",
"linkCopied": "Copiado!"
```

- [ ] **Step 5: Build + lint**

Run: `yarn build && yarn lint`
Expected: clean (no new errors in `preferences` files).

- [ ] **Step 6: Commit**

```bash
git add src/features/preferences/components/StorefrontSection.tsx src/i18n/locales/en/preferences.json src/i18n/locales/pt-BR/preferences.json
git commit -m "feat(preferences): add WhatsApp business number field and ordering link copy" -- src/features/preferences/components/StorefrontSection.tsx src/i18n/locales/en/preferences.json src/i18n/locales/pt-BR/preferences.json
```

---

### Task 3: Preferences — Delivery zones config (bairro list)

**Files:**
- Create: `src/features/preferences/components/DeliveryZonesSection.tsx`
- Modify: `src/features/preferences/components/PreferencesFeature.tsx`
- Modify: `src/i18n/locales/en/preferences.json`
- Modify: `src/i18n/locales/pt-BR/preferences.json`

**Interfaces:**
- Consumes: `usePreferencesContext()` → `preferences.deliveryZones: DeliveryZone[]`, `updatePreference("deliveryZones", next)`.
- Produces: nothing new consumed elsewhere — later tasks (4, 5) read `preferences.deliveryZones` directly from the same context, filtering to `active` zones themselves.

- [ ] **Step 1: Create `DeliveryZonesSection.tsx`**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPinned, Plus, Trash2 } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import type { DeliveryZone } from "@/types/orders";

function makeZoneId(): string {
    return `zone-${Math.random().toString(36).slice(2, 9)}`;
}

export function DeliveryZonesSection() {
    const { t } = useTranslation("preferences");
    const { preferences, updatePreference } = usePreferencesContext();
    const { deliveryZones } = preferences;

    const [neighborhood, setNeighborhood] = useState("");
    const [feeAmount, setFeeAmount] = useState("");
    const [etaMinutes, setEtaMinutes] = useState("");
    const [error, setError] = useState<string | null>(null);

    const inputCls = "w-full h-9 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all";

    const handleAdd = () => {
        const trimmed = neighborhood.trim();
        const fee = parseFloat(feeAmount);
        const eta = parseInt(etaMinutes, 10);
        if (!trimmed) { setError(t("deliveryZonesSection.errors.nameRequired")); return; }
        if (!Number.isFinite(fee) || fee < 0) { setError(t("deliveryZonesSection.errors.feeInvalid")); return; }
        if (!Number.isFinite(eta) || eta <= 0) { setError(t("deliveryZonesSection.errors.etaInvalid")); return; }
        setError(null);
        const zone: DeliveryZone = { id: makeZoneId(), neighborhood: trimmed, feeAmount: fee, etaMinutes: eta, active: true };
        updatePreference("deliveryZones", [...deliveryZones, zone]);
        setNeighborhood(""); setFeeAmount(""); setEtaMinutes("");
    };

    const handleRemove = (id: string) => {
        updatePreference("deliveryZones", deliveryZones.filter((z) => z.id !== id));
    };

    const handleToggleActive = (id: string) => {
        updatePreference("deliveryZones", deliveryZones.map((z) => z.id === id ? { ...z, active: !z.active } : z));
    };

    return (
        <div className="bg-white rounded-[8px] border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-slate-950 flex items-center justify-center flex-shrink-0">
                    <MapPinned className="w-4 h-4 text-slate-100" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800">{t("deliveryZonesSection.title")}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t("deliveryZonesSection.description")}</p>
                </div>
            </div>

            <div className="px-5 py-5 space-y-4">
                {deliveryZones.length === 0 ? (
                    <p className="text-xs text-slate-400">{t("deliveryZonesSection.empty")}</p>
                ) : (
                    <div className="space-y-2">
                        {deliveryZones.map((zone) => (
                            <div key={zone.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-[8px] px-3 py-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <button
                                        onClick={() => handleToggleActive(zone.id)}
                                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0 ${zone.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}
                                    >
                                        {zone.active ? t("deliveryZonesSection.activeLabel") : t("deliveryZonesSection.inactiveLabel")}
                                    </button>
                                    <p className="text-sm font-medium text-slate-800 truncate">{zone.neighborhood}</p>
                                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">${zone.feeAmount.toFixed(2)} · {t("deliveryZonesSection.etaMinutesValue", { count: zone.etaMinutes })}</span>
                                </div>
                                <button onClick={() => handleRemove(zone.id)} className="w-7 h-7 flex-shrink-0 rounded-[6px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-slate-50 pt-4">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                        <input className={inputCls} placeholder={t("deliveryZonesSection.namePlaceholder")} value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                        <input className={`${inputCls} w-24 font-mono`} type="number" min="0" step="0.01" placeholder={t("deliveryZonesSection.feePlaceholder")} value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
                        <input className={`${inputCls} w-24 font-mono`} type="number" min="1" step="1" placeholder={t("deliveryZonesSection.etaPlaceholder")} value={etaMinutes} onChange={(e) => setEtaMinutes(e.target.value)} />
                        <button onClick={handleAdd} className="h-9 px-3 rounded-[8px] bg-slate-950 text-slate-50 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors flex-shrink-0">
                            <Plus className="w-3.5 h-3.5" /> {t("deliveryZonesSection.addButton")}
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Render it in `PreferencesFeature.tsx`**

Add the import and place it right after `<StorefrontSection />`:

```tsx
import { DeliveryZonesSection } from "@/features/preferences/components/DeliveryZonesSection";
// ...
                <div className="space-y-4">
                    <StorefrontSection />
                    <DeliveryZonesSection />
```

- [ ] **Step 3: Add keys to `src/i18n/locales/en/preferences.json`** as a new top-level `deliveryZonesSection` object:

```json
"deliveryZonesSection": {
  "title": "Delivery Zones",
  "description": "Neighborhoods you deliver to, with a delivery fee and ETA for each.",
  "empty": "No delivery zones configured yet — Delivery will be unavailable at checkout until you add one.",
  "activeLabel": "Active",
  "inactiveLabel": "Inactive",
  "etaMinutesValue": "{{count}} min",
  "namePlaceholder": "Neighborhood name",
  "feePlaceholder": "Fee",
  "etaPlaceholder": "ETA (min)",
  "addButton": "Add Zone",
  "errors": {
    "nameRequired": "Enter a neighborhood name.",
    "feeInvalid": "Enter a valid, non-negative fee.",
    "etaInvalid": "Enter a valid ETA in minutes."
  }
}
```

- [ ] **Step 4: Add the pt-BR equivalent to `src/i18n/locales/pt-BR/preferences.json`**

```json
"deliveryZonesSection": {
  "title": "Zonas de Entrega",
  "description": "Bairros para os quais você entrega, com taxa e prazo estimado para cada um.",
  "empty": "Nenhuma zona de entrega configurada ainda — a Entrega ficará indisponível no checkout até que você adicione uma.",
  "activeLabel": "Ativa",
  "inactiveLabel": "Inativa",
  "etaMinutesValue": "{{count}} min",
  "namePlaceholder": "Nome do bairro",
  "feePlaceholder": "Taxa",
  "etaPlaceholder": "Prazo (min)",
  "addButton": "Adicionar Zona",
  "errors": {
    "nameRequired": "Informe o nome de um bairro.",
    "feeInvalid": "Informe uma taxa válida e não negativa.",
    "etaInvalid": "Informe um prazo válido em minutos."
  }
}
```

- [ ] **Step 5: Build + lint**

Run: `yarn build && yarn lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/features/preferences/components/DeliveryZonesSection.tsx src/features/preferences/components/PreferencesFeature.tsx src/i18n/locales/en/preferences.json src/i18n/locales/pt-BR/preferences.json
git commit -m "feat(preferences): add delivery zones (bairro) configuration" -- src/features/preferences/components/DeliveryZonesSection.tsx src/features/preferences/components/PreferencesFeature.tsx src/i18n/locales/en/preferences.json src/i18n/locales/pt-BR/preferences.json
```

---

### Task 4: Storefront checkout — real fulfillment/zone picker, customer capture, real order creation

**Files:**
- Modify: `src/features/storefront/constants/storefront.constants.ts`
- Modify: `src/features/storefront/components/CheckoutFlow.tsx`
- Modify: `src/features/storefront/components/CartOverlay.tsx`
- Modify: `src/features/storefront/hooks/useStorefront.ts`
- Modify: `src/features/storefront/components/StorefrontFeature.tsx`
- Modify: `src/features/storefront/components/SuccessView.tsx`
- Modify: `src/i18n/locales/en/storefront.json`
- Modify: `src/i18n/locales/pt-BR/storefront.json`

**Interfaces:**
- Consumes: `PlaceOrderInput` (Task 1, `@/types/storefront`), `DeliveryZone` (Task 1, `@/types/orders`), `ordersService.createOrder` (existing, `@/features/orders/services/orders.service`), `usePreferencesContext()` (existing).
- Produces: `useStorefront()` now also returns `placeOrder: (input: PlaceOrderInput) => void`, `placedOrder: Order | null`, `isPlacingOrder: boolean` — nothing downstream of this task consumes these except `StorefrontFeature`/`SuccessView` in this same task.

- [ ] **Step 1: Read the current `storefront.constants.ts`**

Run: `Read src/features/storefront/constants/storefront.constants.ts` — confirm `CATEGORIES`'s export style before appending a sibling constant.

- [ ] **Step 2: Add `PICKUP_ETA_MINUTES` to `storefront.constants.ts`**

```ts
export const PICKUP_ETA_MINUTES = 15;
```

- [ ] **Step 3: Rewrite `CheckoutFlow.tsx`**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User, Phone, MapPin, Clock } from "lucide-react";
import type { DeliveryZone, Fulfillment, PaymentMethod, CardType } from "@/types/orders";
import type { PlaceOrderInput } from "@/types/storefront";
import { PaymentMethodPicker } from "@/components/payment/PaymentMethodPicker";
import { PICKUP_ETA_MINUTES } from "../constants/storefront.constants";

interface CheckoutFlowProps {
    zones: DeliveryZone[];
    onBack: () => void;
    onPlaceOrder: (input: PlaceOrderInput) => void;
}

export const CheckoutFlow = ({ zones, onBack, onPlaceOrder }: CheckoutFlowProps) => {
    const { t } = useTranslation("storefront");
    const { t: tPayment } = useTranslation("payment");
    const activeZones = zones.filter((z) => z.active);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [fulfillment, setFulfillment] = useState<Fulfillment>(activeZones.length > 0 ? "Delivery" : "Pickup");
    const [zoneId, setZoneId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [cardType, setCardType] = useState<CardType | null>(null);
    const [changeFor, setChangeFor] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const selectedZone = activeZones.find((z) => z.id === zoneId) ?? null;
    const etaMinutes = fulfillment === "Delivery" ? (selectedZone?.etaMinutes ?? null) : PICKUP_ETA_MINUTES;

    function validate() {
        const e: Record<string, string> = {};
        if (!customerName.trim()) e.customerName = t("checkout.errors.nameRequired");
        if (!customerPhone.trim()) e.customerPhone = t("checkout.errors.phoneRequired");
        if (fulfillment === "Delivery" && !zoneId) e.zone = t("checkout.errors.zoneRequired");
        if (!paymentMethod) e.paymentMethod = tPayment("errors.methodRequired");
        if (paymentMethod === "Card" && !cardType) e.cardType = tPayment("errors.cardTypeRequired");
        return e;
    }

    const handlePlaceOrder = () => {
        setSubmitted(true);
        const e = validate();
        if (Object.keys(e).length > 0) return;
        onPlaceOrder({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            fulfillment,
            deliveryZone: fulfillment === "Delivery" ? (selectedZone ?? undefined) : undefined,
            paymentMethod: paymentMethod as PaymentMethod,
            cardType: cardType ?? undefined,
            changeFor: parseFloat(changeFor) > 0 ? parseFloat(changeFor) : undefined,
        });
    };

    const errors = submitted ? validate() : {};
    const inputCls = (err?: string) => `w-full h-10 px-3 rounded-[8px] border text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-950/10 ${err ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-slate-50 focus:border-slate-400"}`;

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col">
            <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 flex-shrink-0">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-slate-900 -ml-1">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[17px] font-semibold text-slate-900 ml-2">{t("checkout.title")}</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <section className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-4 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 mb-1">{t("checkout.yourDetailsLabel")}</h2>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("checkout.nameLabel")}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input className={`${inputCls(errors.customerName)} pl-8`} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("checkout.namePlaceholder")} />
                        </div>
                        {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("checkout.phoneLabel")}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input className={`${inputCls(errors.customerPhone)} pl-8`} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={t("checkout.phonePlaceholder")} />
                        </div>
                        {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>}
                        <p className="text-[10px] text-slate-400 mt-1">{t("checkout.phoneHint")}</p>
                    </div>
                </section>

                <section className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-4 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 mb-1">{t("checkout.fulfillmentLabel")}</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setFulfillment("Pickup")}
                            className={`h-10 rounded-[8px] text-sm font-medium border transition-colors ${fulfillment === "Pickup" ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                            {t("checkout.fulfillmentPickup")}
                        </button>
                        <button
                            onClick={() => activeZones.length > 0 && setFulfillment("Delivery")}
                            disabled={activeZones.length === 0}
                            className={`h-10 rounded-[8px] text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${fulfillment === "Delivery" ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                            {t("checkout.fulfillmentDelivery")}
                        </button>
                    </div>
                    {activeZones.length === 0 && (
                        <p className="text-xs text-amber-600">{t("checkout.noZonesAvailable")}</p>
                    )}

                    {fulfillment === "Delivery" && activeZones.length > 0 && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("checkout.zoneLabel")}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <select className={`${inputCls(errors.zone)} pl-8 cursor-pointer`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                                    <option value="">{t("checkout.zonePlaceholder")}</option>
                                    {activeZones.map((z) => (
                                        <option key={z.id} value={z.id}>{z.neighborhood} — ${z.feeAmount.toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.zone && <p className="text-xs text-red-500 mt-1">{errors.zone}</p>}
                        </div>
                    )}

                    {etaMinutes != null && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" /> {t("checkout.etaEstimate", { count: etaMinutes })}
                        </div>
                    )}
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
                                method: errors.paymentMethod,
                                cardType: errors.cardType,
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

- [ ] **Step 4: Simplify `CartOverlay.tsx`'s fee display** — the flat `$3.50` was a placeholder assumption from before fulfillment even exists as a choice; the real fee is now decided at checkout per zone. Replace the delivery-fee row and the button's `total + 3.50` with a subtotal-only view:

```tsx
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">{t("cart.subtotalLabel")}</span>
                        <span className="text-sm font-mono font-medium text-slate-900">${total.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{t("cart.feeNote")}</p>
                </div>

                <div className="p-5 pt-3 bg-white">
                    <button disabled={cart.length === 0} onClick={onCheckout} className="w-full h-[52px] bg-slate-950 text-slate-50 rounded-[8px] flex items-center justify-center gap-2 font-semibold text-[15px] hover:bg-slate-900 disabled:opacity-50 transition-all">
                        {t("cart.checkoutButton")} • <span className="font-mono">${total.toFixed(2)}</span>
                    </button>
                </div>
```

(`t("cart.deliveryFeeLabel")` becomes unused — leave the JSON key in place rather than chasing a now-dead string across both locale files; it's harmless and cheap to leave, unlike shipping a broken UI.)

- [ ] **Step 5: Add `placeOrder`/`placedOrder` to `useStorefront.ts`**

```ts
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, FlowState, PlaceOrderInput } from "@/types/storefront";
import type { MenuItem } from "@/types/menu";
import type { Order, OrderLine } from "@/types/orders";
import { storefrontService } from "../services/storefront.service";
import { ordersService } from "@/features/orders/services/orders.service";
import { PICKUP_ETA_MINUTES } from "../constants/storefront.constants";

export const useStorefront = () => {
    const [activeCategory, setActiveCategory] = useState("Burgers");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [flowState, setFlowState] = useState<FlowState>("feed");
    const queryClient = useQueryClient();

    const { data: menuItems = [], isLoading } = useQuery({
        queryKey: ["menuItems"],
        queryFn: storefrontService.getMenu,
        select: (items) => items.filter((item) => item.available),
    });

    const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((x) => x.menuId === item.menuId);
            if (existing) {
                return prev.map((x) =>
                    x.menuId === item.menuId ? { ...x, quantity: x.quantity + item.quantity } : x
                );
            }
            return [...prev, item];
        });
    };

    const createOrderMutation = useMutation({
        mutationFn: (input: Omit<Order, "id">) => ordersService.createOrder(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });

    const placeOrder = (input: PlaceOrderInput) => {
        const etaMinutes = input.fulfillment === "Delivery" ? (input.deliveryZone?.etaMinutes ?? PICKUP_ETA_MINUTES) : PICKUP_ETA_MINUTES;
        const deliveryFee = input.fulfillment === "Delivery" ? (input.deliveryZone?.feeAmount ?? 0) : 0;
        const items: OrderLine[] = cart.map((c) => ({
            menuItemId: c.menuId,
            name: c.name,
            quantity: c.quantity,
            unitPrice: c.price,
            modifiers: [],
        }));
        createOrderMutation.mutate({
            channel: "Online",
            fulfillment: input.fulfillment,
            deliveryZone: input.deliveryZone?.neighborhood,
            etaMinutes,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            items,
            status: "New",
            paymentStatus: "Paid",
            paymentMethod: input.paymentMethod,
            cardType: input.cardType,
            changeFor: input.changeFor,
            createdAt: new Date().toISOString().slice(0, 10),
            total: cartTotal + deliveryFee,
        });
    };

    return {
        menuItems,
        isLoading,
        activeCategory,
        setActiveCategory,
        selectedItem,
        setSelectedItem,
        cart,
        setCart,
        cartTotal,
        cartCount,
        flowState,
        setFlowState,
        addToCart,
        placeOrder,
        placedOrder: createOrderMutation.data ?? null,
        isPlacingOrder: createOrderMutation.isPending,
    };
};
```

- [ ] **Step 6: Wire it through `StorefrontFeature.tsx`**

Replace the destructuring and the `checkout`/`pixWaiting`/`success` render block:

```tsx
    const {
        menuItems, isLoading, activeCategory, setActiveCategory, selectedItem, setSelectedItem,
        cart, setCart, cartTotal, cartCount, flowState, setFlowState, addToCart,
        placeOrder, placedOrder,
    } = useStorefront();

    const { preferences } = usePreferencesContext();
    const { storefrontLogo, storefrontCover, storefrontBrandColor, deliveryZones } = preferences;
```

```tsx
                {flowState === "checkout" && (
                    <CheckoutFlow
                        zones={deliveryZones}
                        onBack={() => setFlowState("cart")}
                        onPlaceOrder={(input) => {
                            placeOrder(input);
                            setFlowState(input.paymentMethod === "PIX" ? "pixWaiting" : "success");
                        }}
                    />
                )}
                {flowState === "pixWaiting" && <PixWaitingMock onConfirmed={() => setFlowState("success")} />}
                {flowState === "success" && <SuccessView order={placedOrder} onBack={() => { setCart([]); setFlowState("feed"); }} />}
```

- [ ] **Step 7: Update `SuccessView.tsx`** to show the real order id/ETA and link "Track Order" to the new public page:

```tsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { Order } from "@/types/orders";

export const SuccessView = ({ order, onBack }: { order: Order | null; onBack: () => void }) => {
    const { t } = useTranslation("storefront");
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center pt-24 px-6 pb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-8">
                <Check className="w-12 h-12 stroke-[3]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-2">{t("success.title")}</h1>
            <p className="text-slate-500 text-center text-[15px] mb-2">{t("success.subtitle")}</p>
            {order && (
                <p className="text-xs text-slate-400 font-mono text-center mb-6">
                    {t("success.orderIdLabel", { id: order.id })}
                    {order.etaMinutes != null && ` · ${t("success.etaLabel", { count: order.etaMinutes })}`}
                </p>
            )}

            <div className="w-full mt-auto flex flex-col gap-3">
                <button
                    disabled={!order}
                    onClick={() => order && navigate(`/track-order?order=${order.id}&phone=${encodeURIComponent(order.customerPhone)}`)}
                    className="w-full h-[52px] bg-slate-950 text-white rounded-[8px] font-semibold disabled:opacity-50"
                >
                    {t("success.trackOrderButton")}
                </button>
                <button onClick={onBack} className="w-full h-[52px] bg-transparent text-slate-600 rounded-[8px] font-semibold">{t("success.backToMenuButton")}</button>
            </div>
        </div>
    );
};
```

- [ ] **Step 8: Add/update i18n keys in `src/i18n/locales/en/storefront.json`**

Replace the placeholder `checkout` object and add to `cart`/`success`:

```json
  "cart": {
    "title": "Your Cart",
    "empty": "Your cart is empty.",
    "subtotalLabel": "Subtotal",
    "deliveryFeeLabel": "Delivery Fee",
    "feeNote": "Delivery fee (if any) is added at checkout based on your neighborhood.",
    "checkoutButton": "Go to Checkout"
  },
  "checkout": {
    "title": "Checkout",
    "yourDetailsLabel": "Your Details",
    "nameLabel": "Full Name",
    "namePlaceholder": "Your name",
    "phoneLabel": "WhatsApp / Phone",
    "phonePlaceholder": "+1 555 000 0000",
    "phoneHint": "Used for order status updates.",
    "fulfillmentLabel": "Pickup or Delivery",
    "fulfillmentPickup": "Pickup",
    "fulfillmentDelivery": "Delivery",
    "noZonesAvailable": "Delivery isn't available yet — no delivery zones are configured.",
    "zoneLabel": "Neighborhood",
    "zonePlaceholder": "Select your neighborhood",
    "etaEstimate": "Estimated {{count}} min",
    "placeOrderButton": "Place Order",
    "errors": {
      "nameRequired": "Enter your name.",
      "phoneRequired": "Enter a phone number.",
      "zoneRequired": "Select a neighborhood."
    }
  },
```

And inside `success`:

```json
  "success": {
    "title": "Order Received!",
    "subtitle": "The kitchen is preparing your food.",
    "orderIdLabel": "Order {{id}}",
    "etaLabel": "{{count}} min",
    "trackOrderButton": "Track Order",
    "backToMenuButton": "Back to Menu"
  }
```

- [ ] **Step 9: Mirror the same keys in `src/i18n/locales/pt-BR/storefront.json`**

```json
  "cart": {
    "title": "Seu Carrinho",
    "empty": "Seu carrinho está vazio.",
    "subtotalLabel": "Subtotal",
    "deliveryFeeLabel": "Taxa de Entrega",
    "feeNote": "A taxa de entrega (se houver) é adicionada no checkout, de acordo com o seu bairro.",
    "checkoutButton": "Ir para o Checkout"
  },
  "checkout": {
    "title": "Checkout",
    "yourDetailsLabel": "Seus Dados",
    "nameLabel": "Nome Completo",
    "namePlaceholder": "Seu nome",
    "phoneLabel": "WhatsApp / Telefone",
    "phonePlaceholder": "+55 11 90000-0000",
    "phoneHint": "Usado para atualizações do status do pedido.",
    "fulfillmentLabel": "Retirada ou Entrega",
    "fulfillmentPickup": "Retirada",
    "fulfillmentDelivery": "Entrega",
    "noZonesAvailable": "Entrega ainda não disponível — nenhuma zona de entrega configurada.",
    "zoneLabel": "Bairro",
    "zonePlaceholder": "Selecione seu bairro",
    "etaEstimate": "Estimativa de {{count}} min",
    "placeOrderButton": "Fazer Pedido",
    "errors": {
      "nameRequired": "Informe seu nome.",
      "phoneRequired": "Informe um número de telefone.",
      "zoneRequired": "Selecione um bairro."
    }
  },
```

```json
  "success": {
    "title": "Pedido Recebido!",
    "subtitle": "A cozinha está preparando sua comida.",
    "orderIdLabel": "Pedido {{id}}",
    "etaLabel": "{{count}} min",
    "trackOrderButton": "Acompanhar Pedido",
    "backToMenuButton": "Voltar ao Menu"
  }
```

- [ ] **Step 10: Build + lint**

Run: `yarn build && yarn lint`
Expected: clean. Pay attention to the `CheckoutFlow` props change — `StorefrontFeature.tsx` must pass `zones` now.

- [ ] **Step 11: Commit**

```bash
git add src/features/storefront src/i18n/locales/en/storefront.json src/i18n/locales/pt-BR/storefront.json
git commit -m "feat(storefront): real fulfillment/zone checkout, customer capture, real order creation" -- src/features/storefront src/i18n/locales/en/storefront.json src/i18n/locales/pt-BR/storefront.json
```

---

### Task 5: Staff-created Phone orders — delivery zone parity in `CreateOrderModal`

**Files:**
- Modify: `src/features/orders/components/CreateOrderModal.tsx`
- Modify: `src/i18n/locales/en/orders.json`
- Modify: `src/i18n/locales/pt-BR/orders.json`

**Interfaces:**
- Consumes: `usePreferencesContext()` (existing), `DeliveryZone` (Task 1).
- Produces: nothing new — leaf UI change, same `onSave: (o: Omit<Order, "id">) => void` contract as before.

- [ ] **Step 1: Add zone state + gating, mirroring `CheckoutFlow`'s Task 4 pattern**

In `CreateOrderModal.tsx`, add the import and state:

```tsx
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
// ...
    const { preferences } = usePreferencesContext();
    const activeZones = preferences.deliveryZones.filter((z) => z.active);
    const [zoneId, setZoneId] = useState("");
```

- [ ] **Step 2: Extend the existing `channel === "Phone"` fulfillment branch** to show a zone select when `fulfillment === "Delivery"`:

Replace the existing `else` branch (fulfillment select) with:

```tsx
                                ) : (
                                    <div className="col-span-2 space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("createModal.fulfillmentLabel")}</label>
                                            <select className={`${inputCls()} cursor-pointer`} value={fulfillment} onChange={(e) => setFulfillment(e.target.value as Fulfillment)}>
                                                <option value="Pickup">{t("createModal.fulfillmentPickup")}</option>
                                                <option value="Delivery" disabled={activeZones.length === 0}>{t("createModal.fulfillmentDelivery")}</option>
                                            </select>
                                        </div>
                                        {fulfillment === "Delivery" && (
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("createModal.zoneLabel")}</label>
                                                <select className={`${inputCls(submitted ? errors.zone : undefined)} cursor-pointer`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                                                    <option value="">{t("createModal.zonePlaceholder")}</option>
                                                    {activeZones.map((z) => <option key={z.id} value={z.id}>{z.neighborhood}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
```

- [ ] **Step 3: Extend `validate()` and `handleSubmit()`**

```ts
        if (channel === "Phone" && fulfillment === "Delivery" && !zoneId) e.zone = t("createModal.errors.zoneRequired");
```

and in `handleSubmit`, resolve the zone and include it:

```ts
        const selectedZone = activeZones.find((z) => z.id === zoneId);
        onSave({
            channel,
            fulfillment: channel === "Phone" ? fulfillment : undefined,
            table: channel === "Dine-in" ? selectedTable?.name : undefined,
            deliveryZone: channel === "Phone" && fulfillment === "Delivery" ? selectedZone?.neighborhood : undefined,
            etaMinutes: channel === "Phone" && fulfillment === "Delivery" ? selectedZone?.etaMinutes : undefined,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            status,
            paymentStatus: "PayLater",
            paymentMethod: paymentMethod ?? undefined,
            cardType: paymentMethod === "Card" ? (cardType ?? undefined) : undefined,
            changeFor: paymentMethod === "Cash" && parsedChangeFor > 0 ? parsedChangeFor : undefined,
            createdAt: now.toISOString().slice(0, 10),
            total: grandTotal,
            items: orderItems,
        });
```

- [ ] **Step 4: Add keys to `src/i18n/locales/en/orders.json`** inside the existing `createModal` object:

```json
"zoneLabel": "Neighborhood",
"zonePlaceholder": "Select neighborhood",
```

and inside `createModal.errors`:

```json
"zoneRequired": "Select a delivery neighborhood."
```

- [ ] **Step 5: Mirror in `src/i18n/locales/pt-BR/orders.json`**

```json
"zoneLabel": "Bairro",
"zonePlaceholder": "Selecione o bairro",
```

```json
"zoneRequired": "Selecione um bairro de entrega."
```

- [ ] **Step 6: Build + lint**

Run: `yarn build && yarn lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/features/orders/components/CreateOrderModal.tsx src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json
git commit -m "feat(orders): delivery zone picker for staff-created Phone+Delivery orders" -- src/features/orders/components/CreateOrderModal.tsx src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json
```

---

### Task 6: Public order-status tracking page (`features/track-order`)

**Files:**
- Create: `src/features/track-order/services/trackOrder.service.ts`
- Create: `src/features/track-order/hooks/useTrackOrder.ts`
- Create: `src/features/track-order/components/TrackOrderFeature.tsx`
- Create: `src/features/track-order/index.ts`
- Create: `src/pages/TrackOrder.tsx`
- Modify: `src/app/router.tsx`
- Create: `src/i18n/locales/en/trackOrder.json`
- Create: `src/i18n/locales/pt-BR/trackOrder.json`
- Modify: `src/i18n/config.ts`

**Interfaces:**
- Consumes: `Order`/`OrderStatus` (existing, `@/types/orders`), `ordersService.getOrders` (existing) via the shared `["orders"]` TanStack Query cache key (same key Orders/KDS use — this is how a staff status change becomes visible here live, same mechanism Phase 4 verified for Orders↔KDS).
- Produces: nothing consumed by later tasks — this is the terminal customer-facing surface for this plan.

- [ ] **Step 1: Create `trackOrder.service.ts`**, composing the existing orders service (same shape as `table-menu.service.ts`'s composition of `menuService`+`tablesService`):

```ts
import { ordersService } from "@/features/orders/services/orders.service";
import type { Order } from "@/types/orders";

export const trackOrderService = {
    getOrders: async (): Promise<Order[]> => {
        return ordersService.getOrders();
    },
};
```

- [ ] **Step 2: Create `useTrackOrder.ts`**

```ts
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trackOrderService } from "../services/trackOrder.service";

export const useTrackOrder = () => {
    const [searchParams] = useSearchParams();
    const urlOrderId = searchParams.get("order") ?? "";
    const urlPhone = searchParams.get("phone") ?? "";

    const [orderIdInput, setOrderIdInput] = useState(urlOrderId);
    const [phoneInput, setPhoneInput] = useState(urlPhone);
    const [lookup, setLookup] = useState<{ orderId: string; phone: string } | null>(
        urlOrderId && urlPhone ? { orderId: urlOrderId, phone: urlPhone } : null
    );

    const { data: orders = [], isLoading, isFetched } = useQuery({
        queryKey: ["orders"],
        queryFn: trackOrderService.getOrders,
        enabled: !!lookup,
    });

    const order = lookup
        ? orders.find((o) => o.id === lookup.orderId && o.customerPhone === lookup.phone) ?? null
        : null;

    const submitLookup = () => {
        if (orderIdInput.trim() && phoneInput.trim()) {
            setLookup({ orderId: orderIdInput.trim(), phone: phoneInput.trim() });
        }
    };

    return {
        orderIdInput,
        setOrderIdInput,
        phoneInput,
        setPhoneInput,
        submitLookup,
        order,
        isLoading: !!lookup && isLoading,
        notFound: !!lookup && isFetched && !isLoading && !order,
        hasSearched: !!lookup,
    };
};
```

- [ ] **Step 3: Create `TrackOrderFeature.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { Search, Clock, PackageCheck, CheckCircle2, XCircle, Loader2, MapPin } from "lucide-react";
import type { OrderStatus } from "@/types/orders";
import { useTrackOrder } from "../hooks/useTrackOrder";

const STEPS: OrderStatus[] = ["New", "Preparing", "Ready", "Completed"];
const STEP_ICON: Record<OrderStatus, React.ElementType> = {
    New: Clock,
    Preparing: Loader2,
    Ready: PackageCheck,
    Completed: CheckCircle2,
    Cancelled: XCircle,
};

export const TrackOrderFeature = () => {
    const { t } = useTranslation("trackOrder");
    const { orderIdInput, setOrderIdInput, phoneInput, setPhoneInput, submitLookup, order, isLoading, notFound, hasSearched } = useTrackOrder();

    return (
        <div className="min-h-screen flex items-start justify-center py-8 px-4 bg-[#f8fafc] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]">
            <div className="relative w-full bg-white overflow-hidden shadow-2xl shadow-slate-900/25 flex flex-col" style={{ maxWidth: 420, minHeight: "60vh", borderRadius: 32, border: "1px solid rgba(15,23,42,0.1)" }}>
                <div className="px-6 py-6 border-b border-slate-100">
                    <h1 className="text-lg font-bold text-slate-900">{t("title")}</h1>
                    <p className="text-xs text-slate-400 mt-1">{t("subtitle")}</p>
                </div>

                {!order && (
                    <div className="px-6 py-6 space-y-3">
                        <input
                            className="w-full h-10 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400"
                            placeholder={t("orderIdPlaceholder")}
                            value={orderIdInput}
                            onChange={(e) => setOrderIdInput(e.target.value)}
                        />
                        <input
                            className="w-full h-10 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400"
                            placeholder={t("phonePlaceholder")}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                        />
                        <button onClick={submitLookup} className="w-full h-10 rounded-[8px] bg-slate-950 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800">
                            <Search className="w-3.5 h-3.5" /> {t("lookupButton")}
                        </button>
                        {isLoading && <p className="text-xs text-slate-400 text-center">{t("loading")}</p>}
                        {notFound && <p className="text-xs text-red-500 text-center">{t("notFound")}</p>}
                    </div>
                )}

                {order && (
                    <div className="px-6 py-6 space-y-6">
                        <div>
                            <p className="text-xs text-slate-400 font-mono">{t("orderIdLabel", { id: order.id })}</p>
                            {order.etaMinutes != null && order.status !== "Completed" && order.status !== "Cancelled" && (
                                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t("etaLabel", { count: order.etaMinutes })}</p>
                            )}
                            {order.deliveryZone && (
                                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.deliveryZone}</p>
                            )}
                        </div>

                        {order.status === "Cancelled" ? (
                            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-[8px] px-4 py-3">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{t("cancelled")}</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {STEPS.map((step, idx) => {
                                    const currentIdx = STEPS.indexOf(order.status);
                                    const isDone = idx <= currentIdx;
                                    const Icon = STEP_ICON[step];
                                    return (
                                        <div key={step} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-300"}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-sm font-medium ${isDone ? "text-slate-900" : "text-slate-300"}`}>{t(`steps.${step}`)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{t("itemsLabel")}</p>
                            <ul className="space-y-1">
                                {order.items.map((line, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">{line.quantity}x {line.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
```

- [ ] **Step 4: Create `src/features/track-order/index.ts`**

```ts
export * from "./components/TrackOrderFeature";
```

- [ ] **Step 5: Create `src/pages/TrackOrder.tsx`**

```tsx
import { TrackOrderFeature } from "@/features/track-order";

export default function TrackOrderPage() {
    return <TrackOrderFeature />;
}
```

- [ ] **Step 6: Register the route in `src/app/router.tsx`**

Add the import alongside the other standalone pages:

```tsx
import TrackOrderPage from '@/pages/TrackOrder';
```

Add the route in the "Standalone Routes (Outside Admin Shell)" block, alongside `/table-menu`:

```tsx
  {
    path: '/track-order',
    element: <TrackOrderPage />,
  },
```

- [ ] **Step 7: Create `src/i18n/locales/en/trackOrder.json`**

```json
{
  "title": "Track Your Order",
  "subtitle": "Enter your order ID and phone number to see its status.",
  "orderIdPlaceholder": "Order ID (e.g. DEL-2024-8801)",
  "phonePlaceholder": "Phone number used at checkout",
  "lookupButton": "Track Order",
  "loading": "Looking up your order...",
  "notFound": "No order found matching that ID and phone number.",
  "orderIdLabel": "Order {{id}}",
  "etaLabel": "Estimated {{count}} min",
  "cancelled": "This order was cancelled.",
  "itemsLabel": "Items",
  "steps": {
    "New": "Order received",
    "Preparing": "Preparing",
    "Ready": "Ready",
    "Completed": "Completed"
  }
}
```

- [ ] **Step 8: Create `src/i18n/locales/pt-BR/trackOrder.json`**

```json
{
  "title": "Acompanhe Seu Pedido",
  "subtitle": "Informe o número do pedido e o telefone para ver o status.",
  "orderIdPlaceholder": "Número do pedido (ex: DEL-2024-8801)",
  "phonePlaceholder": "Telefone usado no checkout",
  "lookupButton": "Acompanhar Pedido",
  "loading": "Buscando seu pedido...",
  "notFound": "Nenhum pedido encontrado com esse número e telefone.",
  "orderIdLabel": "Pedido {{id}}",
  "etaLabel": "Estimativa de {{count}} min",
  "cancelled": "Este pedido foi cancelado.",
  "itemsLabel": "Itens",
  "steps": {
    "New": "Pedido recebido",
    "Preparing": "Em preparo",
    "Ready": "Pronto",
    "Completed": "Concluído"
  }
}
```

- [ ] **Step 9: Register the new `trackOrder` namespace in `src/i18n/config.ts`**

```ts
import enTrackOrder from "./locales/en/trackOrder.json";
import ptBrTrackOrder from "./locales/pt-BR/trackOrder.json";
```

Add `trackOrder: enTrackOrder,` to the `en` resources object and `trackOrder: ptBrTrackOrder,` to the `pt-BR` one.

- [ ] **Step 10: Build + lint**

Run: `yarn build && yarn lint`
Expected: clean.

- [ ] **Step 11: Commit**

```bash
git add src/features/track-order src/pages/TrackOrder.tsx src/app/router.tsx src/i18n/locales/en/trackOrder.json src/i18n/locales/pt-BR/trackOrder.json src/i18n/config.ts
git commit -m "feat(track-order): public order-status timeline page" -- src/features/track-order src/pages/TrackOrder.tsx src/app/router.tsx src/i18n/locales/en/trackOrder.json src/i18n/locales/pt-BR/trackOrder.json src/i18n/config.ts
```

---

### Task 7: WhatsApp "notify customer" deep links (Orders + KDS)

**Files:**
- Create: `src/utils/whatsapp.ts`
- Modify: `src/features/orders/components/OrderDrawer.tsx`
- Modify: `src/features/kds/components/KdsTicket.tsx`
- Modify: `src/i18n/locales/en/orders.json`
- Modify: `src/i18n/locales/pt-BR/orders.json`
- Modify: `src/i18n/locales/en/kds.json`
- Modify: `src/i18n/locales/pt-BR/kds.json`

**Interfaces:**
- Produces: `buildWhatsAppLink(phone: string, message: string): string` (in `@/utils/whatsapp`) — used by both `OrderDrawer.tsx` and `KdsTicket.tsx` in this same task (2 real consumers, justifying a shared `src/utils/` location rather than a feature-local one, per this repo's "second consumer today" rule).

- [ ] **Step 1: Create `src/utils/whatsapp.ts`**

```ts
export function buildWhatsAppLink(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Wire the existing dead "Contact Customer" button in `OrderDrawer.tsx`**

Add the import:

```tsx
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/utils/whatsapp";
```

Replace the button in the footer (`<button className="h-9 px-4 rounded-[8px] border border-slate-200 ...">{t("drawer.contactCustomerButton")}</button>`) with:

```tsx
            <button
              onClick={() => window.open(buildWhatsAppLink(order.customerPhone, t("drawer.whatsappMessage", { id: order.id, status: t(`status.${order.status.toLowerCase()}`) })), "_blank", "noopener,noreferrer")}
              className="h-9 px-4 rounded-[8px] border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" /> {t("drawer.contactCustomerButton")}
            </button>
```

- [ ] **Step 3: Add a secondary "Notify Customer" action to `KdsTicket.tsx`**

Add imports:

```tsx
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/utils/whatsapp";
```

Change the footer block to include a secondary button alongside the existing advance-status button:

```tsx
            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-[8px] space-y-2">
                {action && (
                    <button
                        onClick={() => onAdvanceStatus(action.next)}
                        className="w-full py-4 text-lg rounded-[6px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-slate-50 hover:bg-white text-slate-950 font-bold shadow-sm"
                    >
                        {actionLabelKey ? t(actionLabelKey) : action.label}
                    </button>
                )}
                <button
                    onClick={() => window.open(buildWhatsAppLink(order.customerPhone, t("whatsappMessage", { id: order.id })), "_blank", "noopener,noreferrer")}
                    className="w-full py-2.5 text-sm rounded-[6px] flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold transition-colors"
                >
                    <MessageCircle className="w-3.5 h-3.5" /> {t("notifyCustomer")}
                </button>
            </div>
```

(This replaces the previous single `{action && (<div className="p-4 border-t ...">...)}` block — remove the old wrapping `{action && (...)}` around the footer `div` since the WhatsApp button must render even when there's no next status, i.e. on `Completed`/`Cancelled` tickets, if those ever reach KDS.)

- [ ] **Step 4: Add keys to `src/i18n/locales/en/orders.json`** inside `drawer`:

```json
"whatsappMessage": "Hi! Update on your order {{id}}: {{status}}."
```

- [ ] **Step 5: Mirror in `src/i18n/locales/pt-BR/orders.json`**

```json
"whatsappMessage": "Olá! Atualização do seu pedido {{id}}: {{status}}."
```

- [ ] **Step 6: Add keys to `src/i18n/locales/en/kds.json`** at the top level:

```json
"notifyCustomer": "Notify Customer",
"whatsappMessage": "Hi! Update on your order {{id}}."
```

- [ ] **Step 7: Mirror in `src/i18n/locales/pt-BR/kds.json`**

```json
"notifyCustomer": "Notificar Cliente",
"whatsappMessage": "Olá! Atualização do seu pedido {{id}}."
```

- [ ] **Step 8: Build + lint**

Run: `yarn build && yarn lint`
Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add src/utils/whatsapp.ts src/features/orders/components/OrderDrawer.tsx src/features/kds/components/KdsTicket.tsx src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json src/i18n/locales/en/kds.json src/i18n/locales/pt-BR/kds.json
git commit -m "feat(notifications): WhatsApp deep-link customer notify action in Orders and KDS" -- src/utils/whatsapp.ts src/features/orders/components/OrderDrawer.tsx src/features/kds/components/KdsTicket.tsx src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json src/i18n/locales/en/kds.json src/i18n/locales/pt-BR/kds.json
```

---

## Out of scope (per spec/roadmap)

- **Automatic** WhatsApp sending on every status change — the spec explicitly flags this as backend/
  provider-integration work (Meta Cloud API / Twilio-equivalent), not something the frontend can
  fake meaningfully. This plan implements the frontend-buildable subset: manual `wa.me` deep links
  staff trigger, plus the customer-facing status page as the passive alternative to a push message.
- Real payment gateway charging for Online orders (`paymentStatus: "Paid"` here remains the same
  mock-confidence level Phase 8 already established for Card/PIX/Cash method capture — no PSP call
  is made). Already tracked separately in the roadmap as blocked.
- Geocoding/map-based delivery zone boundaries — zones are a flat named list (bairro name + fee +
  ETA), not polygons, matching the spec's "bairro zone config" wording, not a mapping feature.
