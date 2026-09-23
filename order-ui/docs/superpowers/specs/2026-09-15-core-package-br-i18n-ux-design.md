# Core Package — Brazil Market Fit, EN/PT-BR i18n & UX Polish

## Context

The restaurant-ops redesign (Phases 0–6, see `RESTAURANT-OPS-ROADMAP.md`) delivered a unified
Order model across Storefront/KDS/Tables/Orders/Home/Analytics/Administration. That's now
referred to as **Package 1 — Operação (Core)** in a longer-term modular product plan: the app is
growing from a single restaurant-ops tool into a suite of separately sellable modules (Fiscal,
Financeiro, Estoque, Delivery, CRM, Staff, BI, Menu Engineering, Integrations — see "Future
package roadmap" below). This spec covers **only** the Core package. It exists to (a) make the
Core package genuinely fit the Brazilian market it's actually being built for, and (b) polish the
existing UI's usability/professionalism incrementally. It is explicitly not a rewrite: the current
UI is a strong baseline, and every change here builds on it rather than replacing it.

Two prior mechanisms in the codebase are relevant and are being **replaced**, not extended:
- `src/i18n/translations.ts` + `useTranslation()` — a hand-rolled dictionary covering only 2 files
  (Sidebar, AvatarDropdown), only French/Spanish, with stale labels ("Users", "Administrators")
  that predate Phase 5's Team/Roles/Audit Log rename. Delete once react-i18next covers its ground.
- `preferences.language`'s 8-option list — only ever drove `formatCurrency`/`formatDate` locale,
  never real string translation. Collapses to two locales (see "i18n architecture" below).

`src/utils/format.ts` (`formatCurrency`/`formatDate`) and the `preferences` feature's
localStorage-backed persistence (`src/features/preferences/services/preferences.service.ts`) are
solid and reused as-is.

## Scope

**In scope** — Core package only, all currently-built features: Storefront, Table-Menu, KDS,
Orders, Menu, Tables, Home, Analytics, Administration, Notifications, Preferences, and the app
shell (Sidebar/Header/AvatarDropdown).

**Out of scope** (belongs to a future package's own spec — do not build now):
CPF/CNPJ fields, CEP/ViaCEP address autocomplete, NCM/CFOP/CST/tax-regime fields, fechamento de
caixa, CMV, ficha técnica, real WhatsApp Business API integration, real payment gateway
integration, any backend/API change (blocked per roadmap). No UI surface currently exists for
these — adding them now would be speculative plumbing with nothing to attach to.

Basic delivery-zone gating (below) **is** in scope — it's a Storefront-facing configuration
screen, not a logistics/marketplace integration. What stays deferred to Package 5 (Delivery &
Marketplace): per-zone/live-routed ETAs, driver assignment/tracking, and third-party marketplace
(iFood/99Food/Rappi) integration.

## Implementation phasing

This spec covers four differently-sized efforts (i18n is large but mechanical, delivery zones are
medium, comandas are large and architecturally new, polish is small/cosmetic). Following the same
`writing-plans` → `using-git-worktrees` → `subagent-driven-development` → `finishing-a-development-
branch` cycle each prior phase used, this becomes four sequential phases, each with its own plan
file and merge, rather than one combined plan — a defect in one shouldn't block the others from
landing:

- **Phase 7 — i18n foundation**: react-i18next setup, full string extraction across every Core
  feature, formatting (BRL/DD-MM-YYYY), terminology glossary. No new features — infra + swap only.
- **Phase 8 — Payment method**: the shared PIX/Card/Cash picker (mock PIX QR/waiting screen, Card
  crédito/débito, Cash troco) wired into `CheckoutFlow`/`CreateOrderModal`. Built before Phases 9
  and 10 since both reuse this picker (Storefront checkout, comanda-closing).
- **Phase 9 — Delivery zones**: Entrega/Retirada choice, bairro zone config + gating, ETA
  estimate, WhatsApp business number + status-timeline/notification work.
- **Phase 10 — Dine-in comandas**: `Comanda`/`Table.status`, seating flow, `/table-menu`
  self-order + Chamar garçom/Pedir a conta, waiter mobile ordering, comanda closing.
- **Phase 11 — Dashboard/visual polish**: KDS/Orders status-color unification, elapsed-time,
  Home hierarchy, empty states, scoped visual polish.

## i18n architecture

- **Library**: `react-i18next` + `i18next`. Locale strings under `src/i18n/locales/{en,pt-BR}/*.json`,
  namespaced per feature (`common.json`, `orders.json`, `storefront.json`, `kds.json`, etc.) —
  mirrors the feature-module convention rather than one giant file.
- **Two locales only, extensible by construction**: only `en` and `pt-BR` are built now — no other
  language is in scope for this spec. Because keys are semantic (not English strings) and every
  locale is just another sibling folder under `src/i18n/locales/`, adding a third locale later is
  additive (new folder + one more `preferences.language`/`i18n.resources` entry) — it never requires
  touching call sites or restructuring the key set. `preferences.language`'s option list collapses
  from the current 8 cosmetic-only entries (English (US/UK), Français, Deutsch, 日本語, 한국어,
  中文, Español — none had real string coverage) down to just English / Português (Brasil).
- **Runtime, not build-time**: changing `preferences.language` updates all mounted UI immediately
  through react-i18next, no reload/navigation. Public routes (`/storefront`, `/table-menu`, `/kds`)
  and authenticated routes share the same i18n state, both reachable since `PreferencesProvider`
  already wraps the whole router in `App.tsx` and is localStorage-only (no auth dependency).
- **English is canonical**: the English key set is the source of truth and the fallback locale.
  A missing PT-BR translation must render the English string, never a blank or a raw key.
- **Semantic keys**: keys are meaning-based (`orders.status.preparing`, not `"Preparing"`).
  Keep naming consistent; don't create duplicate synonyms for the same concept across features
  (one canonical key for "Table", reused, not a per-feature reinvention).
- **Presentation-boundary only**: translation applies strictly to rendered UI text. API payload
  values, `OrderStatus`/enum values, permission identifiers, route paths, and anything in a
  domain model/type stay language-neutral. A translated label maps *from* a stable enum value at
  render time — it never becomes or replaces the stored value.
- **Default & detection**: first visit with no saved preference — `navigator.language` starting
  with `en` → English; anything else (including no match) → Português (Brasil), since that's the
  target market. A saved `preferences.language` always wins over detection afterward.
- **Terminology is product vocabulary, not literal translation**: Cardápio, Pedido, Comanda
  (dine-in specifically; Pedido for delivery/takeout), Mesa, Garçom, Cozinha, Conta, Gorjeta,
  Para viagem, Caixa, Painel, Relatório, Estoque, Fornecedor — used consistently across both
  customer-facing (Storefront/Table-Menu) and staff-facing (Orders/KDS/Administration) surfaces.
  These are deliberate choices already validated with the user, not open to per-feature drift.

## Formatting

- `formatCurrency`/`formatDate` (`src/utils/format.ts`) stay as-is; add `"BRL — Real Brasileiro"`
  to `CURRENCIES` and default `dateFormat` to `"DD/MM/YYYY"` when the active language is
  Português (Brasil) (already a supported format value — no format-engine change needed).
  Number formatting (comma decimal / dot thousands) comes for free from `Intl.NumberFormat`
  once `pt-BR` is the resolved locale.
- Phone display/input fields get Brazilian masking (`+55 (DDD) 9XXXX-XXXX`) where a phone field
  exists today — audit `CreateOrderModal`/customer profile fields for current phone inputs before
  adding a mask utility, to avoid a duplicate masking implementation.

## Payment method (mock, but real data — supersedes the earlier "local state only" call)

`CheckoutFlow.tsx` (Storefront) currently hardcodes a single fake "Card ending in •••• 4242" row.
This is revised from an earlier draft of this spec: payment method is now real `Order` data (still
entirely mock-backed, no gateway), not component-local state — because it needs to be visible to
staff (Orders admin, comanda-closing) and carries operationally real sub-detail (which card type,
how much change to bring), not just a UI choice that disappears after checkout.

Every context in Core where a payment method is chosen — Storefront checkout, `CreateOrderModal`
(staff-created Phone/Dine-in orders), and comanda-closing (below) — shares **one** picker
component and the same `Order` fields:
```
export type PaymentMethod = "PIX" | "Card" | "Cash";
export type CardType = "Credit" | "Debit";
```
`Order` gains: `paymentMethod?: PaymentMethod`, `cardType?: CardType` (Card only), `changeFor?:
number` (Cash only — the note value the customer will pay with, so staff/delivery knows how much
troco to bring; omitted/undefined means no change needed). All Core payment methods are
**in-person** (PIX is pay-now via a mock QR/code flow; Card and Cash are collected physically —
by a delivery courier's own card machine, or at the table/counter — never through our app). This
matches confirmed real-world practice (researched against iFood's own "pagamento na entrega"
flow): the courier brings their own maquininha, selects crédito/débito on it based on what the
customer chose at checkout, and no fee or provider integration touches our app at all. Marking a
payment "received" isn't a separate screen — it happens implicitly when staff advances that order
(or, for a comanda, all its orders) to `Completed`/closed.

- **PIX**: selecting it and continuing shows a dedicated mock screen — QR code + a fake
  copia-e-cola alphanumeric code + an "Aguardando confirmação de pagamento..." state that
  auto-advances after a short delay. This is what makes it recognizable as PIX to a Brazilian
  user (a plain radio label doesn't), and gives a real PSP an obvious screen to replace later.
- **Card**: choosing it reveals a Crédito/Débito sub-choice (`cardType`) — the courier/staff needs
  to know which to run on their machine. No card number/details are ever collected in-app.
- **Cash**: choosing it reveals an optional "Troco para quanto?" numeric field (`changeFor`) —
  standard BR delivery-app pattern so the courier brings the right change.

**Explicitly not built now — in-app card payment (pay-now, gateway-charged).** You raised this as
something to be sellable later, not now: a customer selecting a saved card or adding a new one to
pay immediately in-app. That requires a real PSP (Stone/Cielo/PagBank — already listed under
Package 10 — Integrações & Plugins), PCI-relevant handling, and per-provider fees, none of which
exist yet. Rather than shipping an unused feature flag or dead UI now (which the project's own
conventions rule out — no speculative flags, no half-built paths), this stays purely as a
documented seam: `PaymentMethod` is deliberately a plain union (not a struct baking in "always
in-person"), so adding `"CardInApp"` later, behind a real flag introduced when Package 10 actually
builds the gateway integration, doesn't require touching every consumer of the type again.

## Delivery zone configuration & address gating

Storefront today has no fulfillment choice at all — `CartOverlay`/`CheckoutFlow` hardcode a
delivery-only flow (fixed "Delivery Fee", fixed fake address). This work adds the missing
Entrega/Retirada choice up front (before menu browsing starts) as a prerequisite for zone-gating
to have anywhere to attach: Retirada skips the zone step entirely; Entrega triggers it.

Owner side (Preferences → Storefront section, alongside the existing logo/cover/brand-color
config): a simple named-zone list — add/remove bairro names as chips/tags, no map, no
geocoding/ViaCEP call. Research confirms this beats radius or drawn-polygon zones for a
small-operator tool: radius tools routinely misrepresent real drive time/geography, while "we
deliver to Bairro X, Y, Z" is immediately understandable to both owner and customer, and matches
how Brazilian delivery businesses already communicate coverage. Same section also gets two
numeric fields: **avg. prep time** and **avg. delivery time** (minutes) — both owner-set
estimates, no routing calculation involved. Also gets a **WhatsApp business number** field — the
customer-status "Continuar no WhatsApp" link below is meaningless without one; if it's unset, that
affordance doesn't render rather than producing a broken `wa.me` link.

**Empty zones**: if `deliveryZones` is empty, "Entrega" doesn't appear as a fulfillment choice at
all (Pickup-only) rather than being offered and then always failing the bairro check.

Customer side: before showing the delivery menu (Storefront, delivery fulfillment only — not
Table-Menu, which is inherently on-premise), the customer picks their bairro from a dropdown
seeded with exactly the owner's configured list, plus a **"Meu bairro não está na lista"** option.
Picking from the owner's own list — rather than free-text matched against it — avoids false
negatives from typos/naming variants (e.g. "Vila Madalena" vs "V. Madalena"). If the bairro isn't
covered: a clear message ("No momento não entregamos nesse bairro"), with a **"Trocar para
Retirada"** (switch to pickup) offer if pickup is available as a fulfillment option; otherwise the
message stands alone. Once inside a covered zone, the rest of the address (rua, número,
complemento) is free text — no CEP/ViaCEP involved, matching the out-of-scope boundary above.

`Order` gains an optional `deliveryAddress` field (bairro + rua/número/complemento), populated
only for `fulfillment: "Delivery"` orders. `Order` is a shared type consumed by
Orders/KDS/Storefront/Analytics/Home — this change goes through the `migrate-shared-type` skill
at implementation time, not ad hoc. `PreferencesState` gains `deliveryZones: string[]`,
`avgPrepTimeMinutes: number`, `avgDeliveryTimeMinutes: number`, `whatsappNumber: string`.

## Customer-facing order status (notification workflow)

Real-time order transparency is what stops customers from flagging staff to ask "is it ready?" —
but the backend has no WebSocket/push today (payment/WhatsApp integration is explicitly
roadmap-blocked). The honest mock-backed approximation:

- The customer's post-order view (Storefront confirmation, Table-Menu order view) polls the order
  via TanStack Query `refetchInterval` (short interval, active only while that screen is mounted —
  stop polling on unmount) against the existing `["orders"]` cache key. No new backend capability
  required, no fabricated real-time claim made in the UI copy.
- Render a status **timeline** driven directly by the real `OrderStatus` enum, with copy that's
  fulfillment-aware rather than one generic set of labels — the underlying enum
  (`New`/`Preparing`/`Ready`/`Completed`) never changes, only its displayed label does, which stays
  inside the "presentation-boundary only" i18n rule above:
  - **Delivery**: Confirmado → Preparando → Saiu para entrega → Entregue.
  - **Pickup**: Confirmado → Preparando → Pronto para retirada → Retirado.
  - **Dine-in**: Confirmado → Preparando → Pronto → Servido.
- For delivery orders, the timeline and the WhatsApp message both show the estimate:
  `avgPrepTimeMinutes + avgDeliveryTimeMinutes` from the owner's Preferences config, snapshotted
  onto the order at creation time (`Order.estimatedDeliveryMinutes`, optional, Delivery-only) so a
  later change to the owner's settings doesn't retroactively alter an in-flight order's promised
  estimate. This is a flat, owner-configured estimate — no live routing/traffic/driving-time
  calculation, no per-zone differentiation (that granularity is Package 5's driver-tracking work).
- The existing mock WhatsApp notification channel (see Notifications, below) becomes a
  "Continuar no WhatsApp" (`wa.me` deep link) affordance on the confirmation screen — a share/
  continuation link, not a real push notification. For Delivery orders its message copy includes
  the current status (from the mapping above) and the estimate.
- Leave a `connect-backend`-style TODO comment at the polling call site, flagging it for
  replacement once a real WebSocket/push channel exists — matching how Phase 3 flagged its
  interim table-lookup implementation.

## Notifications (mock WhatsApp channel)

`features/notifications` stays mock/in-app. Add a `whatsapp` channel value: an order status change
appends a mock "Mensagem enviada via WhatsApp" entry to the notification feed (channel icon/label
only — no real Meta Cloud API call, consistent with the existing mock-service pattern).

## Dine-in comandas: tablet/QR self-order & waiter mobile ordering

Today `Order` is single-shot (create → progress through KDS → done); Dine-in has no concept of a
table's *whole visit* accumulating multiple rounds of items, and `/table-menu` (Phase 3) is
explicitly read-only ("no cart/checkout UI"). This supersedes that scope note: a table's dine-in
session becomes a real ordering surface, both for the customer (own phone via the existing QR, or
a restaurant-owned tablet pinned to the same URL — one responsive build, not two) and for a waiter
ordering tableside from their own phone.

**New type — `Comanda`** (`src/types/tables.ts`, alongside `Table`):
```
export type ComandaMode = "Shared" | "Individual";
export type ComandaStatus = "Open" | "Closed";

export interface Comanda {
  id: string;
  tableId: string;
  mode: ComandaMode;
  guestLabel?: string;   // Individual mode only — one Comanda per named guest
  status: ComandaStatus;
  openedAt: string;
}
```
`Table` gains `status: "Free" | "Occupied"`. `Order` gains an optional `comandaId` (Dine-in only).
Both `Table` and `Order` are shared types with existing multi-feature consumers — this goes
through `migrate-shared-type` at implementation time, same as the delivery-address field above.

**Seating (waiter-only, in Tables feature)**: opening a Free table is where mode is decided —
**Shared** (one Comanda, everyone at the table orders into it) or **Individual** (waiter enters N
guest labels, one Comanda each). This is decided once at seating, not changed mid-visit. Table
flips to Occupied; the table's QR/tablet route unlocks only in Shared mode.

**Customer self-order** (`/table-menu`, evolved from read-only to a real cart+submit flow): only
enabled when the table has an **Open, Shared** comanda. Submitting creates a normal `Order`
(`channel: "Dine-in"`, `table`, `comandaId`) that flows through KDS exactly as any Dine-in order
does today — straight to the kitchen, no waiter-approval gate. If the table is in Individual mode
or not yet seated, the route shows a message directing the guest to their waiter instead of a cart
— individual comandas are deliberately never customer-editable, per the earlier requirement.

**Waiter mobile ordering**: a phone-optimized flow (reusing the same menu-item picker/cart
component as the customer self-order view, not `CreateOrderModal`'s free-text item entry — that
gap is fixed here since a waiter tapping through real menu items is the actual use case) where the
waiter picks a table, then (if Individual mode) which guest's Comanda, adds items, submits — same
straight-to-KDS path. This runs alongside customer self-order, not instead of it: a Shared table
lets both the customer's own device and a waiter add into the same Comanda; Individual mode is
waiter-only entirely.

**Table actions** (confirmed baseline expectation for this product category, not an extra):
`/table-menu`, on a Shared/Open comanda, gets two buttons — **"Chamar garçom"** and **"Pedir a
conta"** — each posting a mock entry into the existing staff-facing notification feed (table name
+ action, no new backend). Individual-mode tables don't show these since there's no customer-self
surface to put them on.

**Closing out**: Tables feature gains a per-table view of its open Comanda(s) with a running total
(sum of linked Orders) and a "Fechar comanda" action — reuses the PIX/Card/Cash picker from
"Payment method" above (Card here means the physical machine brought to the table, same as
delivery), sets `paymentMethod`/`paymentStatus: "Paid"` on that Comanda's Orders, and marks the
Comanda Closed (table returns to Free once all its Comandas are closed). No fiscal document/
receipt generation — that's Package 2.

## Owner/staff-facing dashboard UX (incremental polish, no restructuring)

Preserve all existing navigation/behavior; these are hierarchy and visual-consistency fixes to
already-built screens, justified by concrete UX issues, not a redesign:

- **KDS**: unify status→color mapping (audit for any per-feature ad hoc color choices vs. Orders'
  status colors — one shared mapping). Add a relative elapsed-time indicator ("há 12 min") computed
  from the real `Order.createdAt` — legitimate since Phase 4/6 already established `createdAt` is
  real data and explicitly rejected fabricating a `timer` field; this only formats what exists.
- **Home dashboard**: reorder existing cards (all data already computed in Phase 6 — no new
  metrics) so the most-actionable number (kitchen backlog / any overdue order) leads, per
  F-pattern scan order, rather than being introduced further down the page.
- **Orders table**: adopt the same unified status-color language as KDS.
- **Empty states**: audit existing "no data" states (Orders, Notifications, Analytics with no
  data) to ensure each tells the user what to do next rather than just stating absence.

## Visual polish (scoped, not a re-theme)

No new palette or typeface — the brief is "still really good, make it better," not "redesign."
Concretely: consistent spacing/type-scale application, the single status-color mapping above
applied everywhere status appears, and differentiated visual weight per audience — customer
surfaces (Storefront/Table-Menu) prioritize low cognitive load and generous touch targets;
staff/owner surfaces (Orders/KDS/Administration/Analytics/Home) prioritize information density
for repetitive workflows. Apply during implementation as normal polish judgment on each screen
touched by the above — not tracked as a separate line item requiring its own approval per screen.

## Testing / verification

No test suite in this repo (confirmed convention) — `yarn build` and `yarn lint` are the
automated safety net. One `verify-ui` browser pass: toggle EN↔PT-BR on both a public route
(Storefront) and an authenticated route (Orders) confirming live swap with no reload, confirm the
PIX/Card/Cash picker renders and submits for each method (PIX's mock QR/waiting screen, Card's
Crédito/Débito sub-choice, Cash's troco field), and confirm the customer order-status timeline
advances when an order's status is changed from KDS/Orders in the same session (mirrors Phase 4's
cross-feature verification pattern). Also cover the comanda flow end-to-end: seat a table Shared,
submit an order via `/table-menu`, confirm it appears on KDS and Orders tagged to that table/
comanda; use "Chamar garçom"/"Pedir a conta" and confirm each posts to the notification feed; seat
a table Individual and confirm `/table-menu` shows the waiter-only message instead of a cart;
close a comanda and confirm its orders show `paymentStatus: "Paid"` and the table returns to Free.

## Future package roadmap (reference only — not built in this spec)

Recorded here so later specs don't need to re-derive it; none of the following is in scope now.

1. **Operação (Core)** — this spec.
2. **Fiscal / NFC-e** — NFC-e/NF-e, NCM/CFOP/CST per product, SEFAZ XML, digital certificate,
   CBS/IBS fields (tax reform, effective Aug 2026).
3. **Financeiro** — cash flow, fechamento de caixa, DRE, CMV tracking (target 28–35%), bank
   reconciliation, accounting export.
4. **Estoque & Compras** — ficha técnica, auto stock deduction, expiry tracking, waste logging,
   ABC curve, supplier management, purchase orders.
5. **Delivery & Marketplace** — iFood/99Food/Rappi marketplace integration, driver
   assignment/tracking, per-zone/live-routed ETAs. (Basic named-zone gating + flat ETA estimate
   is already Core — see "Delivery zone configuration & address gating" above.)
6. **CRM & Fidelização** — customer database, cashback, campaigns, NPS, loyalty.
7. **Equipe (Staff)** — shift scheduling, clock-in/out, performance, tip management (extends
   existing Team/Roles RBAC from Phase 5).
8. **Relatórios & BI** — sales by period/product/channel, peak-hours heatmap, ticket médio,
   period comparison, PDF/Excel export.
9. **Cardápio Inteligente** — menu-engineering matrix, price suggestions, combo builder.
10. **Integrações & Plugins** — plugin architecture, accounting integrations (ContaAzul/Omie),
    payment gateways (Stone/Cielo/PagBank), TEF, WhatsApp API, doc-gen plugins. Also where
    **in-app card payment** (saved cards / add-new-card, pay-now, gateway-charged) eventually
    lands — Core only ever collects Card/Cash in person (see "Payment method" above).

## Non-goals for this spec

- No backend/API changes (all payment/WhatsApp/status/delivery-zone work stays mock-backed).
- No in-app (gateway-charged) card payment, saved cards, or PCI-relevant handling — Card in Core
  always means a physical machine at delivery/table; the in-app path is documented, not built.
- No new state-management library (TanStack Query only, per repo convention).
- No fiscal/financial/inventory data modeling.
- No full visual re-theme.
- No geocoding, map UI, or real routing/drive-time calculation — delivery zones are a
  plain owner-curated name list, and ETA is a flat sum of two owner-set numbers.
- No mid-visit switch between Shared/Individual comanda mode, no bill-splitting UI beyond
  Individual mode's inherent per-guest separation, and no dedicated kiosk-mode build for tablets
  (the same responsive `/table-menu` route serves phone and mounted tablet alike).
