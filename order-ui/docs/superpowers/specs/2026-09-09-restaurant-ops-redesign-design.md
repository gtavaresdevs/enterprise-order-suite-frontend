# Restaurant Ops Redesign — Concept & Plan

## Problem

The app is meant to be sold to independent restaurants for order management, but
the current codebase reads as a generic B2B e-commerce demo with restaurant
pieces bolted on inconsistently:

- **Home dashboard** (`features/home/constants/home.constants.ts`) is scaffold
  copy about "Product Procurement Inventory," "corporate billing variables,"
  and a transaction with "Kyoto Data Systems" — none of it about a restaurant.
- **Three incompatible order/item data models** describe the same real-world
  concepts: `Order` (orders feature, `OrderStatus = New|Preparing|In
  Route|Delivered`, with `company`/`deliveryAddress` fields assuming
  B2B-delivery-only), `KdsTicket` (kds feature, already has `type:
  DELIVERY|DINE-IN|PICKUP` and a cleaner `pending|preparing|ready` status —
  better than Orders, but a separate dataset), and `MenuItem` (storefront) vs
  `Product` (inventory) — the same food items typed twice with different
  modifier shapes.
- **The real backend** (live OpenAPI at `/api/v3/api-docs`, confirmed
  2026-09-09) is a generic e-commerce scaffold built for learning purposes:
  `Order.status` is `PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED`,
  `Product` is `name/sku/description/price/stockQuantity` with no modifiers,
  category, or image. There is no customer entity, no payment integration, no
  WhatsApp integration, and no channel/table concept anywhere in the API.
  Admin/user RBAC, however, is real and already correct: `/users`,
  `/admin/users` (invite, update, setRole, deactivate/reactivate,
  resend-setup-email), `/roles`, and `/admin/identity-audit` (an audit log).
  The frontend's Administration screens are 100% "Coming Soon" placeholders
  despite this working backend.
- **Navigation redundancy**: a top-level "Security" nav item just redirects to
  `/settings`, which already has a `SecurityPanel` reachable from the account
  dropdown.
- **Dead code**: `src/features/batches/` is an empty folder.

Goal: define a coherent restaurant-order-management concept, and use it as the
target contract for both the frontend rework and the backend work still ahead
(this doubles as the backend's roadmap, since the backend is intentionally
being advanced alongside the frontend, not treated as fixed).

## Decisions (confirmed with user, 2026-09-09)

- **Tenancy**: single-tenant per restaurant. One deployment = one restaurant.
  `SUPER_ADMIN` = owner, `ADMIN` = manager, `USER` = staff. No multi-tenant
  concept is introduced.
- **Business shape**: one independent restaurant, not a chain — no
  multi-location modeling.
- **Customers** (people placing orders via the public link) are anonymous —
  no account/login. Each order captures name + WhatsApp/phone number, used
  for status notifications. This is a distinct concept from the RBAC
  `User`/staff accounts above; customers never appear in `/users`.
