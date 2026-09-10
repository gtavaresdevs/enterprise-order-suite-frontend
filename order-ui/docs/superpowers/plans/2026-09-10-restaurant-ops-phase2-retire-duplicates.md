# Restaurant Ops Phase 2: Retire Duplicate Menu/Inventory Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the two remaining duplicate `MenuItem` datasets (`storefront`'s local `MENU` fixture and the entire `features/inventory` module) so `features/menu` is the single source of truth for menu/catalog data, per the spec's explicit direction that Inventory "disappears as a standalone item (folds into Menu)."

**Architecture:** `storefrontService.getMenu()` is retargeted to call `menuService.getMenuItems()` (filtered to `available` items, since customers should never see 86'd items) instead of importing its own `MENU` constant. `features/inventory` is deleted outright — its capability (stock/low-stock view, 86-toggle) already exists in `features/menu` (built in Phase 1's `MenuItemCard`/`MenuFeature`), so nothing needs to be rebuilt, only removed: the route, the nav entry, the page, and the feature folder.

**Tech Stack:** React 19 + TypeScript + Vite, TanStack React Query 5, existing `features/menu` module from Phase 1.

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` (see "Inventory simplifies into Menu" and "`features/inventory` — becomes a Menu-derived view" sections, and the migration-notes line: "Inventory disappears as a standalone item (folds into Menu).")

## Global Constraints

- `features/menu`'s `menuService`/`MENU_ITEMS` (in `src/features/menu/services/menu.service.ts` / `src/features/menu/constants/menu.constants.ts`) is the **only** source of `MenuItem` data going forward. No feature may keep its own `MenuItem[]` fixture after this plan.
- `MenuItem.id` values `m1`-`m9` (defined in `src/features/menu/constants/menu.constants.ts`) must not change — `src/features/orders/services/orders.service.ts` references `m1`-`m8` by id in its mock order lines (fixed in Phase 0). Do not touch `menu.constants.ts`'s existing ids.
- Storefront is customer-facing: it must only ever display `MenuItem`s where `available === true`. Never show 86'd items in the storefront feed.
- `@/*` path alias only, never relative `../../` imports (per this repo's CLAUDE.md).
- No test suite exists in this repo — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the safety net (per this repo's CLAUDE.md).
- Do NOT run `git stash` in any worktree for this plan — `.git` is shared across all worktrees in this repo and `git stash`/`git stash pop` can apply or clobber an unrelated worktree's stash. If you need to check something, use `git diff`/`git show`, never `git stash`.
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare `git commit -m "..."` with no pathspec — this repo has pre-existing unrelated staged files from other in-progress work that must never be swept into this branch's commits.

---

### Task 1: Retarget Storefront to consume canonical Menu data

**Files:**
- Modify: `src/features/storefront/services/storefront.service.ts`
- Modify: `src/features/storefront/hooks/useStorefront.ts`
- Modify: `src/features/storefront/components/StorefrontFeature.tsx`
- Modify: `src/features/storefront/constants/storefront.constants.ts`

**Interfaces:**
- Consumes: `menuService.getMenuItems(): Promise<MenuItem[]>` from `src/features/menu/services/menu.service.ts` (existing, unchanged — returns all items regardless of `available`).
- Produces: `useStorefront()` now also returns `menuItems: MenuItem[]` and `isLoading: boolean` (menu fetch loading state), consumed by `StorefrontFeature.tsx` in place of the old static `MENU` import.

**Current state (read before editing):**

`src/features/storefront/services/storefront.service.ts` currently:
```typescript
import { MENU } from "../constants/storefront.constants";
import type { MenuItem } from "@/types/menu";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        // Simulated API delay
        return new Promise((resolve) => setTimeout(() => resolve(MENU), 300));
    }
};
```

`src/features/storefront/constants/storefront.constants.ts` currently exports both `CATEGORIES` (a plain `string[]` used only for the storefront's category-tab UI, not domain data — keep this) and `MENU: MenuItem[]` (a full duplicate of `features/menu`'s fixture — delete this).

`src/features/storefront/hooks/useStorefront.ts` currently holds only local UI state (`activeCategory`, `selectedItem`, `cart`, `flowState`) and does not fetch data at all — `StorefrontFeature.tsx` imports `MENU` directly from constants and filters it inline (`const visibleMenu = MENU.filter(...)`), bypassing the hook layer.

`src/features/storefront/components/StorefrontFeature.tsx` currently:
```typescript
import { CATEGORIES } from "../constants/storefront.constants";
import { MENU } from "../constants/storefront.constants";
// ...
const visibleMenu = MENU.filter((item) => item.category === activeCategory);
```

- [ ] **Step 1: Rewrite `storefront.service.ts` to source from the canonical menu service**

```typescript
import { menuService } from "@/features/menu/services/menu.service";
import type { MenuItem } from "@/types/menu";

export const storefrontService = {
    getMenu: async (): Promise<MenuItem[]> => {
        const items = await menuService.getMenuItems();
        return items.filter((item) => item.available);
    }
};
```

- [ ] **Step 2: Delete the duplicate `MENU` fixture from `storefront.constants.ts`, keep `CATEGORIES`**

`src/features/storefront/constants/storefront.constants.ts` becomes just:
```typescript
export const CATEGORIES = ["Burgers", "Chicken", "Pizza", "Salads", "Sides", "Drinks", "Desserts"];
```
Remove the `MenuItem` import and the entire `MENU` array from this file.

- [ ] **Step 3: Add a menu query to `useStorefront.ts`**

Add a TanStack Query fetch for the menu inside the existing hook, alongside the existing local UI state (do not remove any existing state/returns — only add):

```typescript
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, FlowState } from "@/types/storefront";
import type { MenuItem } from "@/types/menu";
import { storefrontService } from "../services/storefront.service";

export const useStorefront = () => {
    const [activeCategory, setActiveCategory] = useState("Burgers");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [flowState, setFlowState] = useState<FlowState>("feed");

    const { data: menuItems = [], isLoading } = useQuery({
        queryKey: ["storefrontMenu"],
        queryFn: storefrontService.getMenu,
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
        addToCart
    };
};
```

- [ ] **Step 4: Update `StorefrontFeature.tsx` to consume `menuItems`/`isLoading` from the hook instead of the static import**

Remove the `import { MENU } from "../constants/storefront.constants";` line (keep the `CATEGORIES` import — it still exists in constants). Destructure `menuItems, isLoading` from `useStorefront()` alongside the existing destructured values. Replace:
```typescript
const visibleMenu = MENU.filter((item) => item.category === activeCategory);
```
with:
```typescript
const visibleMenu = menuItems.filter((item) => item.category === activeCategory);
```
Add a simple loading state in the menu-items render area (the `<div className="px-4 pt-4 space-y-3">` block that maps `visibleMenu`) — wrap its content: if `isLoading`, render a small centered `<p className="text-xs text-slate-400 text-center py-8">Loading menu...</p>` instead of the mapped list. Follow the existing loading-state text style used in `MenuFeature.tsx` (`text-sm text-slate-400 font-mono animate-pulse` — match whichever reads better in the storefront's tighter layout; either is acceptable, prioritize not breaking the existing JSX structure).

- [ ] **Step 5: Verify build**

Run: `yarn build`
Expected: no TypeScript errors, no missing-import errors for `MENU` anywhere in `src/features/storefront/`.

Run: `grep -rn "storefront.constants" src/features/storefront/` and confirm no remaining file destructures `MENU` from it (only `CATEGORIES` should be imported anywhere).

- [ ] **Step 6: Commit**

```bash
git add src/features/storefront/services/storefront.service.ts src/features/storefront/hooks/useStorefront.ts src/features/storefront/components/StorefrontFeature.tsx src/features/storefront/constants/storefront.constants.ts
git commit -m "$(cat <<'EOF'
feat(storefront): consume canonical Menu data instead of a duplicate fixture

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VeQBzAkFfYPvH48wBJQyMr
EOF
)" -- src/features/storefront/services/storefront.service.ts src/features/storefront/hooks/useStorefront.ts src/features/storefront/components/StorefrontFeature.tsx src/features/storefront/constants/storefront.constants.ts
```

---

### Task 2: Retire `features/inventory` (folds into Menu per spec)

**Files:**
- Delete: `src/features/inventory/` (entire folder: `components/ProductCard.tsx`, `components/AddProductModal.tsx`, `components/InventoryFeature.tsx`, `services/inventory.service.ts`, `constants/inventory.constants.ts`, `hooks/useInventory.ts`, `index.ts`)
- Delete: `src/pages/Inventory.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/layouts/app-layout/navigation.ts`

**Interfaces:**
- Consumes: nothing new — this task only removes code. `features/menu` (Phase 1) already provides the stock/low-stock view and 86-toggle that replace Inventory's purpose (`MenuItemCard.tsx`'s low-stock badge and availability `Switch`, `MenuFeature.tsx`'s stat strip and category filter).
- Produces: nothing new consumed by later tasks.

**Current state (read before editing):**

`src/app/router.tsx` contains, near the other feature routes:
```typescript
import InventoryPage from '@/pages/Inventory';
// ...
{
    path: '/inventory',
    element: <InventoryPage />,
},
```

`src/layouts/app-layout/navigation.ts`'s `NAVIGATION_ITEMS` contains:
```typescript
{ to: "/inventory", label: "Inventory", icon: Package, end: false },
```
(the `Package` icon import from `lucide-react` at the top of the file is used only by this nav entry — check whether any other entry in the file also uses `Package` before deciding whether to remove the import; if unused after this deletion, remove the `Package` import too.)

- [ ] **Step 1: Confirm nothing else in the app imports from `features/inventory`**

Run: `grep -rln "features/inventory" src/ --include="*.ts" --include="*.tsx"`
Expected: only `src/pages/Inventory.tsx` and `src/app/router.tsx` (the route registration) reference it. If anything else does, stop and report — do not delete until every consumer is accounted for.

- [ ] **Step 2: Delete the `features/inventory` folder and its page**

```bash
git rm -r src/features/inventory
git rm src/pages/Inventory.tsx
```

- [ ] **Step 3: Remove the `/inventory` route from `router.tsx`**

Delete the `import InventoryPage from '@/pages/Inventory';` line and the route object:
```typescript
{
    path: '/inventory',
    element: <InventoryPage />,
},
```

- [ ] **Step 4: Remove the Inventory nav entry from `navigation.ts`**

Delete this line from `NAVIGATION_ITEMS`:
```typescript
{ to: "/inventory", label: "Inventory", icon: Package, end: false },
```
Then check if `Package` is still referenced anywhere else in the file (`grep -n "Package" src/layouts/app-layout/navigation.ts`). If the only remaining reference is the import statement itself, remove `Package` from the `lucide-react` import list at the top of the file. If it's still used elsewhere, leave the import as-is.

- [ ] **Step 5: Verify build and grep for stragglers**

Run: `yarn build`
Expected: no missing-module errors for `@/features/inventory` or `@/pages/Inventory`.

Run: `grep -rn "inventory" src/ --include="*.ts" --include="*.tsx" -i`
Expected: zero results (confirms no stray reference, comment, or route survived — case-insensitive to also catch stray comments).

- [ ] **Step 6: Commit**

```bash
git add -u
git status --porcelain
```
Confirm the staged files are exactly: the deleted `src/features/inventory/**` files, the deleted `src/pages/Inventory.tsx`, and the modified `src/app/router.tsx` + `src/layouts/app-layout/navigation.ts`. If anything else appears staged, unstage it (`git restore --staged <file>`) before committing — do not sweep in unrelated pre-existing staged work from this repo.

```bash
git commit -m "$(cat <<'EOF'
chore: retire features/inventory, folded into Menu per spec

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VeQBzAkFfYPvH48wBJQyMr
EOF
)" -- src/features/inventory src/pages/Inventory.tsx src/app/router.tsx src/layouts/app-layout/navigation.ts
```
(Adjust the pathspec list to match whatever `git status --porcelain` actually shows staged, in case deleted-folder pathspecs behave differently in this git version — the goal is an exact, minimal commit.)

---

### Task 3: Full verification

**Files:** none (verification only).

**Interfaces:** N/A.

- [ ] **Step 1: Full build**

Run: `yarn build`
Expected: clean pass, zero TypeScript errors.

- [ ] **Step 2: Lint**

Run: `yarn lint`
Expected: no NEW lint errors introduced by this plan's changes (this repo has pre-existing lint debt unrelated to this work — compare against `git stash`-free baseline by checking that any reported file/line is not one this plan touched, or that the same error existed before this branch via `git show <base-sha>:<path>` if in doubt. Do NOT use `git stash` to check this — see Global Constraints).

- [ ] **Step 3: Browser-verify the Storefront still renders real menu data**

Dispatch the `ui-behavior-verifier` agent (per this repo's `verify-ui` skill) with this requirement: navigate to `/storefront`, confirm the menu feed renders items (not empty, not stuck on "Loading menu..."), confirm switching category tabs (e.g. "Burgers" → "Drinks") filters the visible items, and confirm the items shown match `features/menu`'s canonical fixture (e.g. "Double Smash Burger" under Burgers, "Caramel Latte" under Drinks) rather than any stale/duplicate data. `/storefront` is a standalone route rendered outside the authenticated app shell — no login/JWT needed. This feature is still mock data end-to-end; ignore any network 404s unrelated to the menu fetch. Explicitly confirm no unavailable/86'd item ever appears in the storefront feed (per this plan's Global Constraints) — cross-check against `menu.constants.ts`'s `m9` (Spicy Chicken Wings, `available: false`) never appearing under the "Chicken" category tab.

- [ ] **Step 4: Manually smoke-check nav has no dead Inventory link**

This is derivable from source (Task 2's grep already confirmed zero references) — no separate browser dispatch needed. Just re-confirm by reading `src/layouts/app-layout/navigation.ts` that `NAVIGATION_ITEMS` no longer lists Inventory.

- [ ] **Step 5: Report**

Summarize: build clean, lint clean (or pre-existing-only debt), storefront verified live against canonical Menu data, Inventory fully retired with zero stragglers.
