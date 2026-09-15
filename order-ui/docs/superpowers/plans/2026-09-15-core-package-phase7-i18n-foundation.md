# Core Package Phase 7 — i18n Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled `src/i18n/translations.ts`/`useTranslation()` (2 files, FR/ES, stale labels) and the cosmetic 8-language `preferences.language` list with a real `react-i18next` setup covering EN/PT-BR across every Core feature, with runtime (no-reload) language switching and BR-correct currency/date formatting.

**Architecture:** `react-i18next` + `i18next` initialized once in `src/i18n/config.ts`, imported at app bootstrap. Locale strings live under `src/i18n/locales/{en,pt-BR}/<namespace>.json`, one namespace per feature module (mirrors `src/features/<feature>/` folder names) plus a shared `common.json` for nav/buttons/generic labels. `PreferencesProvider` gains a `useEffect` on `preferences.language` that calls `i18n.changeLanguage(...)`, replacing the current no-op. Components call `useTranslation(namespace)` from `react-i18next` and render `t('key')` instead of literal strings — the exact same call-site pattern already used by the old `useTranslation()` hook, so the migration is a drop-in swap per file, not a new pattern.

**Tech Stack:** `react-i18next`, `i18next` (no `i18next-browser-languagedetector` — detection logic is 3 lines and is spec'd as custom: `navigator.language` startswith `en` → English, else pt-BR, saved preference always wins). TanStack Query / existing `preferences` localStorage persistence unchanged.

**Spec:** `docs/superpowers/specs/2026-09-15-core-package-br-i18n-ux-design.md` (see "i18n architecture" and "Formatting" sections — read both before starting any task).

## Global Constraints

- Two locales only: `en` (canonical/fallback) and `pt-BR`. No other language.
- Keys are semantic (`orders.status.preparing`), never literal English (`"Preparing"`).
- Presentation-boundary only: never translate `OrderStatus`/enum values, permission identifiers, route paths, or anything in a domain model — only the rendered label mapped *from* a stable value.
- A missing PT-BR key must render the English fallback string, never blank or a raw key (`i18next` default fallback behavior — do not disable it).
- No new state-management library; `preferences.language` (localStorage) remains the single source of truth for the active locale, `i18next` just consumes it.
- `@/*` path alias only, never relative `../../` imports.
- No test suite exists — `yarn build` (`tsc -b && vite build`) and `yarn lint` (`eslint .`) are the safety net for every task.
- Terminology from the spec's "Terminology is product vocabulary" list (Cardápio, Pedido, Comanda, Mesa, Garçom, Cozinha, Conta, Gorjeta, Para viagem, Caixa, Painel, Relatório, Estoque, Fornecedor) must be used consistently in every PT-BR value that names these concepts — do not invent per-feature synonyms.
- Commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare `git commit -m "..."` (this repo has unrelated pre-existing staged work that must not be swept in).
- Don't touch `MenuItem` ids `m1`-`m9`, `Order`/`Table`/`MenuItem` shapes, or any enum value — this phase is strings-only.

---

## File inventory (current state, confirmed by codebase read)

- `src/i18n/translations.ts` — `SupportedLocale = "fr-FR" | "es-ES"`, 15-key dict, **delete in Task 2**.
- `src/features/preferences/hooks/useTranslation.ts` — consumed only by `Sidebar.tsx` and `AvatarDropdown.tsx`, **delete in Task 2**.
- `src/features/preferences/constants/preferences.constants.ts` — `LANGUAGES` (8 entries, collapses to 2), `CURRENCIES` (6, no BRL), `DATE_FORMATS` (4, unchanged).
- `src/features/preferences/hooks/useFormat.ts` — wraps `formatCurrency`/`formatDate`, unchanged signature, still reads `preferences.language`/`.currency`/`.dateFormat`/`.timezone`.
- `src/app/providers/PreferencesProvider.tsx` — has `useEffect`s for theme/fontSize/compactMode/denseTable/reducedMotion; **no effect for `language` today** — Task 3 adds one.
- `src/utils/format.ts` — `formatCurrency(value, currency, language)`, `formatDate(iso, dateFormat, timezone)`; add BRL to the language→locale map path and nothing else (locale/number formatting is free via `Intl.NumberFormat` once `pt-BR` flows through).
- `src/App.tsx` — `PreferencesProvider` wraps `RouterProvider` above the router split, so public routes (`/storefront`, `/table-menu`, `/kds`) and authenticated routes already share one instance — no App.tsx routing change needed, only the `i18n.init()` import.

Per-feature files needing string extraction (heaviest first, from inventory pass): `PreferencesFeature.tsx` (~34), `CreateOrderModal.tsx` (~43), `OrdersFeature.tsx` (~20), `StorefrontSection.tsx` (~10), `MenuItemModal.tsx` (~15), `UserDetailDrawer.tsx` (~12), `TeamFeature.tsx` (~8), `InviteUserModal.tsx` (~9), `AuditLogFeature.tsx` (~7), `TableMenuFeature.tsx` (~6), `AnalyticsFeature.tsx` (~6), `RolesFeature.tsx` (~4), and the remaining lighter files listed per task below. Zero-count files (`StatusBadge`, chart components, `Pagination`) are re-checked per task, not skipped by assumption — some map enum values to display labels via template literals that a grep pass can miss.

---

### Task 1: Install and initialize react-i18next

**Files:**
- Modify: `package.json` (add `react-i18next`, `i18next`)
- Create: `src/i18n/config.ts`
- Create: `src/i18n/locales/en/common.json`
- Create: `src/i18n/locales/pt-BR/common.json`
- Modify: `src/main.tsx` (import `./i18n/config` before `App` renders)

**Interfaces:**
- Produces: `i18n` default export from `src/i18n/config.ts` (the configured `i18next` instance), importable as `import i18n from "@/i18n/config"`. Every later task's `useTranslation()` calls resolve against this instance.
- Produces: namespace `"common"` with keys `common.loading`, `common.save`, `common.cancel`, `common.confirm`, `common.delete`, `common.edit`, `common.search`, `common.noResults` — the generic strings every later feature namespace will reuse instead of re-declaring.

- [ ] **Step 1: Install dependencies**

Run: `yarn add react-i18next i18next`

- [ ] **Step 2: Create the English common namespace**

`src/i18n/locales/en/common.json`:
```json
{
  "loading": "Loading...",
  "save": "Save",
  "cancel": "Cancel",
  "confirm": "Confirm",
  "delete": "Delete",
  "edit": "Edit",
  "search": "Search",
  "noResults": "No results found"
}
```

- [ ] **Step 3: Create the pt-BR common namespace**

`src/i18n/locales/pt-BR/common.json`:
```json
{
  "loading": "Carregando...",
  "save": "Salvar",
  "cancel": "Cancelar",
  "confirm": "Confirmar",
  "delete": "Excluir",
  "edit": "Editar",
  "search": "Buscar",
  "noResults": "Nenhum resultado encontrado"
}
```

- [ ] **Step 4: Write the i18next config**

`src/i18n/config.ts`:
```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import ptBrCommon from "./locales/pt-BR/common.json";

export const resources = {
  en: {
    common: enCommon,
  },
  "pt-BR": {
    common: ptBrCommon,
  },
} as const;

function detectDefaultLanguage(): "en" | "pt-BR" {
  const saved = window.localStorage.getItem("preferences");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { language?: string };
      if (parsed.language === "English") return "en";
      if (parsed.language === "Português (Brasil)") return "pt-BR";
    } catch {
      // fall through to navigator detection
    }
  }
  return navigator.language.startsWith("en") ? "en" : "pt-BR";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectDefaultLanguage(),
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

Note: `detectDefaultLanguage` reads the raw `"preferences"` localStorage key directly (not `usePreferences()`) because this file executes before any React provider mounts — it must not depend on React context. Task 3 changes `preferences.language`'s stored values to exactly `"English"` / `"Português (Brasil)"`, matching the strings checked here.

- [ ] **Step 5: Import the config at app bootstrap**

In `src/main.tsx`, add as the first import (before `App`):
```typescript
import "@/i18n/config";
```

- [ ] **Step 6: Verify the build**

Run: `yarn build`
Expected: no TypeScript/build errors. The app boots with i18next initialized but nothing consumes it yet — no visible change.

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock src/i18n/config.ts src/i18n/locales/en/common.json src/i18n/locales/pt-BR/common.json src/main.tsx
git commit -m "feat(i18n): install react-i18next and initialize config with common namespace" -- package.json yarn.lock src/i18n/config.ts src/i18n/locales/en/common.json src/i18n/locales/pt-BR/common.json src/main.tsx
```

---

### Task 2: Migrate app shell (Sidebar, AvatarDropdown) off the old translations.ts, delete it

**Files:**
- Read: `src/layouts/app-layout/Sidebar.tsx`, `src/layouts/app-layout/AvatarDropdown.tsx`, `src/layouts/app-layout/navigation.ts` (or wherever `ACCOUNT_NAV`/`NAVIGATION_ITEMS`/`ADMINISTRATION_ITEMS` are defined — confirm exact path before editing)
- Modify: `src/i18n/config.ts` (register a new `shell` namespace)
- Create: `src/i18n/locales/en/shell.json`
- Create: `src/i18n/locales/pt-BR/shell.json`
- Modify: `src/layouts/app-layout/Sidebar.tsx`
- Modify: `src/layouts/app-layout/AvatarDropdown.tsx`
- Delete: `src/i18n/translations.ts`
- Delete: `src/features/preferences/hooks/useTranslation.ts`

**Interfaces:**
- Consumes: `resources` shape and `i18n` instance from Task 1.
- Produces: namespace `"shell"` with keys for every nav item + account menu label, consumed only inside these two files (no other feature reads this namespace).

- [ ] **Step 1: Read the current nav item labels**

Read `Sidebar.tsx` and `AvatarDropdown.tsx` in full to list every string currently passed through the old `t()`. Per Phase 5's rename (confirmed in `RESTAURANT-OPS-ROADMAP.md`), current nav items are Dashboard, Orders, Analytics, Menu, Tables, Team, Roles, Audit Log, Administration, Notifications, Preferences, Settings — not the stale "Users"/"Administrators" the old dictionary still had. Use the real current labels read from source, not the stale dictionary, as the English values.

- [ ] **Step 2: Write the English shell namespace**

`src/i18n/locales/en/shell.json` (adjust exact key list to match every label actually found in Step 1 — this is the minimum set):
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "orders": "Orders",
    "analytics": "Analytics",
    "menu": "Menu",
    "tables": "Tables",
    "administration": "Administration",
    "team": "Team",
    "roles": "Roles",
    "auditLog": "Audit Log",
    "notifications": "Notifications",
    "preferences": "Preferences",
    "settings": "Settings"
  },
  "account": {
    "viewProfile": "View Profile",
    "signOut": "Sign out"
  }
}
```

- [ ] **Step 3: Write the pt-BR shell namespace**

`src/i18n/locales/pt-BR/shell.json`:
```json
{
  "nav": {
    "dashboard": "Painel",
    "orders": "Pedidos",
    "analytics": "Relatórios",
    "menu": "Cardápio",
    "tables": "Mesas",
    "administration": "Administração",
    "team": "Equipe",
    "roles": "Funções",
    "auditLog": "Registro de Auditoria",
    "notifications": "Notificações",
    "preferences": "Preferências",
    "settings": "Configurações"
  },
  "account": {
    "viewProfile": "Ver Perfil",
    "signOut": "Sair"
  }
}
```

- [ ] **Step 4: Register the namespace in config**

In `src/i18n/config.ts`, add the two new imports and extend `resources`:
```typescript
import enShell from "./locales/en/shell.json";
import ptBrShell from "./locales/pt-BR/shell.json";
```
Add `shell: enShell` to the `en` object and `shell: ptBrShell` to the `"pt-BR"` object.

- [ ] **Step 5: Migrate Sidebar.tsx**

Replace the old import:
```typescript
// before
import { useTranslation } from "@/features/preferences/hooks/useTranslation";
```
```typescript
// after
import { useTranslation } from "react-i18next";
```
Replace the hook call site (old hook likely called with no args or a locale arg) with:
```typescript
const { t } = useTranslation("shell");
```
Replace every nav-label lookup (e.g. old `t("Dashboard")` keyed by literal English) with the semantic key (`t("nav.dashboard")`), for every item enumerated in Step 1. If nav items are sourced from a `NAVIGATION_ITEMS` constants array rendered in a `.map()`, add a `labelKey: "nav.dashboard"` field to each array entry (in `navigation.ts`) instead of hardcoding per-item `t()` calls, and call `t(item.labelKey)` at render time — follow whatever pattern the array already uses for icons/routes.

- [ ] **Step 6: Migrate AvatarDropdown.tsx**

Same swap: `useTranslation` import source changes to `"react-i18next"`, hook call becomes `useTranslation("shell")`, `"View Profile"` → `t("account.viewProfile")`, `"Sign out"` → `t("account.signOut")`.

- [ ] **Step 7: Delete the old mechanism**

```bash
git rm src/i18n/translations.ts src/features/preferences/hooks/useTranslation.ts
```
Confirm no remaining import of either path: `grep -r "i18n/translations" src/` and `grep -r "hooks/useTranslation" src/` must both return empty (besides the new `react-i18next` import, which has a different specifier).

- [ ] **Step 8: Verify build and lint**

Run: `yarn build && yarn lint`
Expected: zero errors. Manually confirm in a dev run (`yarn dev`) that the sidebar and avatar dropdown render the same English labels as before.

- [ ] **Step 9: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/shell.json src/i18n/locales/pt-BR/shell.json src/layouts/app-layout/Sidebar.tsx src/layouts/app-layout/AvatarDropdown.tsx
git commit -m "feat(i18n): migrate Sidebar/AvatarDropdown to react-i18next, delete legacy translations.ts" -- src/i18n/config.ts src/i18n/locales/en/shell.json src/i18n/locales/pt-BR/shell.json src/layouts/app-layout/Sidebar.tsx src/layouts/app-layout/AvatarDropdown.tsx src/i18n/translations.ts src/features/preferences/hooks/useTranslation.ts
```

