# Restaurant Ops Redesign — Roadmap

**Read this file first, before the spec, before git log.** It's the single source of truth for
"what phase are we on and what's already true" for this initiative. The full concept/target
shapes live in `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` — read that
next, only for the sections relevant to your phase.

Every phase so far was executed the same way: `superpowers:writing-plans` → plan saved to
`docs/superpowers/plans/YYYY-MM-DD-restaurant-ops-phaseN-*.md` → `superpowers:using-git-worktrees`
→ `superpowers:subagent-driven-development` (fresh implementer per task, task review, final
whole-branch review, fix-loop, browser-verify only what needs a live DOM) →
`superpowers:finishing-a-development-branch` (ask user: merge locally / PR / keep — this project
has always chosen "merge to Claude-Assisted-Development locally"). Repeat that process for each
phase below unless told otherwise.

## Standing constraints (apply to every phase, not just the one you're on)

- `MenuItem` ids `m1`-`m9` in `src/features/menu/constants/menu.constants.ts` are load-bearing —
  `src/features/orders/services/orders.service.ts` references `m1`-`m8` by id. Never change them
  without re-checking every consumer (`migrate-shared-type` skill).
- Never show a `MenuItem` where `available === false` in any customer-facing (non-admin) view.
- `features/menu` is the ONLY source of `MenuItem` data. No feature may keep a local duplicate
  fixture (this was the whole point of Phase 2 — don't reintroduce it).
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists in this repo — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the
  only automated safety net.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo;
  stash/pop can apply or clobber an unrelated worktree's stash (this happened once, in Phase 0,
  and was recovered via `git reflog`).
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare
  `git commit -m "..."` — this repo has pre-existing, unrelated staged work (notifications/profile/
  settings/layouts files) from other in-progress work that must never be swept into a commit here.
- Limit Playwright/browser verification to *confirming* a fix already reasoned out from source —
  don't iterate fixes through repeated browser dispatches. Most feature work needs at most one
  dispatch at the very end.
- `/storefront` and `/kds` (and any new public/customer-facing route) render OUTSIDE the
  authenticated `ProtectedLayout`/`AppLayout` shell — no login required. Admin routes (`/menu`,
  `/tables`, `/orders`, etc.) are inside it.

## Phase status

| Phase | Status | Plan file | Commits (on `Claude-Assisted-Development`) |
|---|---|---|---|
| 0 — Foundation types | ✅ Done | `2026-09-10-restaurant-ops-phase0-foundation-types.md` | `8d3181e..fe3b0b0` |
| 1 — Menu & Tables features | ✅ Done | `2026-09-10-restaurant-ops-phase1-menu-tables.md` | `50594ff..07bb82f` |
| 2 — Retire duplicate Menu/Inventory data | ✅ Done | `2026-09-10-restaurant-ops-phase2-retire-duplicates.md` | `cb68b1c..167489f` |
| 3 — Public read-only QR-tagged Menu view | ✅ Done | `2026-09-10-restaurant-ops-phase3-public-menu-view.md` | `d72f713..8c82c83` |
| 4 — Orders/KDS repoint to shared Order model | ✅ Done | `2026-09-12-restaurant-ops-phase4-orders-kds-unified-model.md` | `f80b6b4..1c652f3` |
| 5 — Administration real implementation (real backend) | ✅ Done | `2026-09-13-restaurant-ops-phase5-administration.md` | `1edfaf8..ec9dc08` |
| 6 — Home rewrite + Analytics repoint | 🔜 Next | *(not yet written)* | — |
| — Payment (card/PIX) + WhatsApp notifications | ⛔ Blocked | N/A | Backend/integration dependency — spec explicitly flags these as not frontend-actionable. Do not write a plan for these until that backend work exists. |

### Phase 0 summary (foundation types)
Unified `Order` type (`channel`/`fulfillment`/`table`, 5-value `OrderStatus`), created shared
`MenuItem` type (`src/types/menu.ts`), migrated `storefront` + `inventory` off their own local
types onto it, added a `Table` type stub, removed a redundant nav item and an empty dead-code
folder (`features/batches`). Fixed a referential-integrity bug where mock order lines used ids
that didn't match any real `MenuItem`.

### Phase 1 summary (Menu & Tables features)
Scaffolded `features/menu` (canonical `MenuItem` CRUD — `menu.service.ts` uses a module-level
mutable array so mutations persist across query refetches, unlike the older `inventory` pattern)
and `features/tables` (Table CRUD + QR code generation/download via `qrcode.react`). Fixed two
final-review findings: QR codes were pointing at the just-built authenticated `/menu` admin page
instead of a public view (retargeted to `/storefront` as an interim stand-in — **this is exactly
what Phase 3 below replaces with a real dedicated view**), and `MenuItemModal` allowed submitting
a blank item (added validation).

### Phase 2 summary (retire duplicates)
Retargeted `storefront` to consume `MenuItem` data from `features/menu`'s service instead of its
own duplicate fixture (query shares the `["menuItems"]` cache key with the admin Menu feature via
TanStack Query `select`, so admin edits/86-toggles propagate live). Deleted `features/inventory`
entirely — per the spec, Inventory "disappears as a standalone item (folds into Menu)"; Phase 1's
`MenuItemCard`/`MenuFeature` already cover the stock/low-stock view and 86-toggle that replaced it.
Browser-verified: storefront renders live canonical data, category filters work, unavailable items
never leak into the customer feed.

