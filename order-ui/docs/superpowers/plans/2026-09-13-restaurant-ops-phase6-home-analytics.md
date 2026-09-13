# Restaurant Ops Phase 6: Home Rewrite + Analytics Repoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `features/home` as a real operational dashboard and repoint `features/analytics` — both currently rendering static/fabricated mock copy — onto the unified `Order`/`MenuItem` model established in Phases 0-4, so both screens reflect the same real (mock-backed) data every other feature already reads.

**Architecture:** `features/home` and `features/analytics` both compose `ordersService`/`menuService` from `src/features/orders` and `src/features/menu` directly inside their own `services/*.service.ts` — the same cross-feature composition pattern Phase 3's `table-menu` service established (compose at the service layer, not in hooks or components). Neither feature gets a shared cache key with `["orders"]`/`["menuItems"]`; each keeps its own dedicated `useQuery` key (`["home","dashboard"]`, `["analytics", ...]`), consistent with Phase 3's precedent of using a separate key when the shape being cached is a derived/filtered view rather than the same record set KDS and Orders share in Phase 4.

Two of the real data model's known gaps force explicit, documented deviations from the spec's exact wording (same class of decision Phase 4 already made when it dropped fabricated `timer`/`isRush` fields because `Order.createdAt` is date-only):

1. **No time-of-day data.** `Order.createdAt` is a date-only string (`"2024-11-20"`), not a timestamp — established in Phase 4 and still true. The spec's Home stat "avg prep time" and Analytics' "peak-hours heatmap" both need a duration or hour-of-day, neither of which the model carries. Rather than fabricate one:
   - Home's third snapshot stat becomes **Avg Order Value** (`revenue / order count`, fully real) instead of avg prep time.
   - Analytics' heatmap becomes **Order Volume by Day** (order count per calendar date present in the data) instead of a peak-hours-of-day heatmap. Same visual component, real axis.
2. **No prior-period baseline.** The current Analytics KPI cards and Top Items list show a fabricated `trend`/`isPositive` percentage (e.g. "+12.5%") implying a comparison to a previous period — no such second period exists anywhere in the mock dataset. These trend badges are dropped rather than invented; `AnalyticsKPI`/`TopItem` lose their `trend`/`isPositive` fields.

Additionally: the mock order dates are fixed in the past (`2024-11-19`/`2024-11-20`), so Home's "Today's snapshot" resolves "today" to the **most recent date actually present in the order data**, not `new Date()` — using the real calendar date would show an empty snapshot against this fixture. Per the roadmap's explicit instruction not to invent a cross-feature dependency the spec doesn't call for, Home does **not** surface any Administration (Phase 5) data (team size, audit activity) — the spec's Home section lists exactly four blocks (today's snapshot, kitchen backlog, low-stock alerts, quick actions) and none of them are Administration-derived.