---

### Task 3: Collapse `preferences.language` to EN/PT-BR, wire runtime switching, add BRL + default date format

**Files:**
- Modify: `src/features/preferences/constants/preferences.constants.ts`
- Modify: `src/app/providers/PreferencesProvider.tsx`
- Modify: `src/utils/format.ts`
- Read (no change expected, confirm only): `src/features/preferences/hooks/useFormat.ts`, `src/features/preferences/components/PreferencesFeature.tsx`

**Interfaces:**
- Consumes: `i18n` default export from `src/i18n/config.ts` (Task 1).
- Produces: `LANGUAGES` narrowed to exactly `["English", "Português (Brasil)"]` (string values, matching `detectDefaultLanguage`'s comparison in Task 1 Step 4) — every later task assumes these two exact strings, not the old 8.
- Produces: `CURRENCIES` gains `"BRL — Real Brasileiro"` as an entry, in the same `"<CODE> — <Name>"` format as the existing 6.

- [ ] **Step 1: Collapse the LANGUAGES constant**

In `preferences.constants.ts`, replace the 8-entry `LANGUAGES` array with:
```typescript
export const LANGUAGES = ["English", "Português (Brasil)"];
```

- [ ] **Step 2: Add BRL to CURRENCIES**

Add `"BRL — Real Brasileiro"` to the existing `CURRENCIES` array (keep the 6 existing entries; this is additive).

- [ ] **Step 3: Update DEFAULT_PREFERENCES default detection**

In `PreferencesProvider.tsx`, find `DEFAULT_PREFERENCES` (currently `language: LANGUAGES[0]` i.e. hardcoded first option). Replace with a function that mirrors Task 1's `detectDefaultLanguage`:
```typescript
function getDefaultLanguage(): string {
  return navigator.language.startsWith("en") ? "English" : "Português (Brasil)";
}
```
Set `DEFAULT_PREFERENCES.language = getDefaultLanguage()`. Also default `dateFormat` based on the same check: if the resolved default language is `"Português (Brasil)"`, default `dateFormat` to `"DD/MM/YYYY"`; otherwise leave the existing default (`"MM/DD/YYYY"`). This only changes the *default* for first-time users with no saved preference — an existing saved `preferences.dateFormat` is never overwritten.

- [ ] **Step 4: Wire language changes to i18next at runtime**

In `PreferencesProvider.tsx`, alongside the existing `useEffect`s for `theme`/`fontSize`/etc., add:
```typescript
useEffect(() => {
  const target = preferences.language === "Português (Brasil)" ? "pt-BR" : "en";
  i18n.changeLanguage(target);
}, [preferences.language]);
```
Import `i18n` from `@/i18n/config` at the top of the file. This is the effect the spec requires for "changing `preferences.language` updates all mounted UI immediately through react-i18next, no reload/navigation" — confirm no other effect already does this (the inventory pass found none).

- [ ] **Step 5: Confirm formatCurrency/formatDate need no signature change**

Read `useFormat.ts` and `format.ts` to confirm `formatCurrency(value, currency, language)` and `formatDate(iso, dateFormat, timezone)` keep their existing parameter shapes — the spec explicitly says "no format-engine change needed" since `Intl.NumberFormat`/`Intl.DateTimeFormat` derive correct BRL/pt-BR formatting once the `language`/`currency`/`dateFormat` values themselves are correct. If `format.ts` has an internal `LOCALE_MAP` keyed by the old 8-language strings (confirmed present per inventory), add `"Português (Brasil)": "pt-BR"` to it and remove or keep the other 6 entries as dead mappings (removing them is fine since `LANGUAGES` no longer offers them, but do not remove `"English (US)": "en-US"` if any other code path — e.g. an existing saved localStorage value from before this migration — could still hold it; keep a safe fallback to `"en-US"` for any unrecognized string).

- [ ] **Step 6: Verify build and lint**

Run: `yarn build && yarn lint`

- [ ] **Step 7: Manual verification**

Run `yarn dev`, open Preferences, switch the Language select between English / Português (Brasil), confirm the Sidebar/AvatarDropdown labels (migrated in Task 2) swap immediately with no page reload.

- [ ] **Step 8: Commit**

```bash
git add src/features/preferences/constants/preferences.constants.ts src/app/providers/PreferencesProvider.tsx src/utils/format.ts
git commit -m "feat(i18n): collapse preferences.language to EN/PT-BR, wire runtime i18next switching, add BRL" -- src/features/preferences/constants/preferences.constants.ts src/app/providers/PreferencesProvider.tsx src/utils/format.ts
```

---

### Task 4: Extract strings — Storefront + Table-Menu (customer-facing)

**Files:**
- Modify: `src/i18n/config.ts` (register `storefront`, `tableMenu` namespaces)
- Create: `src/i18n/locales/en/storefront.json`, `src/i18n/locales/pt-BR/storefront.json`
- Create: `src/i18n/locales/en/tableMenu.json`, `src/i18n/locales/pt-BR/tableMenu.json`
- Modify: `src/features/storefront/components/BottomSheet.tsx`, `CartOverlay.tsx`, `CheckoutFlow.tsx`, `StorefrontFeature.tsx`, `SuccessView.tsx`
- Modify: `src/features/table-menu/components/TableMenuFeature.tsx`

**Interfaces:**
- Consumes: `useTranslation` from `react-i18next` (pattern established in Task 2).
- Produces: namespaces `"storefront"` and `"tableMenu"`, each with a flat-ish key tree grouped by component (`cart.*`, `checkout.*`, `success.*` for storefront; `menu.*`, `notFound.*` for tableMenu). Later phases (8/9/10) add keys to these same two namespace files — do not create a third namespace for checkout.

- [ ] **Step 1: Read every hardcoded string in the 6 target files**

Read `BottomSheet.tsx`, `CartOverlay.tsx`, `CheckoutFlow.tsx`, `StorefrontFeature.tsx`, `SuccessView.tsx`, `TableMenuFeature.tsx` in full. For each, list every JSX text node, button label, placeholder, aria-label, and toast/alert string — this is the authoritative list (the inventory pass gave rough counts only: ~3/4/4/4/4 for storefront files, ~6 for TableMenuFeature).

- [ ] **Step 2: Design and write the English namespace files**

Group keys by which component renders them, e.g.:
```json
{
  "cart": {
    "title": "Your Cart",
    "empty": "Your cart is empty",
    "checkoutButton": "Checkout"
  },
  "checkout": {
    "title": "Checkout",
    "deliveryFeeLabel": "Delivery Fee",
    "placeOrderButton": "Place Order"
  },
  "success": {
    "title": "Order Confirmed",
    "subtitle": "Thank you for your order!"
  }
}
```
Fill in every real string found in Step 1 (the block above is illustrative structure, not the final key list — the implementer must enumerate every actual string, not just these samples). Do the same for `tableMenu.json` (`menu.*`, `notFound.*` groups).

- [ ] **Step 3: Write the pt-BR mirror**

Translate every key using the spec's terminology glossary where applicable (Cardápio for menu, Pedido for order, Para viagem for takeout, etc.) — e.g. `"checkoutButton": "Finalizar Pedido"`, `"cart.title": "Seu Carrinho"`.

- [ ] **Step 4: Register namespaces**

Add both `storefront`/`tableMenu` imports and resource entries in `src/i18n/config.ts`, same pattern as Task 2 Step 4.

- [ ] **Step 5: Replace hardcoded strings in each component**

For each of the 6 files: add `const { t } = useTranslation("storefront")` (or `"tableMenu"`), replace every literal found in Step 1 with `t("group.key")`. Example transform:
```typescript
// before
<button>Checkout</button>
// after
<button>{t("cart.checkoutButton")}</button>
```
Where a string is built with interpolation (e.g. `` `${count} items` ``), use i18next interpolation instead of concatenation: key value `"{{count}} items"`, call site `t("cart.itemCount", { count })`.

- [ ] **Step 6: Verify build, lint, and manual render**

Run: `yarn build && yarn lint`. Run `yarn dev`, load `/storefront` and `/table-menu?table=<id>`, toggle language in Preferences (opened in another tab or via localStorage edit + reload, since these are public unauthenticated routes — confirm the same `PreferencesProvider` instance still applies per Task 3's shared-provider setup), confirm all customer-facing text switches and no key/blank text renders.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/storefront.json src/i18n/locales/pt-BR/storefront.json src/i18n/locales/en/tableMenu.json src/i18n/locales/pt-BR/tableMenu.json src/features/storefront/components/BottomSheet.tsx src/features/storefront/components/CartOverlay.tsx src/features/storefront/components/CheckoutFlow.tsx src/features/storefront/components/StorefrontFeature.tsx src/features/storefront/components/SuccessView.tsx src/features/table-menu/components/TableMenuFeature.tsx
git commit -m "feat(i18n): extract Storefront and Table-Menu strings to storefront/tableMenu namespaces" -- src/i18n/config.ts src/i18n/locales/en/storefront.json src/i18n/locales/pt-BR/storefront.json src/i18n/locales/en/tableMenu.json src/i18n/locales/pt-BR/tableMenu.json src/features/storefront/components/BottomSheet.tsx src/features/storefront/components/CartOverlay.tsx src/features/storefront/components/CheckoutFlow.tsx src/features/storefront/components/StorefrontFeature.tsx src/features/storefront/components/SuccessView.tsx src/features/table-menu/components/TableMenuFeature.tsx
```

---

### Task 5: Extract strings — KDS + Orders (staff operational)

**Files:**
- Modify: `src/i18n/config.ts` (register `kds`, `orders` namespaces)
- Create: `src/i18n/locales/en/kds.json`, `src/i18n/locales/pt-BR/kds.json`
- Create: `src/i18n/locales/en/orders.json`, `src/i18n/locales/pt-BR/orders.json`
- Modify: `src/features/kds/components/KdsFeature.tsx`, `KdsTicket.tsx`, `StatusBadge.tsx`
- Modify: `src/features/orders/components/ActionButton.tsx`, `CreateOrderModal.tsx`, `DeleteOrderModal.tsx`, `ItemCountBadge.tsx`, `OrderDrawer.tsx`, `OrderRow.tsx`, `OrdersFeature.tsx`, `StatusBadge.tsx`

**Interfaces:**
- Consumes: `useTranslation` pattern from Task 2/4.
- Produces: namespaces `"kds"` and `"orders"`. Because `OrderStatus` (`New`/`Preparing`/`Ready`/`Completed`/`Cancelled`) is rendered as a label in both KDS's and Orders' `StatusBadge.tsx`, define **one shared key set** for status labels inside `orders.json` under `status.*` (e.g. `orders.status.new`, `orders.status.preparing`) and have `kds`'s `StatusBadge.tsx` also call `useTranslation("orders")` for those specific keys — do not duplicate status labels into a separate `kds.json` copy, matching the spec's "one canonical key ... reused, not a per-feature reinvention" rule.

- [ ] **Step 1: Read every hardcoded string in both StatusBadge.tsx files first**

Read both `src/features/kds/components/StatusBadge.tsx` and `src/features/orders/components/StatusBadge.tsx` in full — confirm whether they are the same component duplicated per-feature or genuinely different. If duplicated, both must map the same `OrderStatus` value to the same translated label via the shared `orders.status.*` keys (color mapping is out of scope here — that's Phase 11).

- [ ] **Step 2: Read every hardcoded string in the remaining 9 files**

`CreateOrderModal.tsx` is the heaviest file in the repo (~43 strings per inventory) — read it in full, don't sample. Also read `KdsFeature.tsx`, `KdsTicket.tsx`, `ActionButton.tsx`, `DeleteOrderModal.tsx`, `ItemCountBadge.tsx`, `OrderDrawer.tsx`, `OrderRow.tsx`, `OrdersFeature.tsx`.

- [ ] **Step 3: Write English namespace files**

`orders.json` structure (illustrative — enumerate every real string from Steps 1-2):
```json
{
  "status": {
    "new": "New",
    "preparing": "Preparing",
    "ready": "Ready",
    "completed": "Completed",
    "cancelled": "Cancelled"
  },
  "createModal": {
    "title": "New Order",
    "channelLabel": "Channel",
    "channelPhone": "Phone",
    "channelDineIn": "Dine-in",
    "submitButton": "Create Order"
  },
  "deleteModal": {
    "title": "Cancel Order",
    "confirmMessage": "Are you sure you want to cancel this order?"
  },
  "table": {
    "emptyState": "No orders yet"
  }
}
```
`kds.json` covers only KDS-specific chrome (ticket layout labels, elapsed-time copy stub for Phase 11) — status labels come from `orders.status.*` per the Interfaces note above.

- [ ] **Step 4: Write pt-BR mirrors**

Use glossary terms: Pedido for Order, Cozinha for Kitchen-facing chrome, Preparando/Pronto/Concluído/Cancelado for statuses, Novo for New.

- [ ] **Step 5: Register namespaces and replace strings in all 11 files**

Same pattern as Task 4 Step 4-5. For the two `StatusBadge.tsx` files specifically: both call `useTranslation("orders")` and key off `t(\`status.${status.toLowerCase()}\`)` (or an explicit switch if the status string doesn't lowercase-match the key directly — check exact `OrderStatus` string values before assuming).

- [ ] **Step 6: Verify build, lint, manual render**

Run: `yarn build && yarn lint`. In `yarn dev`, confirm `/orders` and `/kds` render fully in both languages, and that changing an order's status via KDS still shows the correct translated label on the Orders page (cross-feature check, mirroring Phase 4's verification pattern).

- [ ] **Step 7: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/kds.json src/i18n/locales/pt-BR/kds.json src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json src/features/kds/components/KdsFeature.tsx src/features/kds/components/KdsTicket.tsx src/features/kds/components/StatusBadge.tsx src/features/orders/components/ActionButton.tsx src/features/orders/components/CreateOrderModal.tsx src/features/orders/components/DeleteOrderModal.tsx src/features/orders/components/ItemCountBadge.tsx src/features/orders/components/OrderDrawer.tsx src/features/orders/components/OrderRow.tsx src/features/orders/components/OrdersFeature.tsx src/features/orders/components/StatusBadge.tsx
git commit -m "feat(i18n): extract KDS and Orders strings, unify OrderStatus labels under orders.status" -- src/i18n/config.ts src/i18n/locales/en/kds.json src/i18n/locales/pt-BR/kds.json src/i18n/locales/en/orders.json src/i18n/locales/pt-BR/orders.json src/features/kds/components/KdsFeature.tsx src/features/kds/components/KdsTicket.tsx src/features/kds/components/StatusBadge.tsx src/features/orders/components/ActionButton.tsx src/features/orders/components/CreateOrderModal.tsx src/features/orders/components/DeleteOrderModal.tsx src/features/orders/components/ItemCountBadge.tsx src/features/orders/components/OrderDrawer.tsx src/features/orders/components/OrderRow.tsx src/features/orders/components/OrdersFeature.tsx src/features/orders/components/StatusBadge.tsx
```

---

### Task 6: Extract strings — Menu + Tables (admin CRUD)

**Files:**
- Modify: `src/i18n/config.ts` (register `menu`, `tables` namespaces)
- Create: `src/i18n/locales/en/menu.json`, `src/i18n/locales/pt-BR/menu.json`
- Create: `src/i18n/locales/en/tables.json`, `src/i18n/locales/pt-BR/tables.json`
- Modify: `src/features/menu/components/MenuFeature.tsx`, `MenuItemCard.tsx`, `MenuItemModal.tsx`
- Modify: `src/features/tables/components/AddTableModal.tsx`, `TableCard.tsx`, `TablesFeature.tsx`

**Interfaces:**
- Consumes: `useTranslation` pattern from prior tasks.
- Produces: namespaces `"menu"` and `"tables"`. `MenuItemModal.tsx`'s validation messages (the "blank item" validation added in Phase 1, per roadmap) must also route through `t()`, not stay as inline literal error strings.

- [ ] **Step 1: Read every hardcoded string in all 6 files**

Read `MenuFeature.tsx`, `MenuItemCard.tsx`, `MenuItemModal.tsx` (~15 strings incl. validation messages), `AddTableModal.tsx`, `TableCard.tsx`, `TablesFeature.tsx` in full.

- [ ] **Step 2: Write English namespace files**

```json
{
  "title": "Menu",
  "addItemButton": "Add Item",
  "modal": {
    "titleCreate": "New Menu Item",
    "titleEdit": "Edit Menu Item",
    "nameLabel": "Name",
    "priceLabel": "Price",
    "validationRequired": "This field is required"
  },
  "availableToggle": "Available",
  "lowStockBadge": "Low stock"
}
```
(illustrative — fill from Step 1's real list). Same for `tables.json` (`title`, `addTableButton`, `modal.*`, QR-related labels).

- [ ] **Step 3: Write pt-BR mirrors**

Use Cardápio for Menu, Mesa for Table, Estoque-adjacent copy for "Low stock" (`"Estoque baixo"`).

- [ ] **Step 4: Register namespaces and replace strings**

Same pattern as prior tasks.

- [ ] **Step 5: Verify build, lint, manual render**

Run: `yarn build && yarn lint`. In `yarn dev`, confirm `/menu` and `/tables` (including the Add/Edit modals and validation error) render correctly in both languages.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/menu.json src/i18n/locales/pt-BR/menu.json src/i18n/locales/en/tables.json src/i18n/locales/pt-BR/tables.json src/features/menu/components/MenuFeature.tsx src/features/menu/components/MenuItemCard.tsx src/features/menu/components/MenuItemModal.tsx src/features/tables/components/AddTableModal.tsx src/features/tables/components/TableCard.tsx src/features/tables/components/TablesFeature.tsx
git commit -m "feat(i18n): extract Menu and Tables strings" -- src/i18n/config.ts src/i18n/locales/en/menu.json src/i18n/locales/pt-BR/menu.json src/i18n/locales/en/tables.json src/i18n/locales/pt-BR/tables.json src/features/menu/components/MenuFeature.tsx src/features/menu/components/MenuItemCard.tsx src/features/menu/components/MenuItemModal.tsx src/features/tables/components/AddTableModal.tsx src/features/tables/components/TableCard.tsx src/features/tables/components/TablesFeature.tsx
```

---

### Task 7: Extract strings — Home + Analytics (dashboards)

**Files:**
- Modify: `src/i18n/config.ts` (register `home`, `analytics` namespaces)
- Create: `src/i18n/locales/en/home.json`, `src/i18n/locales/pt-BR/home.json`
- Create: `src/i18n/locales/en/analytics.json`, `src/i18n/locales/pt-BR/analytics.json`
- Modify: `src/features/home/components/HomeFeature.tsx`, `HomeHeader.tsx`, `KitchenBacklog.tsx`, `LowStockAlerts.tsx`, `QuickActions.tsx`, `TodaySnapshot.tsx`
- Modify: `src/features/analytics/components/AnalyticsFeature.tsx`, `AnalyticsHeader.tsx`, `ChannelChart.tsx`, `Heatmap.tsx`, `KPICard.tsx`, `RevenueChart.tsx`, `TopItemsList.tsx`

**Interfaces:**
- Consumes: `useTranslation` pattern from prior tasks.
- Produces: namespaces `"home"` and `"analytics"`. Chart components (`ChannelChart`, `Heatmap`, `RevenueChart`, `KPICard`) were flagged as zero-string in the inventory pass but must be re-checked here — legend labels, axis labels, and KPI titles are exactly the kind of string a regex pass on JSX text nodes misses when they're passed as props (e.g. `<KPICard label="Revenue" />`).

- [ ] **Step 1: Read all 13 files, including the "zero-count" chart components**

Read every file in both lists in full. For `ChannelChart.tsx`, `Heatmap.tsx`, `RevenueChart.tsx`, `KPICard.tsx` specifically: check for string *props* passed in from `AnalyticsFeature.tsx` (e.g. `<KPICard label="Revenue" value={...} />`) — those literals belong in `analytics.json` even though the chart component itself renders zero literals internally.

- [ ] **Step 2: Write English namespace files**

```json
{
  "greeting": "Welcome back, {{name}}",
  "snapshot": {
    "revenueLabel": "Today's Revenue",
    "orderCountLabel": "Orders Today",
    "avgOrderValueLabel": "Avg Order Value"
  },
  "kitchenBacklog": {
    "title": "Kitchen Backlog"
  },
  "lowStock": {
    "title": "Low Stock Alerts",
    "empty": "All items well stocked"
  },
  "quickActions": {
    "newOrder": "New Order",
    "openKds": "Open KDS",
    "viewMenu": "View Menu",
    "copyLink": "Copy Ordering Link",
    "copied": "Copied!"
  }
}
```
(illustrative — fill from Step 1). `analytics.json` covers KPI titles, chart legend/axis labels, "Top Items" heading.

- [ ] **Step 3: Write pt-BR mirrors**

`"greeting": "Bem-vindo(a) de volta, {{name}}"`, Painel-adjacent copy, Relatório for report/analytics chrome.

- [ ] **Step 4: Register namespaces and replace strings, including chart props**

Same pattern as prior tasks — for chart prop strings, change the call site in `AnalyticsFeature.tsx` from a literal to `t("kpi.revenueTitle")` etc., passed into the unchanged chart component prop.

- [ ] **Step 5: Verify build, lint, manual render**

Run: `yarn build && yarn lint`. In `yarn dev`, confirm `/home` and `/analytics` (including chart legends/KPI titles) render correctly in both languages, and the personalized greeting interpolates the real logged-in user's name correctly in both locales.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/home.json src/i18n/locales/pt-BR/home.json src/i18n/locales/en/analytics.json src/i18n/locales/pt-BR/analytics.json src/features/home/components/HomeFeature.tsx src/features/home/components/HomeHeader.tsx src/features/home/components/KitchenBacklog.tsx src/features/home/components/LowStockAlerts.tsx src/features/home/components/QuickActions.tsx src/features/home/components/TodaySnapshot.tsx src/features/analytics/components/AnalyticsFeature.tsx src/features/analytics/components/AnalyticsHeader.tsx src/features/analytics/components/ChannelChart.tsx src/features/analytics/components/Heatmap.tsx src/features/analytics/components/KPICard.tsx src/features/analytics/components/RevenueChart.tsx src/features/analytics/components/TopItemsList.tsx
git commit -m "feat(i18n): extract Home and Analytics strings" -- src/i18n/config.ts src/i18n/locales/en/home.json src/i18n/locales/pt-BR/home.json src/i18n/locales/en/analytics.json src/i18n/locales/pt-BR/analytics.json src/features/home/components/HomeFeature.tsx src/features/home/components/HomeHeader.tsx src/features/home/components/KitchenBacklog.tsx src/features/home/components/LowStockAlerts.tsx src/features/home/components/QuickActions.tsx src/features/home/components/TodaySnapshot.tsx src/features/analytics/components/AnalyticsFeature.tsx src/features/analytics/components/AnalyticsHeader.tsx src/features/analytics/components/ChannelChart.tsx src/features/analytics/components/Heatmap.tsx src/features/analytics/components/KPICard.tsx src/features/analytics/components/RevenueChart.tsx src/features/analytics/components/TopItemsList.tsx
```

---

### Task 8: Extract strings — Administration (Team, Roles, Audit Log)

**Files:**
- Modify: `src/i18n/config.ts` (register `administration` namespace)
- Create: `src/i18n/locales/en/administration.json`, `src/i18n/locales/pt-BR/administration.json`
- Modify: `src/features/administration/components/AdministrationHeader.tsx`, `AuditLogFeature.tsx`, `InviteUserModal.tsx`, `Pagination.tsx`, `RolesFeature.tsx`, `StatusPill.tsx`, `TeamFeature.tsx`, `UserDetailDrawer.tsx`

**Interfaces:**
- Consumes: `useTranslation` pattern from prior tasks.
- Produces: single `"administration"` namespace covering Team/Roles/Audit Log sub-pages (they're one feature module per the repo convention) — do not split into 3 namespaces.

- [ ] **Step 1: Read all 8 files**

`UserDetailDrawer.tsx` (~12), `InviteUserModal.tsx` (~9), `TeamFeature.tsx` (~8), `AuditLogFeature.tsx` (~7), `RolesFeature.tsx` (~4), `StatusPill.tsx` (~2) per inventory, plus `AdministrationHeader.tsx` and `Pagination.tsx` (both flagged zero — re-check `Pagination.tsx` specifically for "Previous"/"Next"/"Page X of Y" strings, a common miss for generic components).

- [ ] **Step 2: Write English namespace file**

```json
{
  "team": {
    "title": "Team",
    "inviteButton": "Invite User",
    "roleLabel": "Role",
    "statusActive": "Active",
    "statusInactive": "Inactive",
    "deactivateButton": "Deactivate",
    "reactivateButton": "Reactivate",
    "resendSetupEmail": "Resend Setup Email"
  },
  "roles": {
    "title": "Roles"
  },
  "auditLog": {
    "title": "Audit Log"
  },
  "inviteModal": {
    "title": "Invite User",
    "emailLabel": "Email",
    "submitButton": "Send Invite",
    "successMessage": "Invitation sent"
  },
  "pagination": {
    "previous": "Previous",
    "next": "Next",
    "pageOf": "Page {{current}} of {{total}}"
  }
}
```
(illustrative — fill from Step 1's real strings, including every field label in `UserDetailDrawer.tsx`).

- [ ] **Step 3: Write pt-BR mirror**

Use Equipe for Team, Funções for Roles, Registro de Auditoria for Audit Log — matching Task 2's shell nav translations exactly (same concepts, must not drift into a different PT-BR phrase here vs. the nav).

- [ ] **Step 4: Register namespace and replace strings in all 8 files**

Same pattern as prior tasks.

- [ ] **Step 5: Verify build, lint, manual render against real backend**

Run: `yarn build && yarn lint`. In `yarn dev`, log in with real test credentials (see the `order-ui-test-login` memory — a synthetic JWT 401s against this real backend-wired feature), visit `/administration/team|roles|audit-log`, confirm both languages render, including the Invite modal's success message and Pagination's Previous/Next.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/administration.json src/i18n/locales/pt-BR/administration.json src/features/administration/components/AdministrationHeader.tsx src/features/administration/components/AuditLogFeature.tsx src/features/administration/components/InviteUserModal.tsx src/features/administration/components/Pagination.tsx src/features/administration/components/RolesFeature.tsx src/features/administration/components/StatusPill.tsx src/features/administration/components/TeamFeature.tsx src/features/administration/components/UserDetailDrawer.tsx
git commit -m "feat(i18n): extract Administration (Team/Roles/Audit Log) strings" -- src/i18n/config.ts src/i18n/locales/en/administration.json src/i18n/locales/pt-BR/administration.json src/features/administration/components/AdministrationHeader.tsx src/features/administration/components/AuditLogFeature.tsx src/features/administration/components/InviteUserModal.tsx src/features/administration/components/Pagination.tsx src/features/administration/components/RolesFeature.tsx src/features/administration/components/StatusPill.tsx src/features/administration/components/TeamFeature.tsx src/features/administration/components/UserDetailDrawer.tsx
```

---

### Task 9: Extract strings — Notifications + Preferences (including the heaviest remaining file)

**Files:**
- Modify: `src/i18n/config.ts` (register `notifications`, `preferences` namespaces)
- Create: `src/i18n/locales/en/notifications.json`, `src/i18n/locales/pt-BR/notifications.json`
- Create: `src/i18n/locales/en/preferences.json`, `src/i18n/locales/pt-BR/preferences.json`
- Modify: `src/features/notifications/components/NotificationGroupCard.tsx`, `NotificationPreferenceItem.tsx`, `NotificationsFeature.tsx`, `NotificationsHeader.tsx`, `NotificationsStatusBanner.tsx`, `SavePreferencesButton.tsx`
- Modify: `src/features/preferences/components/PreferencesFeature.tsx`, `PreferencesFooter.tsx`, `PreferencesHeader.tsx`, `PreferencesRow.tsx`, `PreferencesSectionCard.tsx`, `PreferencesSegmentedControl.tsx`, `PreferencesSelect.tsx`, `PreferencesToggle.tsx`, `StorefrontSection.tsx`

**Interfaces:**
- Consumes: `useTranslation` pattern from prior tasks; also consumes the final `LANGUAGES`/`CURRENCIES` values from Task 3 — the language/currency `<select>` option *labels themselves* (`"English"`, `"Português (Brasil)"`, `"BRL — Real Brasileiro"`, etc.) stay as literal data values (they're stored preference values, not translatable UI copy — per the "presentation-boundary only" rule, these are the enum-like source of truth, not a label mapped from one), but every *surrounding* label (`"Language"`, `"Currency"`, section headings) does go through `t()`.
- Produces: namespaces `"notifications"` and `"preferences"`. `PreferencesFeature.tsx` (~34 strings) and `StorefrontSection.tsx` (~10 strings) are the bulk of this task — read both in full before writing keys.

- [ ] **Step 1: Read all 15 files**

Read all 6 notifications files and all 9 preferences files in full. `PreferencesFeature.tsx` is the second-heaviest file in the repo — do not sample it, enumerate every section heading, row label, and helper/description text.

- [ ] **Step 2: Write English namespace files**

`notifications.json`:
```json
{
  "title": "Notifications",
  "emptyState": "No notifications yet",
  "channel": {
    "whatsapp": "WhatsApp",
    "inApp": "In-App"
  },
  "preferenceItem": {
    "emailLabel": "Email notifications",
    "pushLabel": "Push notifications"
  },
  "saveButton": "Save Preferences",
  "savedConfirmation": "Preferences saved"
}
```
`preferences.json` (illustrative subset — enumerate every real section from `PreferencesFeature.tsx`):
```json
{
  "sections": {
    "appearance": "Appearance",
    "regionalFormat": "Regional & Format",
    "storefront": "Storefront"
  },
  "rows": {
    "theme": "Theme",
    "fontSize": "Font Size",
    "compactMode": "Compact Mode",
    "denseTable": "Dense Tables",
    "reducedMotion": "Reduced Motion",
    "language": "Language",
    "timezone": "Timezone",
    "dateFormat": "Date Format",
    "currency": "Currency",
    "sidebarNavigation": "Sidebar Navigation"
  },
  "storefrontSection": {
    "logoLabel": "Storefront Logo",
    "coverLabel": "Cover Image",
    "brandColorLabel": "Brand Color"
  }
}
```

- [ ] **Step 3: Write pt-BR mirrors**

`"language": "Idioma"`, `"currency": "Moeda"`, `"timezone": "Fuso Horário"`, etc.

- [ ] **Step 4: Register namespaces and replace strings — with the option-label exception noted above**

Replace every surrounding label/heading with `t()`. Do **not** wrap the `LANGUAGES`/`CURRENCIES`/`TIMEZONES`/`DATE_FORMATS` array values themselves in `t()` — those render as-is inside `PreferencesSelect` options, unchanged from Task 3.

- [ ] **Step 5: Verify build, lint, manual render**

Run: `yarn build && yarn lint`. In `yarn dev`, open `/preferences` and `/notifications`, confirm every section/row label switches language while the Language/Currency/Timezone/Date Format select *option text* itself stays as the literal preference values (English/Português (Brasil), BRL — Real Brasileiro, etc.) regardless of active UI language — that's correct per the Interfaces note, not a bug.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/config.ts src/i18n/locales/en/notifications.json src/i18n/locales/pt-BR/notifications.json src/i18n/locales/en/preferences.json src/i18n/locales/pt-BR/preferences.json src/features/notifications/components/NotificationGroupCard.tsx src/features/notifications/components/NotificationPreferenceItem.tsx src/features/notifications/components/NotificationsFeature.tsx src/features/notifications/components/NotificationsHeader.tsx src/features/notifications/components/NotificationsStatusBanner.tsx src/features/notifications/components/SavePreferencesButton.tsx src/features/preferences/components/PreferencesFeature.tsx src/features/preferences/components/PreferencesFooter.tsx src/features/preferences/components/PreferencesHeader.tsx src/features/preferences/components/PreferencesRow.tsx src/features/preferences/components/PreferencesSectionCard.tsx src/features/preferences/components/PreferencesSegmentedControl.tsx src/features/preferences/components/PreferencesSelect.tsx src/features/preferences/components/PreferencesToggle.tsx src/features/preferences/components/StorefrontSection.tsx
git commit -m "feat(i18n): extract Notifications and Preferences strings" -- src/i18n/config.ts src/i18n/locales/en/notifications.json src/i18n/locales/pt-BR/notifications.json src/i18n/locales/en/preferences.json src/i18n/locales/pt-BR/preferences.json src/features/notifications/components/NotificationGroupCard.tsx src/features/notifications/components/NotificationPreferenceItem.tsx src/features/notifications/components/NotificationsFeature.tsx src/features/notifications/components/NotificationsHeader.tsx src/features/notifications/components/NotificationsStatusBanner.tsx src/features/notifications/components/SavePreferencesButton.tsx src/features/preferences/components/PreferencesFeature.tsx src/features/preferences/components/PreferencesFooter.tsx src/features/preferences/components/PreferencesHeader.tsx src/features/preferences/components/PreferencesRow.tsx src/features/preferences/components/PreferencesSectionCard.tsx src/features/preferences/components/PreferencesSegmentedControl.tsx src/features/preferences/components/PreferencesSelect.tsx src/features/preferences/components/PreferencesToggle.tsx src/features/preferences/components/StorefrontSection.tsx
```

---

### Task 10: Remaining app-shell chrome + final whole-branch sweep

**Files:**
- Modify: `src/i18n/config.ts` (extend `shell` namespace if needed)
- Modify: `src/layouts/app-layout/GlobalHeader.tsx`, `MobileHeader.tsx`, `NotificationBell.tsx` (confirm exact paths from inventory)
- Modify (grep sweep, files TBD by search results): any remaining hardcoded English string found by the sweep in Step 1

**Interfaces:**
- Consumes: every namespace produced by Tasks 1-9.
- Produces: nothing new consumed by later phases beyond what Tasks 1-9 already produced — this task closes out Phase 7, not a new surface.

- [ ] **Step 1: Sweep for missed strings**

Run a repo-wide search for capitalized multi-word string literals inside `src/features/`, `src/layouts/`, `src/pages/` that are NOT already `t(...)` calls or imports from a `constants/` file — e.g. `grep -rn '"[A-Z][a-z]* [A-Za-z]' src/features src/layouts src/pages --include=*.tsx | grep -v 't("'`. Cross-check every hit against the file list already covered in Tasks 2-9; anything genuinely missed (e.g. `MobileHeader.tsx`, `NotificationBell.tsx`, `GlobalHeader.tsx` if not already touched) gets extracted the same way — add to `shell.json` if it's app-chrome, or the relevant feature namespace if it's feature-specific.

- [ ] **Step 2: Confirm no orphaned imports remain**

Run: `grep -rn "i18n/translations\|hooks/useTranslation" src/` — expect zero hits (already deleted in Task 2, this re-confirms nothing regressed since).

- [ ] **Step 3: Full build and lint pass**

Run: `yarn build && yarn lint`
Expected: zero errors introduced by this phase (pre-existing unrelated lint errors in `profile`/`settings`/`auth`, noted in the Phase 6 summary as predating this initiative, are not this phase's responsibility — confirm any remaining lint errors are only in those files, not in any file this phase touched).

- [ ] **Step 4: Commit the sweep**

```bash
git add -- <files changed by the sweep, listed explicitly>
git commit -m "feat(i18n): sweep remaining app-shell strings, close out Phase 7 i18n foundation" -- <same file list>
```

- [ ] **Step 5: Dispatch one verify-ui browser pass**

Per the spec's "Testing / verification" section: use the `verify-ui` skill for a single Playwright pass confirming (a) toggling EN↔PT-BR in Preferences swaps text live with no reload on both a public route (`/storefront`) and an authenticated route (`/orders`), and (b) no key/blank text renders anywhere touched by this phase. This is the only browser dispatch for this phase — do not iterate further dispatches on cosmetic findings; fix from source and re-verify once if needed.