### Phase 3 summary (public read-only QR-tagged Menu view)
New `features/table-menu` module (service composing `menuService`+`tablesService`,
hook, two components) serving a public, unauthenticated route at
`/table-menu?table=<id>` — registered outside `ProtectedLayout`/`AppLayout`
alongside `/storefront`/`/kds`. No cart/checkout UI; filters to `available`
`MenuItem`s only; reads the `table` query param and displays the scanned
table's name. `features/tables`' QR seed data and `createTable` retargeted
from the Phase 1 interim `/storefront?table=` destination to this new route.
Final whole-branch review caught and fixed one cross-task interaction bug the
per-task reviews couldn't see: the table-name banner briefly flashed "Table
not found" during the ~300ms mock table-lookup latency on every valid QR
scan — fixed by exposing a distinct `isTableLoading` flag from the hook.
Also added a `connect-backend` TODO flagging that `getTable`'s current
implementation (fetching the full table roster) must not later be wired to
an admin-scoped endpoint, since this route is unauthenticated.

### Phase 4 summary (Orders/KDS repoint to shared Order model)
Retargeted `orders.service.ts` from a bare exported array into the repo's standard mock-service
pattern (module-level mutable array in `orders.constants.ts`, async functions in the service:
`getOrders`/`createOrder`/`updateOrderStatus`), and `useOrders.ts` from raw `useState` to TanStack
Query under cache key `["orders"]`. `OrdersFeature`'s "Cancel" now sets `status: "Cancelled"`
instead of hard-deleting the order. `CreateOrderModal` gained a Phone/Dine-in channel picker (Online
excluded — self-service only, never staff-created) with a conditional table select (Dine-in, from
`features/tables`) or fulfillment select (Phone); order-id generation moved server-side into
`ordersService.createOrder`. `features/kds` fully retargeted onto the shared `Order`/`OrderStatus`
model — deleted `types/kds.ts` and `kds.service.ts` entirely, rewired all 3 KDS hooks to consume
`ordersService`/the same `["orders"]` cache key (filtered to `New`/`Preparing`/`Ready`), so a status
change in either feature is immediately visible in the other. Dropped the per-line-item "completed"
checklist (no analog in the unified model) and the fabricated `timer`/`isRush`/`isActive` fields
(no real data to back them — `Order.createdAt` is date-only), replacing a previously-dead "Mark
Order Ready" button with a real, working per-order status-advance action. Final whole-branch review
caught one plan-level defect the per-task reviews couldn't see: the mock order data was specified
inline in the service file rather than in `constants/`, diverging from `menuService`/`tablesService`'s
established convention — fixed in the final wave. Browser-verified end-to-end: a status change made
via KDS's "Start Preparing" button is reflected on the Orders admin page in the same session.

### Phase 5 summary (Administration real implementation, against a REAL backend)
Fetched the live OpenAPI spec directly from the running backend (`/api/v3/api-docs`) rather than
trusting the spec doc's 2026-09-09 snapshot, and found it mostly matched with a few extra endpoints
(`/admin/users/{id}/deactivate|reactivate|password-setup|status`) the spec doc hadn't itemized.
Merged the old "Users"+"Administrators" Coming-Soon pages into one real **Team** page: paginated
list (`GET /users` — note this endpoint's rows carry no name field, only `email`/`role`/`active`/
dates; full name only appears via `GET /users/{id}` in the detail drawer), with invite/edit/
role-change/deactivate/reactivate/resend-setup-email all wired to real endpoints. Added a read-only
**Roles** reference page (`GET /roles`) and a new **Audit Log** page (`GET /admin/identity-audit`),
neither previously surfaced in the frontend. Nav/routes now read Team/Roles/Audit Log
(`/administration/team|roles|audit-log`), with the two old paths redirecting rather than 404ing.
Final whole-branch review caught 4 cross-task defects invisible to `yarn build`/`yarn lint` (all
runtime/UX, not type errors) that the per-task reviews couldn't see: unhandled-rejection silent
failures on save/role-change, a Role `<select>` that rendered blank whenever the current role wasn't
in the loaded options, a pagination control that unmounted (not just flickered) between page
fetches, and a successful invite with no visible confirmation — all fixed in one consolidated fix
wave, re-reviewed clean. Browser-verified end-to-end against the real backend (real login, not a
synthetic JWT): Team pagination, detail drawer, role change repainting both list and drawer,
deactivate/reactivate with a working double-submit guard, Invite User, Roles, and Audit Log
(showing events matching the actions just performed) all passed with a clean console. One test
artifact intentionally left in the real backend from this verification pass: user
`phase5-verify-test-delete-me@example.com` — delete it via the Team page's deactivate/delete flow
once the branch is deployed, or leave it since it's harmless.

## What's next: Phase 6 — Home rewrite + Analytics repoint

**Why this one next**: it's the last planned phase before the explicitly-blocked Payment/WhatsApp
work (which needs backend/integration dependencies this initiative doesn't control), and Phase 3
already produced a reusable read-only-data-view pattern (the public Table Menu) worth revisiting
for Home's dashboard.

**Goal:** Per the spec's "Home" and "Analytics" sections (read those sections before writing this
phase's plan — don't re-derive from the current pre-redesign `features/home`/`features/analytics`
code, which is exactly what's being replaced):
1. Rewrite `features/home` as a real operational dashboard reading from the unified `Order` model
   (via `ordersService`/the `["orders"]` cache key established in Phase 4) instead of whatever
   placeholder/mock data it currently shows.
2. Repoint `features/analytics` onto the same unified `Order` model so its figures are computed
   from real (mock-backed, per this repo's mock-vs-real convention outside `auth`/`profile`/
   `administration`) order data rather than a disconnected fixture.
3. Confirm whether Phase 5's real Administration data (e.g. team size, audit activity) belongs on
   the Home dashboard per the spec — don't invent a cross-feature dependency the spec doesn't call
   for.

Write this phase's plan (`superpowers:writing-plans`) only once ready to execute it — this
roadmap entry is deliberately high-level per this project's established pattern of writing detailed
phase plans just-in-time.
