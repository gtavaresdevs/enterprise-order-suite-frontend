# Restaurant Ops Redesign — Phase 1: Menu & Tables Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the two new feature modules the redesign spec calls for — `features/menu` (canonical `MenuItem` CRUD) and `features/tables` (Table list + QR code generation/download) — each following this repo's standard feature-module shape, wired into routing and navigation.

**Architecture:** Both features follow the `scaffold-feature` skill's fixed shape (`components/hooks/services/constants/index.ts`) and the existing `inventory` feature's CRUD pattern (TanStack Query `useQuery`+`useMutation` hook, a service with an in-memory mutable mock store so create/update/delete actually persist across refetches — unlike `inventory`'s current mock, which silently drops created items on refetch; this plan does not fix that in `inventory`, only avoids repeating it in `menu`/`tables`). `features/menu`'s new canonical `MENU_ITEMS` fixture reuses the exact `m1`–`m8` ids already referenced by `src/features/orders/services/orders.service.ts` (fixed in Phase 0) — those ids must not change. `features/tables` adds a new npm dependency (`qrcode.react`) since none exists yet.

**Tech Stack:** React 19.2.5 + TypeScript ~6.0.2 + Vite 8.0.10, TanStack React Query 5.100.9, Tailwind (inline classes), lucide-react 1.14.0, Radix-based `components/ui/*` primitives (Input, Label, Button, Textarea, Switch already exist and are reused, not recreated).

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` — this plan implements the "New `features/menu`" and "New `features/tables`" sections. `src/types/menu.ts` (`MenuItem`/`SizeOption`/`AddonOption`) and `src/types/tables.ts` (`Table`) already exist from Phase 0 — this plan does not touch either type file.

## Global Constraints

- Every feature follows `features/<name>/{components,hooks,services,constants,index.ts}` — a component never imports `services/` or `constants/` directly, only through its feature's hook.
- `index.ts` re-exports ONLY the top-level Feature component (matching `inventory/index.ts`'s exact style: `export { XFeature } from "./components/XFeature";`).
- `@/*` path alias for all imports — never relative `../../`.
- New/rebuilt mock fixtures are shaped like the eventual real DTO now, even where the backend doesn't support the field yet (per this repo's CLAUDE.md).
- **`features/menu`'s canonical item ids `m1`–`m8` MUST exactly match the dish-to-id mapping already baked into `src/features/orders/services/orders.service.ts` by Phase 0's final-review fix** (Double Smash Burger→`m1`, Crispy Chicken Sandwich→`m2`, Margherita Pizza 12"→`m3`, Caesar Salad→`m4`, Truffle Loaded Fries→`m5`, Strawberry Milkshake→`m6`, Caramel Latte→`m7`, Chocolate Brownie→`m8`). Breaking this reintroduces the referential-integrity bug Phase 0 just fixed.
- This plan does **NOT** retarget `storefront`'s `MENU` or `inventory`'s `MOCK_PRODUCTS` to read from the new `features/menu` — those still exist as separate duplicate fixtures after this plan. Consolidating them onto the canonical `features/menu` service is explicitly later-phase work per the spec's per-feature section; scoping it in here would make this plan un-shippable on its own.
- No new state-management library beyond TanStack Query (already the standard here).
- Before calling a task done: `yarn build` (`tsc -b && vite build`) clean. No test suite exists in this repo — build + lint are the only automated safety net.

---

## Task 1: Scaffold `features/menu`

**Files:**
- Create: `src/features/menu/constants/menu.constants.ts`
- Create: `src/features/menu/services/menu.service.ts`
- Create: `src/features/menu/hooks/useMenu.ts`
- Create: `src/features/menu/components/MenuItemCard.tsx`
- Create: `src/features/menu/components/MenuItemModal.tsx`
- Create: `src/features/menu/components/MenuFeature.tsx`
- Create: `src/features/menu/index.ts`
- Create: `src/pages/Menu.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/layouts/app-layout/navigation.ts`

**Interfaces:**
- Consumes: `MenuItem`, `SizeOption`, `AddonOption` from `@/types/menu` (Phase 0, already exists — do not redefine).
- Produces: `MenuFeature` component (re-exported from `src/features/menu/index.ts`), consumed by `src/pages/Menu.tsx`. `useMenu()` hook returns `{ menuItems, isLoading, isError, createMenuItem, isCreating, updateMenuItem, isUpdating, deleteMenuItem, isDeleting }` — later phases (storefront/inventory retarget, KDS) will call this same hook/service, so keep these exact names.

- [ ] **Step 1: Create `src/features/menu/constants/menu.constants.ts`**

This is the canonical, single-source menu fixture — 9 dishes, consolidating what `storefront`'s `MENU` (8 items, richer `sizes`/`addons`) and `inventory`'s `MOCK_PRODUCTS` (9 items, includes "Spicy Chicken Wings" not present in storefront, more varied `stockQuantity` values) each separately model today. `stockQuantity` values are taken from `inventory`'s fixture (more varied — useful for the future low-stock alert feature); `description`/`image`/`sizes`/`addons` are taken from `storefront`'s fixture (richer). Ids `m1`–`m8` are **exactly** the ids `orders.service.ts` already references — do not renumber them.

```ts
import type { MenuItem } from "@/types/menu";

export const CATEGORIES = ["All", "Burgers", "Chicken", "Pizza", "Salads", "Sides", "Drinks", "Desserts"];

export const MENU_ITEMS: MenuItem[] = [
    {
        id: "m1", name: "Double Smash Burger", price: 14.99, category: "Burgers", stockQuantity: 18, available: true,
        description: "Two smashed beef patties, cheddar, pickles, shredded lettuce, house sauce on a brioche bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Regular (6oz)", price: 0 }, { id: "s2", label: "Double Patty (10oz)", price: 4.00 }],
        addons: [{ id: "a1", label: "Extra Bacon", price: 2.00 }, { id: "a2", label: "Extra Cheese", price: 1.50 }, { id: "a3", label: "Avocado", price: 1.50 }, { id: "a4", label: "Truffle Mayo", price: 1.00 }],
    },
    {
        id: "m2", name: "Crispy Chicken Sandwich", price: 13.49, category: "Chicken", stockQuantity: 22, available: true,
        description: "Double-fried chicken thigh, spicy mayo, coleslaw, pickled jalapeños on a toasted potato roll.",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Classic", price: 0 }, { id: "s2", label: "Spicy +1 Level", price: 0.50 }],
        addons: [{ id: "a1", label: "Add Avocado", price: 1.50 }, { id: "a2", label: "BBQ Sauce", price: 0.50 }],
    },
    {
        id: "m3", name: "Margherita Pizza 12\"", price: 18.99, category: "Pizza", stockQuantity: 9, available: true,
        description: "San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil on a hand-tossed crust.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "10\" Personal", price: -3.00 }, { id: "s2", label: "12\" Standard", price: 0 }, { id: "s3", label: "16\" Large", price: 6.00 }],
        addons: [{ id: "a1", label: "Extra Cheese", price: 2.00 }, { id: "a2", label: "Truffle Oil", price: 2.50 }, { id: "a3", label: "Pepperoni", price: 2.50 }],
    },
    {
        id: "m4", name: "Caesar Salad", price: 11.99, category: "Salads", stockQuantity: 25, available: true,
        description: "Romaine hearts, house-made Caesar dressing, Parmigiano-Reggiano, anchovy croutons.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Grilled Chicken", price: 4.00 }, { id: "a2", label: "Jumbo Shrimp", price: 5.50 }],
    },
    {
        id: "m5", name: "Truffle Loaded Fries", price: 10.99, category: "Sides", stockQuantity: 4, available: true,
        description: "Hand-cut fries, truffle oil, aged Parmesan, fresh herbs, garlic aioli dipping sauce.",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Truffle Oil", price: 1.50 }, { id: "a2", label: "Bacon Crumbles", price: 1.50 }],
    },
    {
        id: "m6", name: "Strawberry Milkshake", price: 7.49, category: "Drinks", stockQuantity: 30, available: true,
        description: "House-churned vanilla ice cream blended with fresh strawberry compote, topped with whipped cream.",
        image: "https://images.unsplash.com/photo-1541658016709-82763f21784a?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Regular (16oz)", price: 0 }, { id: "s2", label: "Large (24oz)", price: 2.00 }],
        addons: [{ id: "a1", label: "Extra Scoop", price: 1.50 }],
    },
    {
        id: "m7", name: "Caramel Latte", price: 5.99, category: "Drinks", stockQuantity: 28, available: true,
        description: "Double-shot espresso, steamed whole milk, house caramel drizzle, served hot or iced.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&auto=format",
        sizes: [{ id: "s1", label: "Hot", price: 0 }, { id: "s2", label: "Iced", price: 0.50 }],
        addons: [{ id: "a1", label: "Oat Milk", price: 0.80 }, { id: "a2", label: "Almond Milk", price: 0.80 }, { id: "a3", label: "Extra Shot", price: 1.00 }],
    },
    {
        id: "m8", name: "Chocolate Brownie", price: 6.49, category: "Desserts", stockQuantity: 12, available: true,
        description: "Warm fudge brownie, single-origin chocolate, salted caramel swirl, served with vanilla bean ice cream.",
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Ice Cream", price: 1.50 }, { id: "a2", label: "Hot Fudge Sauce", price: 0.75 }],
    },
    {
        id: "m9", name: "Spicy Chicken Wings", price: 15.99, category: "Chicken", stockQuantity: 0, available: false,
        description: "Crispy double-fried wings tossed in house buffalo or Korean gochujang glaze, 8 pieces.",
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop&auto=format",
        addons: [{ id: "a1", label: "Extra Sauce", price: 0.50 }, { id: "a2", label: "Ranch Dip", price: 0.75 }, { id: "a3", label: "Blue Cheese Dip", price: 0.75 }],
    },
];
```

- [ ] **Step 2: Create `src/features/menu/services/menu.service.ts`**

Uses a module-level mutable copy of the fixture so create/update/delete actually persist across TanStack Query refetches (fixing the silent-drop-on-refetch issue `inventory.service.ts`'s mock has today, without touching `inventory` itself).

```ts
import type { MenuItem } from "@/types/menu";
import { MENU_ITEMS } from "../constants/menu.constants";

let items: MenuItem[] = [...MENU_ITEMS];

export const menuService = {
    getMenuItems: async (): Promise<MenuItem[]> => {
        // TODO: connect-backend — GET /api/v1/menu-items
        return new Promise((resolve) => setTimeout(() => resolve([...items]), 300));
    },

    createMenuItem: async (item: Omit<MenuItem, "id">): Promise<MenuItem> => {
        // TODO: connect-backend — POST /api/v1/menu-items
        return new Promise((resolve) => {
            const newItem: MenuItem = { ...item, id: `m-${Math.random().toString(36).slice(2, 9)}` };
            items = [...items, newItem];
            setTimeout(() => resolve(newItem), 400);
        });
    },

    updateMenuItem: async (item: MenuItem): Promise<MenuItem> => {
        // TODO: connect-backend — PATCH /api/v1/menu-items/{id}
        return new Promise((resolve) => {
            items = items.map((i) => (i.id === item.id ? item : i));
            setTimeout(() => resolve(item), 300);
        });
    },

    deleteMenuItem: async (id: string): Promise<void> => {
        // TODO: connect-backend — DELETE /api/v1/menu-items/{id}
        return new Promise((resolve) => {
            items = items.filter((i) => i.id !== id);
            setTimeout(resolve, 300);
        });
    },
};
```

- [ ] **Step 3: Create `src/features/menu/hooks/useMenu.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../services/menu.service";

export const useMenu = () => {
    const queryClient = useQueryClient();

    const { data: menuItems = [], isLoading, isError } = useQuery({
        queryKey: ["menuItems"],
        queryFn: menuService.getMenuItems,
    });

    const createMutation = useMutation({
        mutationFn: menuService.createMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: menuService.updateMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: menuService.deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        },
    });

    return {
        menuItems,
        isLoading,
        isError,
        createMenuItem: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateMenuItem: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteMenuItem: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
```

- [ ] **Step 4: Create `src/features/menu/components/MenuItemCard.tsx`**

Adapted from `inventory/components/ProductCard.tsx`, adding a stock-quantity badge, a low-stock badge, and an availability `Switch` (86-toggle) — `inventory`'s card has neither today.

```tsx
import { Pencil, Trash2, SlidersHorizontal, Boxes } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
    onToggleAvailable: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailable }: MenuItemCardProps) {
    const hasAddons = item.addons && item.addons.length > 0;
    const formatPrice = (n: number) => `$${n.toFixed(2)}`;
    const lowStock = item.stockQuantity > 0 && item.stockQuantity <= 5;

    return (
        <div className={`group bg-white rounded-[8px] border overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-slate-900/8 hover:-translate-y-0.5 ${item.available ? "border-slate-100" : "border-slate-100 opacity-70"}`}>
            <div className="relative overflow-hidden bg-slate-100 h-44 flex-shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-slate-700 hover:bg-white shadow-md transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="w-8 h-8 rounded-[8px] bg-white/95 flex items-center justify-center text-red-500 hover:bg-white shadow-md transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                {!item.available && (
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm">
                        86'd
                    </div>
                )}
                {item.available && lowStock && (
                    <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm">
                        Low stock
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-[8px] backdrop-blur-sm border border-white/50">
                    {item.category}
                </div>
            </div>

            <div className="flex flex-col flex-1 p-4">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 font-outfit">
                        {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {item.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="font-mono text-base font-semibold text-slate-900">
                        {formatPrice(item.price)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {hasAddons && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-[8px]">
                                <SlidersHorizontal className="w-2.5 h-2.5" />
                                {item.addons!.length} addon{item.addons!.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-[8px]">
                            <Boxes className="w-2.5 h-2.5" />
                            {item.stockQuantity}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500">{item.available ? "Available" : "86'd"}</span>
                    <Switch checked={item.available} onCheckedChange={() => onToggleAvailable(item)} />
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 5: Create `src/features/menu/components/MenuItemModal.tsx`**

One modal for both create and edit — pass an `item` prop to edit, omit it to create. Adapted from `inventory/components/AddProductModal.tsx`, adding Stock Quantity and Availability fields and typing `onSubmit` properly (`Omit<MenuItem, "id">`, not `any` — `AddProductModal`'s untyped `onSubmit: (data: any)` is a pre-existing wart in `inventory`, not a pattern to repeat here).

```tsx
import { useState } from "react";
import { X, Package, Tag, DollarSign, Boxes } from "lucide-react";
import { CATEGORIES } from "../constants/menu.constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { MenuItem } from "@/types/menu";

interface MenuItemModalProps {
    item?: MenuItem;
    onClose: () => void;
    onSubmit: (data: Omit<MenuItem, "id">) => void;
    isSubmitting?: boolean;
}

export function MenuItemModal({ item, onClose, onSubmit, isSubmitting }: MenuItemModalProps) {
    const isEditing = item !== undefined;
    const [name, setName] = useState(item?.name ?? "");
    const [desc, setDesc] = useState(item?.description ?? "");
    const [price, setPrice] = useState(item ? String(item.price) : "");
    const [category, setCat] = useState(item?.category ?? CATEGORIES[1]);
    const [stockQuantity, setStockQuantity] = useState(item ? String(item.stockQuantity) : "0");
    const [available, setAvailable] = useState(item?.available ?? true);

    const handleSubmit = () => {
        onSubmit({
            name,
            description: desc,
            price: parseFloat(price) || 0,
            category,
            image: item?.image ?? "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format",
            stockQuantity: parseInt(stockQuantity) || 0,
            available,
            sizes: item?.sizes,
            addons: item?.addons,
        });
    };

    const inputCls = "rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10";

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>

                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">{isEditing ? "Edit Menu Item" : "Add Menu Item"}</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{isEditing ? "Update this item's listing." : "Add a new item to the menu."}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Photo</Label>
                            <div className="h-32 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all">
                                <Package className="w-6 h-6 text-slate-300" />
                                <p className="text-xs text-slate-400">Click to upload or drag & drop</p>
                                <p className="text-[10px] text-slate-300 font-mono">PNG, JPG · Recommended 4:3 ratio</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Item Name</Label>
                                <Input
                                    placeholder="e.g. Double Smash Burger"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Category</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <select
                                        className="w-full h-9 pl-8 pr-8 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all appearance-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCat(e.target.value)}
                                    >
                                        {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Price</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className={`pl-8 font-mono ${inputCls}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Stock Quantity</Label>
                                <div className="relative">
                                    <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        value={stockQuantity}
                                        onChange={(e) => setStockQuantity(e.target.value)}
                                        className={`pl-8 font-mono ${inputCls}`}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center justify-between rounded-[8px] border border-slate-200 bg-slate-50 px-3 h-9">
                                <span className="text-xs font-medium text-slate-600">Available for sale</span>
                                <Switch checked={available} onCheckedChange={setAvailable} />
                            </div>

                            <div className="col-span-2">
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Description</Label>
                                <Textarea
                                    rows={3}
                                    placeholder="Brief description of the item..."
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px]">
                        <Button variant="outline" onClick={onClose} className="rounded-[8px] h-9 border-slate-200 text-slate-600 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all"
                        >
                            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add to Menu"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 6: Create `src/features/menu/components/MenuFeature.tsx`**

Top-level composer — adapted from `inventory/components/InventoryFeature.tsx`, adding an edit-modal flow and routing the availability toggle through `updateMenuItem`.

```tsx
import { useState } from "react";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import { CATEGORIES } from "../constants/menu.constants";
import { useMenu } from "../hooks/useMenu";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemModal } from "./MenuItemModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/types/menu";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function MenuFeature() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCat] = useState("All");
    const [addOpen, setAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const { menuItems, isLoading, createMenuItem, isCreating, updateMenuItem, isUpdating, deleteMenuItem } = useMenu();

    const filtered = menuItems.filter((item) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q);
        const matchCat = activeCategory === "All" || item.category === activeCategory;
        return matchSearch && matchCat;
    });

    const availableCount = menuItems.filter((item) => item.available).length;
    const lowStockCount = menuItems.filter((item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= 5).length;

    return (
        <div className="min-h-full">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">Enterprise Order Suite</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 font-outfit">Menu</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            The single catalog served on the storefront, QR tables, and staff order entry.
                        </p>
                    </div>
                    <Button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all mt-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Menu Item
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Total Items", value: menuItems.length },
                        { label: "Available", value: availableCount },
                        { label: "Low Stock", value: lowStockCount },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-[8px] border border-slate-100 px-4 py-3.5 flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide font-mono">{label}</p>
                            <p className="text-xl font-semibold text-slate-900 font-mono">
                                {isLoading ? "-" : value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="sticky top-4 z-30 mb-6">
                    <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[8px] px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search menu items by name, category, or description..."
                                className="h-9 pl-9 pr-4 rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10"
                            />
                        </div>
                        <div className="w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCat(c)}
                                    className={`flex-shrink-0 h-7 px-3 rounded-[8px] text-xs font-medium transition-all ${activeCategory === c
                                            ? "bg-slate-950 text-slate-50 border border-slate-800 shadow-inner"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <p className="text-sm text-slate-400 font-mono animate-pulse">Loading menu...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <UtensilsCrossed className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">No menu items match your search.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-slate-400 font-mono mb-4">
                            {filtered.length} item{filtered.length !== 1 ? "s" : ""} shown
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {filtered.map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    onEdit={(item) => setEditingItem(item)}
                                    onDelete={(id) => deleteMenuItem(id)}
                                    onToggleAvailable={(item) => updateMenuItem({ ...item, available: !item.available })}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {addOpen && (
                <MenuItemModal
                    onClose={() => setAddOpen(false)}
                    onSubmit={(data) => {
                        createMenuItem(data);
                        setAddOpen(false);
                    }}
                    isSubmitting={isCreating}
                />
            )}

            {editingItem && (
                <MenuItemModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSubmit={(data) => {
                        updateMenuItem({ ...data, id: editingItem.id });
                        setEditingItem(null);
                    }}
                    isSubmitting={isUpdating}
                />
            )}
        </div>
    );
}
```

- [ ] **Step 7: Create `src/features/menu/index.ts`**

```ts
export { MenuFeature } from "./components/MenuFeature";
```

- [ ] **Step 8: Create `src/pages/Menu.tsx`**

```tsx
import { MenuFeature } from "@/features/menu";

export default function MenuPage() {
    return <MenuFeature />;
}
```

- [ ] **Step 9: Wire the route in `src/app/router.tsx`**

Add the import alongside the other Protected Pages imports (after `InventoryPage`):

```tsx
import InventoryPage from '@/pages/Inventory';
import MenuPage from '@/pages/Menu';
```

Add the route entry alongside the other `AppLayout` children (immediately after the `/inventory` entry):

```tsx
          {
            path: '/inventory',
            element: <InventoryPage />,
          },
          {
            path: '/menu',
            element: <MenuPage />,
          },
```

- [ ] **Step 10: Wire the nav entry in `src/layouts/app-layout/navigation.ts`**

Add `UtensilsCrossed` to the `lucide-react` import list and a `NAVIGATION_ITEMS` entry after `/inventory`:

```ts
import {
  Home,
  ShoppingCart,
  Package,
  UtensilsCrossed,
  BarChart3,
  Shield,
  Users,
  UserCog,
  KeySquare,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  roles?: Role[];
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: Home, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/inventory", label: "Inventory", icon: Package, end: false },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
];

export const ADMINISTRATION_ITEMS: NavItem[] = [
  {
    label: "Administration",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      { to: "/administration/users", label: "Users", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
      { to: "/administration/administrators", label: "Administrators", icon: UserCog, roles: ["SUPER_ADMIN"] },
      { to: "/administration/roles", label: "Roles & Permissions", icon: KeySquare, roles: ["SUPER_ADMIN"] },
    ],
  },
];
```

- [ ] **Step 11: Verify**

Run: `grep -rn "from \"@/types/inventory\"\|from '@/types/inventory'" src/features/menu`
Expected: no matches (menu never imports the deleted inventory type).

Run: `yarn build`
Expected: exits 0.

- [ ] **Step 12: Commit**

```bash
git add src/features/menu src/pages/Menu.tsx src/app/router.tsx src/layouts/app-layout/navigation.ts
git commit -m "feat(menu): scaffold canonical MenuItem CRUD feature"
```

---

## Task 2: Add `qrcode.react` and scaffold `features/tables`

**Files:**
- Modify: `package.json` / `yarn.lock` (via `yarn add qrcode.react`)
- Create: `src/features/tables/constants/tables.constants.ts`
- Create: `src/features/tables/services/tables.service.ts`
- Create: `src/features/tables/hooks/useTables.ts`
- Create: `src/features/tables/components/TableCard.tsx`
- Create: `src/features/tables/components/AddTableModal.tsx`
- Create: `src/features/tables/components/TablesFeature.tsx`
- Create: `src/features/tables/index.ts`
- Create: `src/pages/Tables.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/layouts/app-layout/navigation.ts`

**Interfaces:**
- Consumes: `Table` from `@/types/tables` (Phase 0, already exists).
- Produces: `TablesFeature` component (re-exported from `src/features/tables/index.ts`), consumed by `src/pages/Tables.tsx`.

- [ ] **Step 1: Add the QR code dependency**

Run: `yarn add qrcode.react`

Expected: `package.json`'s `dependencies` gains a `qrcode.react` entry and `yarn.lock` updates. This library ships its own TypeScript types — no separate `@types/qrcode.react` package needed.

- [ ] **Step 2: Create `src/features/tables/constants/tables.constants.ts`**

`qrCodeUrl` stores the relative path the QR code should encode (per the spec: "generated, links to `/menu?table=<id>`") — the absolute origin is prefixed at render time in `TableCard`, not baked into the fixture.

```ts
import type { Table } from "@/types/tables";

export const TABLES: Table[] = [
    { id: "t1", name: "Table 1", qrCodeUrl: "/menu?table=t1" },
    { id: "t2", name: "Table 2", qrCodeUrl: "/menu?table=t2" },
    { id: "t3", name: "Table 3", qrCodeUrl: "/menu?table=t3" },
    { id: "t4", name: "Table 4", qrCodeUrl: "/menu?table=t4" },
    { id: "t5", name: "Patio 1", qrCodeUrl: "/menu?table=t5" },
];
```

- [ ] **Step 3: Create `src/features/tables/services/tables.service.ts`**

```ts
import type { Table } from "@/types/tables";
import { TABLES } from "../constants/tables.constants";

let tables: Table[] = [...TABLES];

export const tablesService = {
    getTables: async (): Promise<Table[]> => {
        // TODO: connect-backend — GET /api/v1/tables
        return new Promise((resolve) => setTimeout(() => resolve([...tables]), 300));
    },

    createTable: async (name: string): Promise<Table> => {
        // TODO: connect-backend — POST /api/v1/tables
        return new Promise((resolve) => {
            const id = `t-${Math.random().toString(36).slice(2, 9)}`;
            const newTable: Table = { id, name, qrCodeUrl: `/menu?table=${id}` };
            tables = [...tables, newTable];
            setTimeout(() => resolve(newTable), 400);
        });
    },

    deleteTable: async (id: string): Promise<void> => {
        // TODO: connect-backend — DELETE /api/v1/tables/{id}
        return new Promise((resolve) => {
            tables = tables.filter((t) => t.id !== id);
            setTimeout(resolve, 300);
        });
    },
};
```

- [ ] **Step 4: Create `src/features/tables/hooks/useTables.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesService } from "../services/tables.service";

export const useTables = () => {
    const queryClient = useQueryClient();

    const { data: tables = [], isLoading, isError } = useQuery({
        queryKey: ["tables"],
        queryFn: tablesService.getTables,
    });

    const createMutation = useMutation({
        mutationFn: tablesService.createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: tablesService.deleteTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
        },
    });

    return {
        tables,
        isLoading,
        isError,
        createTable: createMutation.mutate,
        isCreating: createMutation.isPending,
        deleteTable: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
```

- [ ] **Step 5: Create `src/features/tables/components/TableCard.tsx`**

Renders the QR code to a `<canvas>` via `qrcode.react`'s `QRCodeCanvas`, and downloads it as a PNG by reading that canvas's `toDataURL()` through a container `ref` (avoids depending on exactly how the library forwards its own ref across versions).

```tsx
import { useRef } from "react";
import { Download, Trash2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { Table } from "@/types/tables";

interface TableCardProps {
    table: Table;
    onDelete: (id: string) => void;
}

export function TableCard({ table, onDelete }: TableCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrValue = `${window.location.origin}${table.qrCodeUrl}`;

    const handleDownload = () => {
        const canvas = containerRef.current?.querySelector("canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `${table.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="group bg-white rounded-[8px] border border-slate-100 overflow-hidden flex flex-col items-center p-5 transition-all hover:shadow-lg hover:shadow-slate-900/8 hover:-translate-y-0.5">
            <div ref={containerRef} className="p-3 bg-white rounded-[8px] border border-slate-100">
                <QRCodeCanvas value={qrValue} size={140} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mt-4 font-outfit">{table.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-full">{qrValue}</p>
            <div className="flex items-center gap-2 mt-4 w-full">
                <button
                    onClick={handleDownload}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors"
                >
                    <Download className="w-3 h-3" /> Download
                </button>
                <button
                    onClick={() => onDelete(table.id)}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Step 6: Create `src/features/tables/components/AddTableModal.tsx`**

```tsx
import { useState } from "react";
import { X, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddTableModalProps {
    onClose: () => void;
    onSubmit: (name: string) => void;
    isSubmitting?: boolean;
}

export function AddTableModal({ onClose, onSubmit, isSubmitting }: AddTableModalProps) {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit(name.trim());
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">Add Table</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">Generates a QR code linking to the read-only menu view.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="px-6 py-5">
                        <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Table Name</Label>
                        <div className="relative">
                            <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="e.g. Table 6, Patio 3"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-8 rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px]">
                        <Button variant="outline" onClick={onClose} className="rounded-[8px] h-9 border-slate-200 text-slate-600 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name.trim()}
                            className="rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all"
                        >
                            {isSubmitting ? "Adding..." : "Add Table"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 7: Create `src/features/tables/components/TablesFeature.tsx`**

```tsx
import { useState } from "react";
import { Plus, QrCode } from "lucide-react";
import { useTables } from "../hooks/useTables";
import { TableCard } from "./TableCard";
import { AddTableModal } from "./AddTableModal";
import { Button } from "@/components/ui/button";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function TablesFeature() {
    const [addOpen, setAddOpen] = useState(false);
    const { tables, isLoading, createTable, isCreating, deleteTable } = useTables();

    return (
        <div className="min-h-full">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <QrCode className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">Enterprise Order Suite</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 font-outfit">Tables</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Print-and-place QR codes linking each table to the read-only menu view.
                        </p>
                    </div>
                    <Button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all mt-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Table
                    </Button>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <p className="text-sm text-slate-400 font-mono animate-pulse">Loading tables...</p>
                    </div>
                ) : tables.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <QrCode className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">No tables yet. Add one to generate its QR code.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {tables.map((table) => (
                            <TableCard key={table.id} table={table} onDelete={(id) => deleteTable(id)} />
                        ))}
                    </div>
                )}
            </div>

            {addOpen && (
                <AddTableModal
                    onClose={() => setAddOpen(false)}
                    onSubmit={(name) => {
                        createTable(name);
                        setAddOpen(false);
                    }}
                    isSubmitting={isCreating}
                />
            )}
        </div>
    );
}
```

- [ ] **Step 8: Create `src/features/tables/index.ts`**

```ts
export { TablesFeature } from "./components/TablesFeature";
```

- [ ] **Step 9: Create `src/pages/Tables.tsx`**

```tsx
import { TablesFeature } from "@/features/tables";

export default function TablesPage() {
    return <TablesFeature />;
}
```

- [ ] **Step 10: Wire the route in `src/app/router.tsx`**

Add the import alongside `MenuPage` (Task 1, Step 9):

```tsx
import MenuPage from '@/pages/Menu';
import TablesPage from '@/pages/Tables';
```

Add the route entry immediately after the `/menu` entry from Task 1:

```tsx
          {
            path: '/menu',
            element: <MenuPage />,
          },
          {
            path: '/tables',
            element: <TablesPage />,
          },
```

- [ ] **Step 11: Wire the nav entry in `src/layouts/app-layout/navigation.ts`**

Add `QrCode` to the `lucide-react` import list and a `NAVIGATION_ITEMS` entry after `/menu` (from Task 1, Step 10):

```ts
import {
  Home,
  ShoppingCart,
  Package,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Shield,
  Users,
  UserCog,
  KeySquare,
  type LucideIcon
} from "lucide-react";
```

```ts
export const NAVIGATION_ITEMS: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: Home, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/inventory", label: "Inventory", icon: Package, end: false },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed, end: false },
  { to: "/tables", label: "Tables", icon: QrCode, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
];
```

- [ ] **Step 12: Verify**

Run: `yarn build`
Expected: exits 0. Confirms `qrcode.react`'s bundled types resolve and the new feature compiles.

- [ ] **Step 13: Commit**

```bash
git add package.json yarn.lock src/features/tables src/pages/Tables.tsx src/app/router.tsx src/layouts/app-layout/navigation.ts
git commit -m "feat(tables): scaffold Table list with QR code generation and download"
```

---

## Task 3: Full-phase verification

**Files:** none (verification only)

- [ ] **Step 1: Re-grep for scope leaks**

Run: `grep -rn "from \"@/types/inventory\"\|from '@/types/inventory'" src/features/menu src/features/tables`
Expected: no matches.

Run: `grep -c "MENU_ITEMS\|MOCK_PRODUCTS" src/features/storefront/constants/storefront.constants.ts src/features/inventory/constants/inventory.constants.ts`
Expected: both still exist unchanged (confirms this plan correctly left the storefront/inventory fixtures alone — consolidating onto `features/menu` is later-phase work, not a Phase 1 regression).

- [ ] **Step 2: Full lint + build**

Run: `yarn lint`
Expected: no NEW errors in `src/features/menu/**`, `src/features/tables/**`, `src/pages/Menu.tsx`, `src/pages/Tables.tsx`, or the two modified files (`router.tsx`, `navigation.ts`). Pre-existing errors elsewhere in the repo (already present before this phase) are out of scope — compare against a `yarn lint` run on the pre-Phase-1 commit if unsure whether a given error is new.

Run: `yarn build`
Expected: exits 0.

- [ ] **Step 3: Browser smoke check**

Unlike Phase 0 (a pure type migration with no new interactive surfaces), this phase adds genuinely new UI flows — an add/edit modal and a QR-code download button — that are worth an actual click-through rather than reasoning from source alone. Use the `verify-ui` skill with the test credentials in the `order-ui-test-login` memory to check, on `/menu`: the item grid renders with stock/addon badges, "Add Menu Item" opens the modal and a submitted item appears in the grid, clicking an existing card's edit button opens the modal pre-filled, and the availability `Switch` toggles the "86'd" badge. On `/tables`: the table grid renders visible QR codes, "Add Table" creates a new card with its own QR code, and the Download button triggers a file save. Report any behavior that doesn't match — fix and re-verify only the specific broken flow, not a full re-run.

- [ ] **Step 4: Final commit if Step 3 found issues**

Only if Step 3 required code changes:

```bash
git add -A
git commit -m "fix: address smoke-test findings from Phase 1 menu/tables scaffold"
```
