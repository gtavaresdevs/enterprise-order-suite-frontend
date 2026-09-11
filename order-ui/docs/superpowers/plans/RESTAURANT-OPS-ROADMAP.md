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
| 3 — Public read-only QR-tagged Menu view | 🔜 Next | *(not yet written)* | — |
| 4 — Orders/KDS repoint to shared Order model | 📋 Planned | *(not yet written)* | — |
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

## What's next: Phase 3 — Public read-only QR-tagged Menu view

**Why this one next** (over Orders/KDS or Administration): self-contained, no migration risk to
existing live features, and it closes out a known gap Phase 1 explicitly left as an interim fix
(QR codes → `/storefront` instead of a real read-only menu view).

**Goal:** `features/tables`' QR codes currently point at `/storefront?table=<id>` — the full
cart/checkout flow, not the lightweight "scan and see the menu for this table" view the spec
describes (see spec section "Tables model (minimal)" and "New `features/tables`"). Build a real
public, read-only route that:
1. Is NOT `/menu` (that's the authenticated admin CRUD page from Phase 1 — reusing it was Phase 1's
   original QR bug, already caught once).
2. Renders `MenuItem` cards from `menuService.getMenuItems()`, filtered to `available` only,
   grouped/filterable by category — no cart, no add-to-cart, no checkout UI.
3. Reads a `?table=<id>` query param and displays that table's name (via `features/tables`'
   `tablesService`/`useTables`).
4. Is registered in `src/app/router.tsx` outside `ProtectedLayout`/`AppLayout` (same pattern as
   `/storefront` and `/kds`).
5. Retargets `features/tables`' QR generation (`tables.constants.ts` seed data +
   `tables.service.ts`'s `createTable`) to the new route.

Then continue to Phase 4 (Orders/KDS), Phase 5 (Administration — first phase against a REAL
backend, use the `connect-backend` skill), Phase 6 (Home/Analytics) in that order, writing each
phase's plan only once the prior phase is merged (later-phase specifics may shift based on
decisions made in earlier phases — e.g. Phase 3 might produce a reusable read-only-menu component
worth reusing in Phase 6's Home dashboard).
