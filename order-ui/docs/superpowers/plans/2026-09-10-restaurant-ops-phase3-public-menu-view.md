# Restaurant Ops Phase 3: Public Read-Only QR-Tagged Menu View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `features/tables`' QR codes a real destination — a public, unauthenticated, read-only Menu view (no cart, no checkout) that shows only `available` `MenuItem`s, filterable by category, and displays the scanned table's name — replacing the interim `/storefront?table=<id>` redirect Phase 1 left in place.

**Architecture:** New feature module `features/table-menu` composes the two existing domains (`features/menu`, `features/tables`) behind its own thin service (`tableMenu.service.ts`) rather than reaching into either feature's service from the hook directly — this mirrors the precedent Phase 2 set with `storefront.service.ts` wrapping `menuService`. The service exposes `getPublicMenu()` (menu items filtered to `available`) and `getTable(id)` (finds one table by id from the existing `tablesService.getTables()` list — there's no per-id backend endpoint yet). The hook (`useTableMenu`) owns its own TanStack Query cache keys (`["publicMenu"]`, `["tables", tableId]`) rather than reusing `useMenu`'s/`useTables`' `["menuItems"]`/`["tables"]` keys, to avoid the same key backing two different filtered/unfiltered result shapes (a quirk already present between the admin Menu page and Storefront's shared `["menuItems"]` key — not fixing that here, just not adding a second instance of it). Category tabs are derived dynamically from whatever categories are actually present in the fetched menu items (`["All", ...distinct categories]`) instead of importing either existing feature's hardcoded `CATEGORIES` list, avoiding a third duplicate of that list. The page reuses the phone-mockup shell/branding pattern from `StorefrontFeature.tsx` (banner, logo, brand color from `PreferencesProvider`) since this is also a mobile, at-the-table scanning experience, but strips all cart/add-to-cart/checkout UI.

**Tech Stack:** React 19 + TypeScript + Vite, TanStack React Query 5, React Router v7 (`useSearchParams`), `features/menu` and `features/tables` from Phases 1–2.

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` (see "Tables model (minimal)" and "New `features/tables`" sections) and `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md`'s "What's next: Phase 3" section, which is the authoritative goal statement for this phase (it overrides the spec's literal `/menu?table=<id>` URL — that path is the authenticated admin CRUD page from Phase 1, already flagged once as a bug; this phase uses a new, non-`/menu` route instead).

## Global Constraints

- `MenuItem` ids `m1`-`m9` in `src/features/menu/constants/menu.constants.ts` are load-bearing — do not touch them.
- Never show a `MenuItem` where `available === false` in any customer-facing (non-admin) view. This phase's whole surface is customer-facing.
- `features/menu` is the ONLY source of `MenuItem` data. Do not introduce another local `MenuItem[]` fixture.
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists in this repo — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the only automated safety net.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo; use `git diff`/`git show` instead if you need to inspect something.
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare `git commit -m "..."` — this repo has pre-existing, unrelated staged work (notifications/profile/settings/layouts files) from other in-progress work that must never be swept into a commit here.
- The new route must render OUTSIDE `ProtectedLayout`/`AppLayout` — no login required — same pattern as `/storefront` and `/kds`.
- Limit Playwright/browser verification to *confirming* a fix already reasoned out from source — one dispatch at the very end, not iterative.

---

### Task 1: Build the `features/table-menu` module (service, hook, components)

**Files:**
- Create: `src/features/table-menu/services/tableMenu.service.ts`
- Create: `src/features/table-menu/hooks/useTableMenu.ts`
- Create: `src/features/table-menu/components/PublicMenuItemCard.tsx`
- Create: `src/features/table-menu/components/TableMenuFeature.tsx`
- Create: `src/features/table-menu/index.ts`

**Interfaces:**
- Consumes: `menuService.getMenuItems(): Promise<MenuItem[]>` from `src/features/menu/services/menu.service.ts` (existing, unchanged), `tablesService.getTables(): Promise<Table[]>` from `src/features/tables/services/tables.service.ts` (existing, unchanged), `usePreferencesContext()` from `@/app/providers/PreferencesProvider` (existing, unchanged — returns `{ preferences: { storefrontLogo, storefrontCover, storefrontBrandColor, ... } }`).
- Produces: `tableMenuService.getPublicMenu(): Promise<MenuItem[]>`, `tableMenuService.getTable(id: string): Promise<Table | null>`, `useTableMenu(): { table: Table | null; tableId: string | null; categories: string[]; filteredItems: MenuItem[]; activeCategory: string; setActiveCategory: (c: string) => void; isLoading: boolean }`, and the exported `TableMenuFeature` component — all consumed by Task 2's page.

**Current state (read before editing):**

`src/features/menu/services/menu.service.ts`'s `getMenuItems` returns ALL items regardless of `available` (admin needs to see 86'd items too) — this phase's service must filter client-side.

`src/features/tables/services/tables.service.ts`'s `getTables` returns the full table list — there's no per-id lookup endpoint (mock or real), so `getTable` filters the list client-side too.

`src/features/storefront/components/StorefrontFeature.tsx` has the phone-mockup shell/banner/category-tabs pattern this task reuses visually (see that file for the exact JSX shape) — this task does NOT import anything from `features/storefront` (no cart-flow code applies here), it only mirrors the visual structure.

- [ ] **Step 1: Create `tableMenu.service.ts`**

```typescript
import { menuService } from "@/features/menu/services/menu.service";
import { tablesService } from "@/features/tables/services/tables.service";
import type { MenuItem } from "@/types/menu";
import type { Table } from "@/types/tables";

export const tableMenuService = {
    getPublicMenu: async (): Promise<MenuItem[]> => {
        const items = await menuService.getMenuItems();
        return items.filter((item) => item.available);
    },

    getTable: async (tableId: string): Promise<Table | null> => {
        const tables = await tablesService.getTables();
        return tables.find((t) => t.id === tableId) ?? null;
    },
};
```

- [ ] **Step 2: Create `useTableMenu.ts`**

```typescript
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tableMenuService } from "../services/tableMenu.service";

