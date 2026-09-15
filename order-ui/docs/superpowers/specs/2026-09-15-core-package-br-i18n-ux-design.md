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

## Payment method (mock)

`CheckoutFlow.tsx` (Storefront) currently hardcodes a single fake "Card ending in •••• 4242" row.
Replace with a radio group: **PIX** (first/default), **Cartão** (card), **Dinheiro** (cash) — held
as local component state (`paymentMethod`), not added to the shared `Order` type. `Order` has no
payment modeling today; adding it prematurely is exactly the kind of plumbing the future Fiscal
package should own once real gateway data exists. `CreateOrderModal` (staff-side Phone/Dine-in
creation) gets the same three options for UI consistency, same local-state treatment.

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
estimates, no routing calculation involved.

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
`avgPrepTimeMinutes: number`, `avgDeliveryTimeMinutes: number`.

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
PIX/Cartão/Dinheiro picker renders and submits, and confirm the customer order-status timeline
advances when an order's status is changed from KDS/Orders in the same session (mirrors Phase 4's
cross-feature verification pattern).

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
    payment gateways (Stone/Cielo/PagBank), TEF, WhatsApp API, doc-gen plugins.

## Non-goals for this spec

- No backend/API changes (all payment/WhatsApp/status/delivery-zone work stays mock-backed).
- No new state-management library (TanStack Query only, per repo convention).
- No fiscal/financial/inventory data modeling.
- No full visual re-theme.
- No geocoding, map UI, or real routing/drive-time calculation — delivery zones are a
  plain owner-curated name list, and ETA is a flat sum of two owner-set numbers.
