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
| 4 — Orders/KDS repoint to shared Order model | 🔜 Next | *(not yet written)* | — |
| 5 — Administration real implementation (real backend) | 📋 Planned | *(not yet written)* | — |
| 6 — Home rewrite + Analytics repoint | 📋 Planned | *(not yet written)* | — |
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

## What's next: Phase 4 — Orders/KDS repoint to shared Order model

**Why this one next** (over Administration or Home/Analytics): Orders and KDS are the two features
still running on the pre-redesign per-feature types (`types/orders.ts`'s `Order`/`ProductLine`/
`Modifier`, `types/kds.ts`'s `KdsTicket`/`TicketItem`/`Modifier`) that Phase 0 already superseded
with the unified `Order` model — this phase is the migration that actually retires those old types,
closing the gap Phase 0 opened. It's also a prerequisite for Phase 6 (Analytics needs real,
unified order data to repoint against) and doesn't require a real backend yet (that's Phase 5).

**Goal:** Retarget both `features/orders` and `features/kds` onto the single shared `Order` model
from `src/types/orders.ts` (Phase 0 — `channel: OrderChannel`, `fulfillment?: Fulfillment`,
`table?: string`, 5-value `OrderStatus`), per spec sections "Order model", "`features/orders` —
retarget to the unified Order model", and "`features/kds` — becomes the canonical status-change
surface":
1. `features/kds` keeps its existing ticket-board UX and channel badges (`DELIVERY|DINE-IN|PICKUP`
   already exists there) but retargets its internal type to the shared `Order`/`OrderStatus`
   instead of its own `KdsTicket`/`TicketItem` — delete those once nothing references them.
2. `features/orders`' back-office list/search/filter works over the unified `Order` model
   regardless of channel. `CreateOrderModal` (already exists for phone-style entry) gets a channel
   picker: `Dine-in` adds a table select sourced from `features/tables`' `tablesService`/`useTables`,
   `Phone`/`Online` add a fulfillment picker (`Pickup`/`Delivery`).
3. Status changes must write to the same record whether made from Orders or KDS — both are views
   over one data source, not two.
4. WhatsApp notification-on-status-change is explicitly OUT of scope here (spec flags it as a
   backend/integration dependency, not frontend-fakeable) — don't build a fake notification UI for it.
5. Mock data in both features' `constants/` needs reshaping to the unified `Order` type; check
   `orders.service.ts`'s mock order lines still reference real `MenuItem` ids (`m1`-`m8`, per the
   Standing Constraints above) after the reshape.

Then continue to Phase 5 (Administration — first phase against a REAL backend, use the
`connect-backend` skill), Phase 6 (Home/Analytics) in that order, writing each phase's plan only
once the prior phase is merged (later-phase specifics may shift based on decisions made in earlier
phases — e.g. Phase 3 already produced a reusable read-only-menu pattern worth revisiting for
Phase 6's Home dashboard).