**Tech Stack:** React 19 + TypeScript + Vite, TanStack React Query 5, `recharts` (already used by Analytics), existing `ordersService`/`menuService` (Phases 1/4).

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` — sections "`features/home` — full rewrite" and "`features/analytics` — mostly unchanged, repointed". Also `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md`'s "What's next: Phase 6" section, which is the authoritative goal statement this plan argues from.

## Global Constraints

- `MenuItem` ids `m1`-`m9` in `src/features/menu/constants/menu.constants.ts` are load-bearing — do not change them.
- Never show a `MenuItem` where `available === false` in any customer-facing (non-admin) view. Home's Administration/staff-facing low-stock list is an internal view, but still excludes items where `available === false` (a low-stock alert about an item that's already 86'd is noise, not signal) — only `available && stockQuantity > 0 && stockQuantity <= LOW_STOCK_THRESHOLD` items qualify.
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists in this repo — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the only automated safety net.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo; use `git diff`/`git show` instead if you need to inspect something.
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare `git commit -m "..."` — this repo has pre-existing, unrelated staged/modified work (notifications/profile/settings/layouts files) from other in-progress work that must never be swept into a commit here.
- Limit Playwright/browser verification to *confirming* a fix already reasoned out from source — one dispatch at the very end, not iterative.
- Both `/home` and `/analytics` already have routes and nav entries (`src/app/router.tsx`, `src/layouts/app-layout/navigation.ts`) — this phase does not touch routing or navigation.
- Do not fabricate any field the real data can't back (no invented trend percentages, no invented timestamps) — see the Architecture section above for the two specific deviations this forces.
- WhatsApp notifications and in-app payment remain explicitly out of scope (backend/integration dependency, per spec) — do not touch either.

---

### Task 1: Extract a shared `LOW_STOCK_THRESHOLD` constant

**Files:**
- Modify: `src/features/menu/constants/menu.constants.ts`
- Modify: `src/features/menu/components/MenuItemCard.tsx`
- Modify: `src/features/menu/components/MenuFeature.tsx`

**Interfaces:**
- Produces: `LOW_STOCK_THRESHOLD: number` exported from `src/features/menu/constants/menu.constants.ts`.
- Consumed by: Task 2's `home.service.ts` (Home's low-stock alert list must use the exact same threshold Menu already uses — today both `MenuItemCard.tsx` and `MenuFeature.tsx` independently hardcode the literal `5`).

**Current state (read before editing):** `src/features/menu/components/MenuItemCard.tsx:15` has `const lowStock = item.stockQuantity > 0 && item.stockQuantity <= 5;` and `src/features/menu/components/MenuFeature.tsx:36` has `const lowStockCount = menuItems.filter((item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= 5).length;` — the same business rule duplicated as a magic number in two files, about to become three once Home needs it too.

- [ ] **Step 1: Add the constant**

In `src/features/menu/constants/menu.constants.ts`, add above `export const CATEGORIES = ...`:

```typescript
export const LOW_STOCK_THRESHOLD = 5;
```

- [ ] **Step 2: Use it in `MenuItemCard.tsx`**

Change the import line to:

```typescript
import { LOW_STOCK_THRESHOLD } from "../constants/menu.constants";
```

Change line 15 to:

```typescript
    const lowStock = item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD;
```

- [ ] **Step 3: Use it in `MenuFeature.tsx`**

Change the import line to:

```typescript
import { CATEGORIES, LOW_STOCK_THRESHOLD } from "../constants/menu.constants";
```

Change line 36 to:

```typescript
    const lowStockCount = menuItems.filter((item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD).length;
```

- [ ] **Step 4: Verify build**

Run: `yarn build`
Expected: no TypeScript errors, Menu feature compiles clean.

- [ ] **Step 5: Commit**

```bash
git add src/features/menu/constants/menu.constants.ts src/features/menu/components/MenuItemCard.tsx src/features/menu/components/MenuFeature.tsx
git commit -m "$(cat <<'EOF'
refactor(menu): extract LOW_STOCK_THRESHOLD constant

Two copies of the literal `5` already existed (MenuItemCard, MenuFeature);
Home's dashboard needs the same threshold next, which would have made it
three. One named constant instead.
EOF
)"
```

---

### Task 2: Home's data layer — types, constants, service, hook

**Files:**
- Modify: `src/types/home.ts`
- Modify: `src/features/home/constants/home.constants.ts`
- Modify: `src/features/home/services/home.service.ts`
- Modify: `src/features/home/hooks/useHomeData.ts`

**Interfaces:**
- Consumes: `ordersService.getOrders(): Promise<Order[]>` (`src/features/orders/services/orders.service.ts`), `menuService.getMenuItems(): Promise<MenuItem[]>` (`src/features/menu/services/menu.service.ts`), `LOW_STOCK_THRESHOLD` (Task 1).
- Produces: `homeService.getHomeDashboardData(): Promise<HomeDashboardData>`. `useHomeData()` returns `{ snapshot: HomeSnapshot | undefined; kitchenBacklogCount: number; lowStockItems: MenuItem[]; isLoading: boolean }`. `ACTION_CARDS: ActionCard[]` (now 4 cards, one of which uses the new `copyValue` field instead of `to`).
- Consumed by: Task 3 (`HomeHeader.tsx`, `QuickActions.tsx`, and the three new components it introduces).

**Current state (read before editing):** `src/types/home.ts` defines `HomeData { actions, stats, chatMessages }` plus `Stat`/`ChatMessage`/`ActionCard`/`NavItem`. `home.constants.ts` hardcodes 3 procurement-themed `ACTION_CARDS`, 3 fabricated `STATS`, and a scripted `CHAT_MESSAGES` conversation. `home.service.ts`/`useHomeData.ts` just resolve those constants through a fake `setTimeout`.

- [ ] **Step 1: Rewrite `src/types/home.ts`**

```typescript
import type { ElementType } from "react";
import type { OrderChannel } from "@/types/orders";
import type { MenuItem } from "@/types/menu";

// ── Action Contracts ─────────────────────────────────────────────────────────

export interface ActionCard {
  icon: ElementType;
  label: string;
  description: string;
  to?: string;
  copyValue?: string;
  accent: string;
  iconBg: string;
}

// ── Dashboard Data Contracts ────────────────────────────────────────────────

export interface ChannelCount {
  channel: OrderChannel;
  count: number;
}

export interface HomeSnapshot {
  snapshotDate: string;
  channelCounts: ChannelCount[];
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
}

export interface HomeDashboardData {
  snapshot: HomeSnapshot;
  kitchenBacklogCount: number;
  lowStockItems: MenuItem[];
}
```

`ChatMessage` and `HomeData` are deleted (nothing outside `src/features/home/` referenced either, confirmed by grep before writing this plan). `Stat` and `NavItem` are also dropped: `NavItem` here was already dead before this task (the sidebar uses its own, differently-shaped `NavItem` from `src/layouts/app-layout/navigation.ts`), and `Stat` becomes dead once `STATS`/`StatsOverview.tsx` are removed in this task — Task 3's `TodaySnapshot.tsx` builds its tiles as plain inline objects rather than reviving this type, so keeping either would just be unused exports.

- [ ] **Step 2: Rewrite `src/features/home/constants/home.constants.ts`**

```typescript
import { ShoppingCart, ChefHat, UtensilsCrossed, Link2 } from "lucide-react";
import type { ActionCard } from "@/types/home";

export const ACTION_CARDS: ActionCard[] = [
  {
    icon: ShoppingCart,
    label: "New Order",
    description: "Enter a phone or dine-in order on a customer's behalf.",
    to: "/orders",
    accent: "hover:border-slate-300",
    iconBg: "bg-slate-950 text-slate-50",
  },
  {
    icon: ChefHat,
    label: "Open Kitchen Display",
    description: "View and advance the live kitchen order queue.",
    to: "/kds",
    accent: "hover:border-amber-200",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    icon: UtensilsCrossed,
    label: "View Menu",
    description: "Manage items, prices, availability, and stock.",
    to: "/menu",
    accent: "hover:border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Link2,
    label: "Copy Ordering Link",
    description: "Share the public storefront link via WhatsApp or Instagram.",
    copyValue: "/storefront",
    accent: "hover:border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
  },
];
```

`STATS` and `CHAT_MESSAGES` are deleted — Home's stats are now computed real data (Step 3 below), and the `ChatAssistant` widget they backed is deleted in Task 3.

- [ ] **Step 3: Rewrite `src/features/home/services/home.service.ts`**

```typescript
import { ordersService } from "@/features/orders/services/orders.service";
import { menuService } from "@/features/menu/services/menu.service";
import { LOW_STOCK_THRESHOLD } from "@/features/menu/constants/menu.constants";
import type { HomeDashboardData, ChannelCount } from "@/types/home";
import type { OrderChannel } from "@/types/orders";

const CHANNELS: OrderChannel[] = ["Online", "Dine-in", "Phone"];
const KITCHEN_BACKLOG_STATUSES = new Set(["New", "Preparing"]);

export const homeService = {
  /**
   * Composes orders + menu data into one dashboard snapshot, the same
   * cross-feature composition pattern features/table-menu's service uses.
   */
  getHomeDashboardData: async (): Promise<HomeDashboardData> => {
    const [orders, menuItems] = await Promise.all([
      ordersService.getOrders(),
      menuService.getMenuItems(),
    ]);

    // Order.createdAt is date-only and the mock fixture is fixed in the past
    // (see orders.constants.ts) — "today" is the most recent date actually
    // present in the data, not the real calendar date, or every stat below
    // would read zero against this fixture.
    const snapshotDate = orders.reduce(
      (latest, o) => (o.createdAt > latest ? o.createdAt : latest),
      orders[0]?.createdAt ?? ""
    );
    const todaysOrders = orders.filter((o) => o.createdAt === snapshotDate);

    const channelCounts: ChannelCount[] = CHANNELS.map((channel) => ({
      channel,
      count: todaysOrders.filter((o) => o.channel === channel).length,
    }));

    const billableOrders = todaysOrders.filter((o) => o.status !== "Cancelled");
    const revenue = billableOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = billableOrders.length > 0 ? revenue / billableOrders.length : 0;

    // Kitchen backlog is a right-now concept, not scoped to "today" — it
    // covers every order still in New/Preparing regardless of its date.
    const kitchenBacklogCount = orders.filter((o) => KITCHEN_BACKLOG_STATUSES.has(o.status)).length;

    const lowStockItems = menuItems.filter(
      (item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD
    );

    return {
      snapshot: {
        snapshotDate,
        channelCounts,
        totalOrders: todaysOrders.length,
        revenue,
        avgOrderValue,
      },
      kitchenBacklogCount,
      lowStockItems,
    };
  },
};
```

- [ ] **Step 4: Rewrite `src/features/home/hooks/useHomeData.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { homeService } from "../services/home.service";

export function useHomeData() {
  const { data, isLoading } = useQuery({
    queryKey: ["home", "dashboard"],
    queryFn: homeService.getHomeDashboardData,
  });

  return {
    snapshot: data?.snapshot,
    kitchenBacklogCount: data?.kitchenBacklogCount ?? 0,
    lowStockItems: data?.lowStockItems ?? [],
    isLoading,
  };
}
```

- [ ] **Step 5: Verify build**

Run: `yarn build`
Expected: fails here, expectedly — `HomeHeader.tsx`, `QuickActions.tsx`, `StatsOverview.tsx`, `ChatAssistant.tsx` still reference the old `useHomeData()` shape (`actions`, `stats`, `chatMessages`) and old types. Confirm the errors are exactly in those 4 files (Task 3 fixes them) and nowhere else — if `tsc` reports an error outside `src/features/home/`, stop and re-check Step 1-4 before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/types/home.ts src/features/home/constants/home.constants.ts src/features/home/services/home.service.ts src/features/home/hooks/useHomeData.ts
git commit -m "$(cat <<'EOF'
feat(home): repoint dashboard data layer onto real orders/menu data

Replaces the fabricated "Product Procurement"/"Kyoto Data Systems" mock
snapshot with one computed from ordersService + menuService: today's
order count by channel, revenue, avg order value (avg prep time isn't
computable — Order.createdAt is date-only, no timer field to back it),
kitchen backlog count, and real low-stock menu items. Components in the
next commit catch up to this new shape.
EOF
)"
```

---

### Task 3: Home's components — header, quick actions, snapshot, backlog, low-stock

**Files:**
- Modify: `src/features/home/components/HomeHeader.tsx`
- Modify: `src/features/home/components/QuickActions.tsx`
- Modify: `src/features/home/components/HomeFeature.tsx`
- Create: `src/features/home/components/TodaySnapshot.tsx`
- Create: `src/features/home/components/KitchenBacklog.tsx`
- Create: `src/features/home/components/LowStockAlerts.tsx`
- Delete: `src/features/home/components/StatsOverview.tsx`
- Delete: `src/features/home/components/ChatAssistant.tsx`
- Delete: `src/features/home/hooks/useChatAssistant.ts`

**Interfaces:**
- Consumes: `useHomeData()`, `ACTION_CARDS` (Task 2), `useAuth()` (`src/features/auth/hooks/useAuth.ts`, returns `{ user: User | null; isLoading }` where `User` has optional `firstName`/`lastName`/`email`), `useFormat()` (`src/features/preferences/hooks/useFormat.ts`, returns `{ formatCurrency, formatDate }`).
- Produces: `HomeFeature` composes all of the above — no other feature consumes these components.

**Current state (read before editing):** `HomeHeader.tsx` hardcodes the greeting name as `"Alex Watson"` — exactly the kind of generic-demo artifact this whole initiative removes elsewhere, and it's in the same file this task already touches for other reasons, so it's fixed here too rather than left as the one remaining hardcoded name on the page. `QuickActions.tsx` and `StatsOverview.tsx` both read from `useHomeData()`'s old shape. `ChatAssistant.tsx`/`useChatAssistant.ts` back the "Setup Assistant" widget the spec calls out by name for removal (its own mock dialogue narrates building `/home` and `/orders`).

- [ ] **Step 1: Rewrite `HomeHeader.tsx`**

```tsx
import { Layers } from "lucide-react";
import { useTimestamp } from "../hooks/useTimestamp";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HomeHeader() {
    const { greeting, dateStr, timeStr } = useTimestamp();
    const { user } = useAuth();
    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "there";

    return (
        <div className="flex items-start justify-between mb-8">

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-950 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-3 h-3 text-slate-100" />
                    </div>

                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                        Enterprise Order Suite
                    </span>
                </div>

                <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
                    {greeting}, <span className="text-slate-500">{displayName}</span>
                </h1>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{dateStr}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="font-mono text-sm text-slate-400">{timeStr}</span>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Rewrite `QuickActions.tsx`**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ChevronRight, Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ACTION_CARDS } from "../constants/home.constants";

export function QuickActions() {
    const navigate = useNavigate();
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

    const handleCopy = async (label: string, path: string) => {
        const url = `${window.location.origin}${path}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLabel(label);
            setTimeout(() => setCopiedLabel((current) => (current === label ? null : current)), 2000);
        } catch {
            // Clipboard permission denied by the browser — nothing to recover here.
        }
    };

    return (
        <section className="space-y-4">

            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Quick Actions
                </h2>

                <span className="text-xs text-slate-400 font-mono">
                    {ACTION_CARDS.length} pathways
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {ACTION_CARDS.map((card) => {
                    const Icon = card.icon;
                    const isCopied = copiedLabel === card.label;

                    return (
                        <Card
                            key={card.label}
                            onClick={() => (card.to ? navigate(card.to) : card.copyValue && handleCopy(card.label, card.copyValue))}
                            className={`group text-left rounded-[8px] border border-slate-100 bg-white shadow-none hover:shadow-md hover:shadow-slate-900/5 transition-all h-full cursor-pointer ${card.accent}`}
                        >
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">

                                <div className="flex items-start justify-between">
                                    <div
                                        className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {card.copyValue ? (
                                        isCopied ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
                                        )
                                    ) : (
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                                        {card.label}
                                    </h3>

                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                    {card.copyValue ? (
                                        isCopied ? "Copied!" : "Copy link"
                                    ) : (
                                        <>Navigate <ChevronRight className="w-3 h-3" /></>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
```

- [ ] **Step 3: Create `TodaySnapshot.tsx`** (replaces `StatsOverview.tsx`)

```tsx
import { DollarSign, ShoppingBag, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeData } from "../hooks/useHomeData";
import { useFormat } from "@/features/preferences/hooks/useFormat";

export function TodaySnapshot() {
    const { snapshot, isLoading } = useHomeData();
    const { formatCurrency } = useFormat();

    const tiles = snapshot
        ? [
            { label: "Revenue", value: formatCurrency(snapshot.revenue), icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
            { label: "Orders", value: String(snapshot.totalOrders), icon: ShoppingBag, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
            { label: "Avg Order Value", value: formatCurrency(snapshot.avgOrderValue), icon: Calculator, iconColor: "text-slate-600", iconBg: "bg-slate-100" },
        ]
        : [];

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Today's Snapshot
                </h2>
                {snapshot && (
                    <span className="text-xs text-slate-400 font-mono">{snapshot.snapshotDate}</span>
                )}
            </div>

            {isLoading ? (
                <p className="text-sm text-slate-400 font-mono animate-pulse">Loading snapshot...</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {tiles.map((tile) => {
                        const Icon = tile.icon;
                        return (
                            <Card key={tile.label} className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${tile.iconBg}`}>
                                        <Icon className={`w-4 h-4 ${tile.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                                            {tile.label}
                                        </p>
                                        <p className="text-base font-semibold text-slate-900 truncate">
                                            {tile.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                        <CardContent className="p-4">
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2.5">
                                Orders by Channel
                            </p>
                            <div className="flex flex-col gap-2">
                                {snapshot?.channelCounts.map((c) => (
                                    <div key={c.channel} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 font-medium">{c.channel}</span>
                                        <span className="font-mono text-slate-900 font-semibold">{c.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    );
}
```

- [ ] **Step 4: Create `KitchenBacklog.tsx`**

```tsx
import { useNavigate } from "react-router";
import { Utensils, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHomeData } from "../hooks/useHomeData";

export function KitchenBacklog() {
    const navigate = useNavigate();
    const { kitchenBacklogCount, isLoading } = useHomeData();

    return (
        <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                Kitchen Backlog
            </h2>

            <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[8px] bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-slate-900 font-mono">
                                {isLoading ? "-" : kitchenBacklogCount}
                            </p>
                            <p className="text-xs text-slate-400">
                                Order{kitchenBacklogCount !== 1 ? "s" : ""} New or Preparing
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate("/kds")}
                        variant="outline"
                        className="w-full h-9 rounded-[8px] border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                        View Kitchen Display
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
```

- [ ] **Step 5: Create `LowStockAlerts.tsx`** (replaces `ChatAssistant.tsx`)

```tsx
import { useNavigate } from "react-router";
import { PackageX, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHomeData } from "../hooks/useHomeData";

export function LowStockAlerts() {
    const navigate = useNavigate();
    const { lowStockItems, isLoading } = useHomeData();

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Low-Stock Alerts
                </h2>
                {!isLoading && lowStockItems.length > 0 && (
                    <span className="text-xs text-slate-400 font-mono">
                        {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                <CardContent className="p-4">
                    {isLoading ? (
                        <p className="text-sm text-slate-400 font-mono animate-pulse py-4 text-center">Loading menu stock...</p>
                    ) : lowStockItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <p className="text-sm text-slate-400">All menu items are well stocked.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <PackageX className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-700 truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-mono font-semibold text-amber-600 flex-shrink-0">
                                        {item.stockQuantity} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={() => navigate("/menu")}
                        variant="outline"
                        className="w-full h-9 mt-4 rounded-[8px] border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                        Manage Menu
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
```

- [ ] **Step 6: Rewrite `HomeFeature.tsx`**

```tsx
import { HomeHeader } from "./HomeHeader";
import { QuickActions } from "./QuickActions";
import { TodaySnapshot } from "./TodaySnapshot";
import { KitchenBacklog } from "./KitchenBacklog";
import { LowStockAlerts } from "./LowStockAlerts";

export function HomeFeature() {
    return (
        <div
            className="min-h-full"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            {/* Background pattern */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(#0f172a 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    opacity: 0.03,
                }}
            />

            {/* Page container */}
            <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 space-y-6">
                <HomeHeader />
                <QuickActions />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    <div className="space-y-5">
                        <TodaySnapshot />
                    </div>

                    <div className="space-y-5">
                        <KitchenBacklog />
                        <LowStockAlerts />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 7: Delete the retired files**

```bash
git rm src/features/home/components/StatsOverview.tsx src/features/home/components/ChatAssistant.tsx src/features/home/hooks/useChatAssistant.ts
```

- [ ] **Step 8: Verify build**

Run: `yarn build`
Expected: clean. Also run `yarn lint` — expected clean (no unused imports left behind from the deleted components).

- [ ] **Step 9: Commit**

```bash
git add src/features/home/components/HomeHeader.tsx src/features/home/components/QuickActions.tsx src/features/home/components/HomeFeature.tsx src/features/home/components/TodaySnapshot.tsx src/features/home/components/KitchenBacklog.tsx src/features/home/components/LowStockAlerts.tsx
git commit -m "$(cat <<'EOF'
feat(home): rebuild dashboard UI on real order/menu data

Drops the procurement copy and the "Setup Assistant" chat widget (its own
mock dialogue literally narrated building /home and /orders — a
scaffolding artifact, not a feature) per the redesign spec. Replaces them
with: a personalized header (real logged-in user, no more hardcoded
"Alex Watson"), 4 real quick actions (new order, open KDS, view menu,
copy the public ordering link), today's snapshot (revenue/orders/avg
order value + channel breakdown), a kitchen backlog counter, and a
low-stock alert list sourced from the same Menu data the Menu feature
itself uses.
EOF
)"
```

---

### Task 4: Analytics' data layer — types, constants, service

**Files:**
- Modify: `src/types/analytics.ts`
- Modify: `src/features/analytics/constants/analytics.constants.ts`
- Modify: `src/features/analytics/services/analytics.service.ts`

**Interfaces:**
- Consumes: `ordersService.getOrders(): Promise<Order[]>`, `menuService.getMenuItems(): Promise<MenuItem[]>`.
- Produces: `analyticsService.getKPIs(): Promise<AnalyticsKPI[]>`, `.getRevenue(): Promise<RevenueData[]>`, `.getChannels(): Promise<ChannelData[]>`, `.getTopItems(): Promise<TopItem[]>`, `.getHeatmap(): Promise<HeatmapData[]>` — all 5 keep their existing names (consumed as-is by `useAnalytics.ts`, unchanged). `CHANNEL_COLORS: Record<OrderChannel, string>` replaces the old `ANALYTICS_COLORS`.
- Consumed by: Task 5 (`KPICard.tsx`, `Heatmap.tsx`, `TopItemsList.tsx`, `AnalyticsFeature.tsx`).

**Current state (read before editing):** All 5 service functions return hardcoded arrays keyed to a fictional "WhatsApp Orders / Web Storefront / POS/Walk-in" channel split and Unsplash stock-photo "top items" unrelated to the real Menu. `useAnalytics.ts` (`src/features/analytics/hooks/useAnalytics.ts`) just wraps each in its own `useQuery` — this task does not touch that file, its 5 query keys and `analyticsService.*` references stay valid unchanged.

- [ ] **Step 1: Rewrite `src/types/analytics.ts`**

```typescript
import type { ElementType } from "react";
import type { OrderChannel } from "@/types/orders";

export type AnalyticsKPI = {
  label: string;
  value: string;
  icon: ElementType;
};

export type RevenueData = {
  day: string;
  revenue: number;
};

export type ChannelData = {
  name: OrderChannel;
  value: number;
  color: string;
};

export type TopItem = {
  id: string;
  name: string;
  units: number;
  image: string;
};

export type HeatmapData = {
  label: string;
  intensity: number;
};
```

`trend`/`isPositive` are dropped from `AnalyticsKPI`, `trend` is dropped from `TopItem` (no real prior-period data to back either — see this plan's Architecture section), `TopItem.id` changes from `number` to `string` (real `MenuItem.id`s are strings), and `HeatmapData.time` is renamed to `label` (it's now a date, not a time-of-day slot).

- [ ] **Step 2: Rewrite `src/features/analytics/constants/analytics.constants.ts`**

```typescript
import type { OrderChannel } from "@/types/orders";

export const CHANNEL_COLORS: Record<OrderChannel, string> = {
  "Online": "#3b82f6",
  "Dine-in": "#10b981",
  "Phone": "#f59e0b",
};

export const REVENUE_CHART_CONFIG = {
  margin: { top: 0, right: 0, left: -20, bottom: 0 },
  xAxisTick: { fontSize: 12, fill: '#64748b' },
  yAxisTick: { fontSize: 12, fill: '#64748b', fontFamily: 'DM Mono' },
};
```

- [ ] **Step 3: Rewrite `src/features/analytics/services/analytics.service.ts`**

```typescript
import { DollarSign, BarChart3, Calculator, Percent } from "lucide-react";
import { ordersService } from "@/features/orders/services/orders.service";
import { menuService } from "@/features/menu/services/menu.service";
import { CHANNEL_COLORS } from "../constants/analytics.constants";
import type { AnalyticsKPI, RevenueData, ChannelData, TopItem, HeatmapData } from "@/types/analytics";
import type { Order, OrderChannel } from "@/types/orders";

const CHANNELS: OrderChannel[] = ["Online", "Dine-in", "Phone"];

function billable(orders: Order[]): Order[] {
    return orders.filter((o) => o.status !== "Cancelled");
}

export const analyticsService = {
    getKPIs: async (): Promise<AnalyticsKPI[]> => {
        const orders = await ordersService.getOrders();
        const billableOrders = billable(orders);
        const revenue = billableOrders.reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = billableOrders.length > 0 ? revenue / billableOrders.length : 0;
        const cancelledCount = orders.length - billableOrders.length;
        const cancellationRate = orders.length > 0 ? (cancelledCount / orders.length) * 100 : 0;

        return [
            { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, icon: DollarSign },
            { label: "Total Orders", value: String(orders.length), icon: BarChart3 },
            { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, icon: Calculator },
            { label: "Cancellation Rate", value: `${cancellationRate.toFixed(1)}%`, icon: Percent },
        ];
    },
    getRevenue: async (): Promise<RevenueData[]> => {
        const orders = await ordersService.getOrders();
        const byDate = new Map<string, number>();
        for (const order of billable(orders)) {
            byDate.set(order.createdAt, (byDate.get(order.createdAt) ?? 0) + order.total);
        }
        return Array.from(byDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, revenue]) => ({ day, revenue }));
    },
    getChannels: async (): Promise<ChannelData[]> => {
        const orders = await ordersService.getOrders();
        const total = orders.length;
        return CHANNELS.map((channel) => ({
            name: channel,
            value: total > 0 ? Math.round((orders.filter((o) => o.channel === channel).length / total) * 100) : 0,
            color: CHANNEL_COLORS[channel],
        }));
    },
    getTopItems: async (): Promise<TopItem[]> => {
        const [orders, menuItems] = await Promise.all([ordersService.getOrders(), menuService.getMenuItems()]);
        const unitsByMenuItemId = new Map<string, number>();
        for (const order of billable(orders)) {
            for (const line of order.items) {
                unitsByMenuItemId.set(line.menuItemId, (unitsByMenuItemId.get(line.menuItemId) ?? 0) + line.quantity);
            }
        }
        return Array.from(unitsByMenuItemId.entries())
            .map(([menuItemId, units]) => {
                const menuItem = menuItems.find((m) => m.id === menuItemId);
                return menuItem ? { id: menuItem.id, name: menuItem.name, image: menuItem.image, units } : null;
            })
            .filter((item): item is TopItem => item !== null)
            .sort((a, b) => b.units - a.units)
            .slice(0, 5);
    },
    getHeatmap: async (): Promise<HeatmapData[]> => {
        const orders = await ordersService.getOrders();
        const byDate = new Map<string, number>();
        for (const order of orders) {
            byDate.set(order.createdAt, (byDate.get(order.createdAt) ?? 0) + 1);
        }
        const maxCount = Math.max(1, ...byDate.values());
        return Array.from(byDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, count]) => ({ label, intensity: Math.round((count / maxCount) * 100) }));
    },
};
```

Order lines whose `menuItemId` doesn't match a real `MenuItem` (the mock `CreateOrderModal`-authored `CUSTOM-*` lines, and the fixture's `NM-SPARKLING-WATER` line) are naturally excluded from Top Items via the `menuItems.find(...)` → `null` → filtered-out step, rather than crashing or showing a blank name.

- [ ] **Step 4: Verify build**

Run: `yarn build`
Expected: fails here, expectedly — `KPICard.tsx`, `Heatmap.tsx`, `TopItemsList.tsx`, `AnalyticsFeature.tsx` still reference the dropped `trend`/`isPositive`/`time` fields and the old `number` `TopItem.id`. Confirm the errors are confined to `src/features/analytics/components/` (Task 5 fixes them).

- [ ] **Step 5: Commit**

```bash
git add src/types/analytics.ts src/features/analytics/constants/analytics.constants.ts src/features/analytics/services/analytics.service.ts
git commit -m "$(cat <<'EOF'
feat(analytics): repoint data layer onto real orders/menu data

KPIs, revenue-over-time, channel split, and top items now compute from
ordersService/menuService instead of a fictional "WhatsApp/Web/POS"
channel split and stock-photo top items unrelated to the real Menu.
Fabricated trend/isPositive percentages are dropped — no prior period
exists in the mock dataset to compare against. Components in the next
commit catch up to this new shape.
EOF
)"
```

---

### Task 5: Analytics' components — KPI card, heatmap, top items, headings

**Files:**
- Modify: `src/features/analytics/components/KPICard.tsx`
- Modify: `src/features/analytics/components/Heatmap.tsx`
- Modify: `src/features/analytics/components/TopItemsList.tsx`
- Modify: `src/features/analytics/components/AnalyticsFeature.tsx`
- Delete: `src/features/analytics/components/PeakOrderHeatmap.tsx`
- Delete: `src/features/analytics/components/SalesByChannel.tsx`

**Interfaces:**
- Consumes: `AnalyticsKPI`, `HeatmapData`, `TopItem` (Task 4).
- Produces: nothing consumed elsewhere — `AnalyticsFeature` is the feature's top-level export, already re-exported unchanged by `src/features/analytics/index.ts`.

**Current state (read before editing):** `PeakOrderHeatmap.tsx` and `SalesByChannel.tsx` are dead code — grep confirms neither is imported anywhere; `AnalyticsFeature.tsx` actually renders `Heatmap.tsx` and `ChannelChart.tsx` instead. `KPICard.tsx` renders a `Badge` with `data.trend`/`data.isPositive`. `AnalyticsFeature.tsx` maintains a local `kpiIcons` lookup keyed by KPI label to re-attach an icon the service already attaches directly (`analyticsService.getKPIs()` returns `icon` per entry) — that indirection is removed now that the label set is changing anyway (Cancellation Rate stays, "Avg Delivery Time" becomes "Avg Order Value").

- [ ] **Step 1: Rewrite `KPICard.tsx`**

```tsx
import type { AnalyticsKPI } from "@/types/analytics";

interface KPICardProps {
    data: AnalyticsKPI;
}

export const KPICard = ({ data }: KPICardProps) => {
    const Icon = data.icon;

    return (
        <div className="bg-white p-5 rounded-[8px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-[8px] bg-slate-50 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{data.label}</p>
                <p className="text-2xl font-semibold text-slate-900 font-mono">{data.value}</p>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Rewrite `Heatmap.tsx`**

```tsx
import type { HeatmapData } from "@/types/analytics";

interface HeatmapProps {
    data: HeatmapData[];
}

export const Heatmap = ({ data }: HeatmapProps) => {
    return (
        <div className="flex-1 flex flex-col justify-end gap-3 pb-2">
            {data.map((slot) => (
                <div key={slot.label} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-mono text-slate-500">{slot.label}</span>
                    <div className="flex-1 h-8 bg-slate-50 rounded-[4px] overflow-hidden">
                        <div
                            className="h-full bg-slate-900 transition-all rounded-[4px]"
                            style={{ width: `${slot.intensity}%`, opacity: slot.intensity / 100 }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
```

- [ ] **Step 3: Rewrite `TopItemsList.tsx`**

```tsx
import { ExternalLink } from "lucide-react";
import type { TopItem } from "@/types/analytics";

interface TopItemsListProps {
    items: TopItem[];
}

export const TopItemsList = ({ items }: TopItemsListProps) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900">Top Items</h3>
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
            {items.length === 0 ? (
                <p className="text-sm text-slate-400">No item sales recorded yet.</p>
            ) : (
                items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 -mx-2 hover:bg-slate-50 rounded-[8px] transition-colors">
                        <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{idx + 1}. {item.name}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{item.units} unit{item.units !== 1 ? "s" : ""} sold</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
```

- [ ] **Step 4: Update `AnalyticsFeature.tsx`**

```tsx
import { useAnalytics } from "../hooks/useAnalytics";
import { KPICard } from "./KPICard";
import { RevenueChart } from "./RevenueChart";
import { ChannelChart } from "./ChannelChart";
import { Heatmap } from "./Heatmap";
import { TopItemsList } from "./TopItemsList";
import { AnalyticsHeader } from "./AnalyticsHeader";

export const AnalyticsFeature = () => {
    const { kpis, revenue, channels, topItems, heatmap } = useAnalytics();

    return (
        <div className="min-h-full relative pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                opacity: 0.03
            }} />


            <div className="relative px-8 pt-8 max-w-[1400px] mx-auto z-10">
                <AnalyticsHeader />

            <div className="grid grid-cols-4 gap-4 mb-6">
                {kpis.data?.map((kpi, idx) => (
                    <KPICard key={idx} data={kpi} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Revenue over Time</h3>
                        <p className="text-sm text-slate-500">Daily revenue breakdown for the recorded period.</p>
                    </div>
                    {revenue.data && <RevenueChart data={revenue.data} />}
                </div>

                <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Order Volume by Day</h3>
                        <p className="text-sm text-slate-500">Order count intensity across the recorded period.</p>
                    </div>
                    {heatmap.data && <Heatmap data={heatmap.data} />}
                </div>

                <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
                    {topItems.data && <TopItemsList items={topItems.data} />}
                </div>

                <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Sales by Channel</h3>
                        <p className="text-sm text-slate-500">Order share by origin.</p>
                    </div>
                    {channels.data && <ChannelChart data={channels.data} />}
                </div>
            </div>
            </div>
        </div>
    );
};
```

(The heading text changes from "Peak Order Heatmap"/"Order volume intensity by time" to "Order Volume by Day"/"...across the recorded period" — matching what the chart now actually shows. The unused `kpiIcons` map, and its `BarChart3`/`DollarSign`/`Clock`/`Percent` icon imports, are dropped since `analyticsService.getKPIs()` already attaches the right icon per entry.)

- [ ] **Step 5: Delete the dead components**

```bash
git rm src/features/analytics/components/PeakOrderHeatmap.tsx src/features/analytics/components/SalesByChannel.tsx
```

- [ ] **Step 6: Verify build**

Run: `yarn build`
Expected: clean. Also run `yarn lint` — expected clean.

- [ ] **Step 7: Commit**

```bash
git add src/features/analytics/components/KPICard.tsx src/features/analytics/components/Heatmap.tsx src/features/analytics/components/TopItemsList.tsx src/features/analytics/components/AnalyticsFeature.tsx
git commit -m "$(cat <<'EOF'
feat(analytics): update components for the real-data shape, drop dead files

KPICard/TopItemsList drop the fabricated trend badges (Task 4 removed the
fields backing them). Heatmap is relabeled from a peak-hours view to a
peak-day view to match what real Order.createdAt (date-only) can back.
Also deletes PeakOrderHeatmap.tsx/SalesByChannel.tsx — unused duplicates
of Heatmap.tsx/ChannelChart.tsx, confirmed unreferenced anywhere.
EOF
)"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run: `yarn build`
Expected: `tsc -b && vite build` clean, zero errors.

- [ ] **Step 2: Lint**

Run: `yarn lint`
Expected: clean.

- [ ] **Step 3: Confirm zero stray references to removed fields/files**

```bash
grep -rn "ChatAssistant\|useChatAssistant\|StatsOverview\|PeakOrderHeatmap\|SalesByChannel" src
grep -rn "isPositive\b" src/features/analytics src/types/analytics.ts
```

Expected: no output from either command.

- [ ] **Step 4: Browser-verify**

Dispatch the `ui-behavior-verifier` agent (per this repo's `verify-ui` skill) once, at the end, to confirm — not discover — the following against the running app (`yarn dev`, synthetic-JWT login is sufficient since everything here is mock data, no real backend involved):
- `/home` renders the new dashboard: header shows the real logged-in user's name (not "Alex Watson"), 4 quick-action cards work (New Order/Open Kitchen Display/View Menu navigate; Copy Ordering Link copies `<origin>/storefront` to the clipboard and shows "Copied!" feedback), Today's Snapshot shows non-zero revenue/order-count/avg-order-value with a channel breakdown, Kitchen Backlog shows a count matching the number of `New`/`Preparing` orders visible on `/orders`, Low-Stock Alerts lists exactly the menu items that show a "Low stock" badge on `/menu` (`m5` and no others, given today's fixture) and its "Manage Menu" button navigates to `/menu`.
- `/analytics` renders without console errors: 4 KPI cards (Total Revenue, Total Orders, Avg Order Value, Cancellation Rate — no "Avg Delivery Time"), a revenue chart, a "Sales by Channel" pie chart with 3 slices (Online/Dine-in/Phone) that sum to ~100%, a "Top Items" list showing real Menu item names/images (not stock photos), and an "Order Volume by Day" panel with one bar per distinct order date in the fixture.

- [ ] **Step 5: Report**

Summarize what changed, the browser-verification result, and update `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md`'s Phase status table (mark Phase 6 ✅ Done with commit range) and its "What's next" section (Phase 6 is the last planned phase before the explicitly-blocked Payment/WhatsApp work — say so plainly, don't invent a Phase 7).