- **Order channels**: `Online` (self-service via the shared link), `Dine-in`
  (waiter enters it after the customer views a QR-code menu at the table),
  `Phone` (staff enters it on the customer's behalf). All three funnel into
  one `Order` model and one KDS queue.
- **Fulfillment**: `Pickup` | `Delivery`, applies to `Online`/`Phone` orders
  only. `Dine-in` orders carry a `table` reference instead.
- **Menu is configured once and served everywhere**: the public storefront
  link, the QR-code table view, and staff order-entry (dine-in/phone) all
  read the same Menu module. No separate/duplicated catalog.
- **Inventory simplifies into Menu**: the backend's existing `Product`
  already conflates "menu item" and "how many are left" via `stockQuantity`
  — correct for a restaurant selling prepared dishes. No separate
  ingredient-level inventory system. The current Inventory page becomes a
  **view** over Menu (sorted/filtered by low stock), not its own data model.
- **Tables**: scoped down to a settings list (table name/number + a
  generated QR code linking to the read-only Menu view tagged with that
  table) — not a live floor/occupancy view. Noted as an easy future add if
  wanted later.
- **Payment**: required in-app (card/PIX) before confirmation for `Online`
  orders. `Dine-in`/`Phone` orders default to pay-later (settled at the
  table or over the phone) since staff is already handling those directly.
- **WhatsApp notifications**: every order status change sends the customer a
  WhatsApp message (via a provider — Meta Cloud API or a Twilio-equivalent,
  TBD at implementation time). This is backend/integration work, not
  something the frontend can fake meaningfully — flagged as a dependency.
- **Administration reshaped around the real backend**, not invented roles:
  merge the current "Users" + "Administrators" pages into one **Team** page
  (role column, role-gated row actions), keep a lightweight **Roles**
  reference view, and add a new **Audit Log** view backed by the
  already-working `/admin/identity-audit` endpoint.
- **Profile** stays as-is — already real (avatar upload, `/me/profile`
  confirmed working backend-side per user).
- **Scope discipline**: this is explicitly *not* a full rebuild. Where the
  current structure already makes sense (Analytics' shape, Preferences as
  the branding/customization hub, KDS's existing channel/status modeling),
  keep it and extend it rather than replacing it.

## Target concept

One order lifecycle, three ways in, one kitchen queue, one menu, real
role-gated admin:

```
Customer (anonymous)              Staff
  │                                 │
  ├─ Online link (pickup/delivery) ─┤─ Dine-in (QR menu + waiter entry)
  │  pays in-app                    ├─ Phone (staff enters, pay later)
  ▼                                 ▼
              Order (channel, fulfillment?, table?, status)
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           Orders       KDS       Analytics
        (back-office  (kitchen   (revenue/channel/
         list, manual  queue,     peak-hours, now
         creation)     status     driven by real
                        changes)   order data)
              │
              ▼
     WhatsApp status message to customer on every status change
```

### Order model

```
type OrderChannel = "Online" | "Dine-in" | "Phone";
type Fulfillment = "Pickup" | "Delivery";
type OrderStatus = "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";

interface Order {
  id: string;
  channel: OrderChannel;
  fulfillment?: Fulfillment;   // Online/Phone only
  table?: string;              // Dine-in only
  customerName: string;
  customerPhone: string;       // WhatsApp target
  items: OrderLine[];
  status: OrderStatus;
  paymentStatus: "Paid" | "Pending" | "PayLater";
  createdAt: string;
  total: number;
}

interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers?: Modifier[];
}

interface Modifier { label: string; price: number; }
```

This single shape replaces `types/orders.ts`'s `Order`/`ProductLine`/
`Modifier` and `types/kds.ts`'s `KdsTicket`/`TicketItem`/`Modifier`. KDS
becomes a filtered, kitchen-oriented view of this same stream (only
`New`/`Preparing`/`Ready`, grouped visually as tickets) rather than a
separate dataset — it already models channel and a cleaner status set today,
so this direction is closer to KDS's current shape than to Orders'.

Status meaning adapts per channel without needing per-channel status values:
`Ready` = ready to serve (Dine-in) / ready for pickup (Pickup) / ready for the
courier (Delivery). `Completed` = served / picked up / handed off.

### Menu model

```
interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stockQuantity: number;   // null/omitted = unlimited
  available: boolean;      // manual 86 toggle, independent of stock
  sizes?: SizeOption[];
  addons?: AddonOption[];
}
```

Replaces `types/storefront.ts`'s `MenuItem` and `types/inventory.ts`'s
`Product` with one shape. Extends the backend's existing `ProductRequest`/
`ProductResponse` (`name, sku, description, price, stockQuantity`) with
`category`, `image`, `available`, and `sizes`/`addons` — a backend schema
change, not a frontend-only fix.

### Tables model (minimal)

```
interface Table {
  id: string;
  name: string;       // e.g. "Table 4", "Patio 2"
  qrCodeUrl: string;   // generated, links to /menu?table=<id> (read-only view)
}
```

No occupancy/status tracking in this pass.

## Feature-by-feature changes

### `features/home` — full rewrite

Drop the procurement copy and the `ChatAssistant` widget (no real capability
behind it, and its own mock dialogue literally narrates building `/home` and
`/orders` — a scaffolding artifact, not a feature). Replace with:
- Today's snapshot: order count by channel, revenue, avg prep time.
- Kitchen backlog: count of orders in `New`/`Preparing`.
- Low-stock alerts: Menu items below a threshold `stockQuantity`.
- Quick actions: New order (phone/dine-in entry), Open KDS, View Menu, Copy
  ordering link (to share via WhatsApp/Instagram).

### `features/orders` — retarget to the unified Order model

Back-office list/search/filter over all orders regardless of channel; manual
order creation (`CreateOrderModal`, which already exists for phone-style
entry) extended with a channel picker (`Dine-in` adds a table select from
Tables, `Phone` adds fulfillment picker). Status changes here and in KDS
write to the same record.

### `features/kds` — becomes the canonical status-change surface

Keep its existing ticket-board UX and channel badges (`DELIVERY|DINE-IN|
PICKUP` already exists here) — retarget its type to the shared `Order`/
`OrderStatus` instead of its own `KdsTicket`. Both KDS and front-of-house
(Orders) can change status; whichever changes it triggers the WhatsApp
notification.

### `features/storefront` — the public Online-channel entry point

Reads the shared Menu instead of its own `MENU` constant. Checkout flow ends
in in-app payment, then the customer is shown/redirected to a WhatsApp link
to the restaurant, with order status also trackable back on the web page (a
customer-facing order-status view keyed by order id/phone, no login).

### `features/inventory` — becomes a Menu-derived view

No separate data. Becomes a stock/low-stock lens over Menu items (sort by
`stockQuantity`, quick 86-toggle), or is folded into a "Stock" tab inside a
new Menu feature page rather than staying a standalone top-level nav item
(nav simplification, see below).

### New `features/menu`

Owns the `MenuItem` CRUD (name, price, category, image, modifiers,
availability), consumed by Storefront, KDS, Orders, and the Tables QR view.
Absorbs what Inventory and Storefront's catalog each partly did.

### New `features/tables` (minimal)

Table list CRUD + QR code generation/download per table, for print-and-place
table cards. Feeds the `table` field on Dine-in orders and the read-only
QR-menu view.

### `features/administration` — real implementation, not "Coming Soon"

Grounded directly in the working backend:
- **Team** (merges current Users + Administrators): paginated list from
  `GET /users`, detail from `GET /users/{id}`; role-gated actions — invite
  (`POST /admin/users`, with `sendPasswordSetupEmail`), edit
  (`PATCH /admin/users/{id}`), change role (`PATCH /admin/users/{id}/role`
  using `GET /roles` for the options), deactivate/reactivate, resend setup
  email.
- **Roles**: lightweight reference list from `GET /roles`. No custom
  permission-authoring UI yet — the backend only exposes role names, not
  permission sets, so this stays a reference view with a noted future gap.
- **Audit Log** (new): `GET /admin/identity-audit`, a real, already-working
  endpoint not currently surfaced anywhere in the frontend — who did what to
  whom, when. Directly sellable as a trust/compliance feature at zero
  backend cost.

### `features/preferences` — extends its existing role as the config hub

Already the right place for restaurant branding (logo/cover/brand color,
per prior spec). Extends with: shareable ordering link display + copy
button, WhatsApp business number, and (later) payment provider
configuration — this is what makes the app "fast to configure" per
restaurant, matching the intended sales motion (configure once, launch,
share the link).

### `features/analytics` — mostly unchanged, repointed

Keep the existing shape (revenue, channel split, peak-hours heatmap, top
items) — already sensibly restaurant-shaped. Repoint its data source at the
unified Order model; add a channel breakdown (Online/Dine-in/Phone) since
channel is now first-class.

## Navigation cleanup

- Remove the top-level "Security" nav item (redundant with Settings →
  Security panel).
- Nav becomes: **Dashboard, Orders, Menu, Tables, KDS, Analytics,
  Administration** (Team / Roles / Audit Log, role-gated) — Profile,
  Notifications, Preferences, Settings stay under the account dropdown.
  Inventory disappears as a standalone item (folds into Menu).
- Delete the empty `src/features/batches/` folder.

## Backend gaps this plan surfaces (roadmap, not built now)

These are the concrete deltas between the current learning-project backend
and this concept, useful as a backend work list:
1. `Order.status` enum → `New|Preparing|Ready|Completed|Cancelled`; add
   `channel`, `fulfillment`, `table`, `paymentStatus` fields.
2. `Product` → add `category`, `image`, `available`, `sizes`/`addons`
   (modifiers), rename conceptually to Menu item.
3. New `Customer` concept (name + phone, anonymous, no auth) attached to
   orders — currently orders require a `customerId` pointing at nothing
   equivalent.
4. New `Table` entity + QR generation.
5. Payment processor integration (card/PIX) for Online-channel checkout.
6. WhatsApp notification integration, triggered on order status change.
7. `/admin/identity-audit` and `/roles` already exist and need no backend
   changes — just frontend wiring.

## Explicitly out of scope for this pass

- Multi-location/multi-tenant support.
- Table occupancy/floor-status live view (only static QR table list).
- Reservations/booking.
- Custom permission-set authoring (only role assignment from a fixed list).
- Loyalty/promotions, POS hardware/printer integration, third-party
  delivery marketplace integration (Uber Eats etc.).

## Open questions for implementation time (not blocking this plan)

- Which WhatsApp provider (Meta Cloud API vs. a wrapper like Twilio) —
  affects backend integration work, not the frontend contract above.
- Which payment processor (Stripe, Mercado Pago, PIX-specific provider) —
  same.