export const useTableMenu = () => {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get("table");
    const [activeCategory, setActiveCategory] = useState("All");

    const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
        queryKey: ["publicMenu"],
        queryFn: tableMenuService.getPublicMenu,
    });

    const { data: table = null, isLoading: isTableLoading } = useQuery({
        queryKey: ["tables", tableId],
        queryFn: () => tableMenuService.getTable(tableId as string),
        enabled: !!tableId,
    });

    const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

    const filteredItems = activeCategory === "All"
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory);

    return {
        table,
        tableId,
        categories,
        filteredItems,
        activeCategory,
        setActiveCategory,
        isLoading: isMenuLoading || (!!tableId && isTableLoading),
    };
};
```

- [ ] **Step 3: Create `PublicMenuItemCard.tsx`**

A read-only card — same visual family as `features/storefront/components/MenuCard.tsx` but with no `onSelect`/button wrapper and no "+" add-to-cart badge (this view has no cart):

```tsx
import type { MenuItem } from "@/types/menu";

export function PublicMenuItemCard({ item }: { item: MenuItem }) {
    return (
        <div className="w-full bg-white rounded-[8px] border border-slate-100 overflow-hidden flex gap-3">
            <div className="flex-1 p-4 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug font-outfit">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-sm font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                </div>
            </div>
            <div className="w-24 h-24 flex-shrink-0 self-center mr-3">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[8px]" />
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Create `TableMenuFeature.tsx`**

```tsx
import { UtensilsCrossed } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import { useTableMenu } from "../hooks/useTableMenu";
import { PublicMenuItemCard } from "./PublicMenuItemCard";

export const TableMenuFeature = () => {
    const { table, tableId, categories, filteredItems, activeCategory, setActiveCategory, isLoading } = useTableMenu();
    const { preferences } = usePreferencesContext();
    const { storefrontLogo, storefrontCover, storefrontBrandColor } = preferences;

    return (
        <div className="min-h-screen flex items-start justify-center py-8 px-4 bg-[#f8fafc] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]">
            <div
                className="relative w-full bg-white overflow-hidden shadow-2xl shadow-slate-900/25 flex flex-col"
                style={{ maxWidth: 390, minHeight: "85vh", borderRadius: 32, border: "1px solid rgba(15,23,42,0.1)" }}
            >
                <div className="relative h-32 flex-shrink-0 bg-slate-900">
                    <img
                        src={storefrontCover ?? "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=320&fit=crop&auto=format"}
                        alt="Banner"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    {storefrontLogo && (
                        <img
                            src={storefrontLogo}
                            alt="Store logo"
                            className="absolute top-3 left-4 w-10 h-10 rounded-[8px] object-cover border-2 border-white shadow-md"
                        />
                    )}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-white/80" />
                        <p className="text-sm font-bold text-white">
                            {table ? table.name : tableId ? "Table not found" : "Menu"}
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 bg-white border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium ${activeCategory === cat ? "text-white" : "bg-slate-100 text-slate-500"}`}
                                style={activeCategory === cat ? { backgroundColor: storefrontBrandColor } : undefined}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-6">
                    <div className="px-4 pt-4 space-y-3">
                        {isLoading ? (
                            <p className="text-xs text-slate-400 text-center py-8">Loading menu...</p>
                        ) : filteredItems.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No items in this category.</p>
                        ) : (
                            filteredItems.map((item) => <PublicMenuItemCard key={item.id} item={item} />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
```

- [ ] **Step 5: Create `index.ts`**

```typescript
export { TableMenuFeature } from "./components/TableMenuFeature";
```

- [ ] **Step 6: Verify build**

Run: `yarn build`
Expected: no TypeScript errors in `src/features/table-menu/`.

- [ ] **Step 7: Commit**

```bash
git add src/features/table-menu
git commit -m "$(cat <<'EOF'
feat(table-menu): add public read-only QR-tagged menu view

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VeQBzAkFfYPvH48wBJQyMr
EOF
)" -- src/features/table-menu
```

---

### Task 2: Register the `/table-menu` route outside the authenticated shell

**Files:**
- Create: `src/pages/TableMenu.tsx`
- Modify: `src/app/router.tsx`

**Interfaces:**
- Consumes: `TableMenuFeature` from `@/features/table-menu` (Task 1).
- Produces: nothing new consumed by later tasks — this is the final wiring step for the route itself.

**Current state (read before editing):**

`src/app/router.tsx`'s "Standalone Routes (Outside Admin Shell)" block currently has:
```tsx
{
    path: '/storefront',
    element: <StorefrontPage />,
},
{
    path: '/checkout',
    element: <Navigate to="/storefront" replace />,
},
{
    path: '/kds',
    element: <KDSPage />,
},
```

- [ ] **Step 1: Create the thin page entry point**

```tsx
import { TableMenuFeature } from "@/features/table-menu";

export default function TableMenuPage() {
    return <TableMenuFeature />;
}
```

- [ ] **Step 2: Register the route in `router.tsx`**

Add the import under the "Standalone Pages" import block:
```tsx
import TableMenuPage from '@/pages/TableMenu';
```

Add the route object into the "Standalone Routes (Outside Admin Shell)" block, alongside `/storefront` and `/kds`:
```tsx
{
    path: '/table-menu',
    element: <TableMenuPage />,
},
```

- [ ] **Step 3: Verify build**

Run: `yarn build`
Expected: no TypeScript errors, `TableMenuPage` resolves cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TableMenu.tsx src/app/router.tsx
git commit -m "$(cat <<'EOF'
feat(table-menu): register public /table-menu route outside the app shell

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VeQBzAkFfYPvH48wBJQyMr
EOF
)" -- src/pages/TableMenu.tsx src/app/router.tsx
```

---

### Task 3: Retarget `features/tables`' QR generation to the new route

**Files:**
- Modify: `src/features/tables/constants/tables.constants.ts`
- Modify: `src/features/tables/services/tables.service.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new consumed by later tasks — `TableCard.tsx` already renders whatever `qrCodeUrl` it's given (`${window.location.origin}${table.qrCodeUrl}`), so no change needed there.

**Current state (read before editing):**

`src/features/tables/constants/tables.constants.ts` currently:
```typescript
import type { Table } from "@/types/tables";

export const TABLES: Table[] = [
    { id: "t1", name: "Table 1", qrCodeUrl: "/storefront?table=t1" },
    { id: "t2", name: "Table 2", qrCodeUrl: "/storefront?table=t2" },
    { id: "t3", name: "Table 3", qrCodeUrl: "/storefront?table=t3" },
    { id: "t4", name: "Table 4", qrCodeUrl: "/storefront?table=t4" },
    { id: "t5", name: "Patio 1", qrCodeUrl: "/storefront?table=t5" },
];
```

`src/features/tables/services/tables.service.ts`'s `createTable` currently builds `qrCodeUrl: \`/storefront?table=${id}\``.

- [ ] **Step 1: Retarget the seed data**

```typescript
import type { Table } from "@/types/tables";

export const TABLES: Table[] = [
    { id: "t1", name: "Table 1", qrCodeUrl: "/table-menu?table=t1" },
    { id: "t2", name: "Table 2", qrCodeUrl: "/table-menu?table=t2" },
    { id: "t3", name: "Table 3", qrCodeUrl: "/table-menu?table=t3" },
    { id: "t4", name: "Table 4", qrCodeUrl: "/table-menu?table=t4" },
    { id: "t5", name: "Patio 1", qrCodeUrl: "/table-menu?table=t5" },
];
```

- [ ] **Step 2: Retarget `createTable`'s generated URL**

In `tables.service.ts`, change:
```typescript
const newTable: Table = { id, name, qrCodeUrl: `/storefront?table=${id}` };
```
to:
```typescript
const newTable: Table = { id, name, qrCodeUrl: `/table-menu?table=${id}` };
```

- [ ] **Step 3: Verify build and grep for stragglers**

Run: `yarn build`
Expected: clean.

Run: `grep -rn "storefront?table=" src/`
Expected: zero results — confirms no remaining reference to the interim Phase 1 URL shape.

- [ ] **Step 4: Commit**

```bash
git add src/features/tables/constants/tables.constants.ts src/features/tables/services/tables.service.ts
git commit -m "$(cat <<'EOF'
fix(tables): point QR codes at the new public menu view, not storefront

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VeQBzAkFfYPvH48wBJQyMr
EOF
)" -- src/features/tables/constants/tables.constants.ts src/features/tables/services/tables.service.ts
```

---

### Task 4: Full verification

**Files:** none (verification only).

**Interfaces:** N/A.

- [ ] **Step 1: Full build**

Run: `yarn build`
Expected: clean pass, zero TypeScript errors.

- [ ] **Step 2: Lint**

Run: `yarn lint`
Expected: no NEW lint errors introduced by this plan's changes (this repo has pre-existing lint debt unrelated to this work — compare against a pre-existing baseline by checking that any reported file/line is not one this plan touched, or that the same error existed before this branch via `git show <base-sha>:<path>` if in doubt. Do NOT use `git stash` to check this — see Global Constraints).

- [ ] **Step 3: Confirm no customer-facing 86'd-item leak, statically**

Run: `grep -n "available" src/features/table-menu/services/tableMenu.service.ts`
Expected: confirms `getPublicMenu` filters on `item.available` before anything renders (Task 1, Step 1) — this is the single choke point, so this grep is sufficient without a browser round-trip to prove the filter exists (a browser dispatch below still confirms it behaves correctly against live mock data).

- [ ] **Step 4: Browser-verify the new public menu view**

Dispatch the `ui-behavior-verifier` agent (per this repo's `verify-ui` skill) with this requirement: navigate to `/table-menu?table=t2`, confirm it loads with NO login/JWT required (this route is outside `ProtectedLayout`), confirm the banner shows "Table 2" (from `tables.constants.ts`'s seed data), confirm the menu feed renders `MenuItem` cards with no cart/add-to-cart/checkout UI anywhere on the page (no "+" buttons, no cart FAB, no checkout flow), confirm switching category tabs filters the visible items, and confirm `menu.constants.ts`'s `m9` (Spicy Chicken Wings, `available: false`) never appears under the "Chicken" category tab. Also navigate to `/table-menu` with no query param and confirm it still renders (banner shows "Menu" instead of a table name, per Task 1 Step 4's fallback) rather than crashing. This feature is mock data end-to-end; ignore any network 404s unrelated to the menu/table fetch.

- [ ] **Step 5: Manually confirm the Tables admin page's QR codes now point at the new route**

This is derivable from source (Task 3's grep already confirmed zero stale references) — no separate browser dispatch needed. Re-confirm by reading `src/features/tables/constants/tables.constants.ts` and `src/features/tables/services/tables.service.ts` that both build `qrCodeUrl` from `/table-menu?table=...`.

- [ ] **Step 6: Report**

Summarize: build clean, lint clean (or pre-existing-only debt), `/table-menu` verified live outside the authenticated shell with correct table-name lookup, category filtering, and zero 86'd-item leakage; Tables' QR generation fully retargeted with zero stragglers.
