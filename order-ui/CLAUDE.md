# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no test suite configured in this repo (no test script, no test runner installed). Do not assume Jest/Vitest exists — check `package.json` before adding test tooling.

## Active initiative: restaurant ops redesign

The app is being reshaped from a generic B2B order-tracking demo into an actual restaurant
order-management product (unified Online/Dine-in/Phone order model, a single Menu module,
QR-code Tables, real Administration screens). The target concept, exact shared type shapes, and
what's explicitly out of scope are all written down in
`docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` — read it before making any
non-trivial change to `orders`, `kds`, `storefront`, `inventory`, `administration`, `home`, or
before creating the new `menu`/`tables` features. Don't re-derive the concept from the current
(pre-redesign) code alone; the current code is exactly what's being moved away from.

- **Shared domain types belong in one place.** `Order`, `MenuItem`, and `Table` (per the spec)
  are consumed by more than one feature — they must not be duplicated per-feature with
  slightly different shapes (this was the original problem the redesign fixes). Use the
  `migrate-shared-type` skill when changing a type that already has multiple consumers, and the
  `scaffold-feature` skill when creating the new `menu`/`tables` feature modules.
- **New/rebuilt features stay mock-backed with the *target* shapes**, even where the current
  backend doesn't support a field yet (e.g. `channel`, `fulfillment`, `table` on `Order`; backend
  gaps are listed in the spec's "Backend gaps" section). Shape the mock fixture like the eventual
  real DTO now, so wiring the backend later is additive, not a second migration.

## Architecture

### Feature-module structure

All domain logic lives under `src/features/<feature>/`, each following the same internal shape:

```
features/<feature>/
  components/   # feature UI, one top-level "<Feature>Feature.tsx" composes the page
  hooks/        # use<Feature>-style hooks — hold state and orchestrate services
  services/     # data access — either real API calls via src/api/client.ts, or mock data
  constants/    # static/mock data, enum-like lookups
  index.ts      # re-exports only the top-level Feature component, e.g. `export * from "./components/OrdersFeature"`
```

`src/pages/*.tsx` are thin route entry points that just render the feature's top-level component (e.g. `pages/Orders.tsx` renders `<OrdersFeature />` from `features/orders`). Route → page → feature is the standard chain; put logic in the feature, not the page.

`src/components/` holds code that lives outside any single feature. `src/components/ui/` is
presentational UI primitives (shadcn-based: Button, Card, Input, etc.). `src/components/<domain>/`
is for a domain component genuinely shared by 2+ feature modules (e.g.
`src/components/payment/PaymentMethodPicker.tsx`, shared by `orders` and `storefront`). Anything
with only one feature consumer stays inside that feature's own `components/` folder — don't
promote something to `src/components/` just because it might be reused later; the bar is an actual
second consumer today.

### Mock data vs. real backend — important

Feature services are **not uniformly wired to a real backend yet**. Only `auth` and `profile` services call the real API (`src/api/client.ts` → `axios`). Every other feature's service (`orders`, `inventory`, `administration`, `analytics`, `home`, `kds`, `notifications`, `preferences`, `settings`, `storefront`) returns static/mock data from its `constants/` file, sometimes wrapped in an artificial `setTimeout` to simulate latency, with the real `api.get/post/...` calls left commented out as TODOs. When touching one of these features, check the service file first to see whether you're editing mock plumbing or a real integration — don't assume network calls exist just because a hook looks like it's fetching.

### Auth

- JWT (`accessToken`/`refreshToken`) stored in `localStorage`, decoded client-side (`features/auth/utils/auth.utils.ts::parseJwt`) to derive the `User` (id, email, name, `roles: Role[]`). Roles are normalized from several possible JWT shapes (`roles[]`, `role` string, `authorities[]`) and default to `USER` if none are found.
- `useAuth()` (`features/auth/hooks/useAuth.ts`) reads the user from storage and listens for the `storage` event to react to login/logout in other tabs.
- Route protection is two-layered in `src/app/router.tsx`:
  1. `ProtectedLayout` — checks `accessToken` exists in `localStorage`, redirects to `/login` if not. Renders only an `<Outlet />` (no shell UI).
  2. `AppLayout` — the actual sidebar/header shell, nested inside `ProtectedLayout`.
  3. `RoleGuard` (`allowedRoles`) — wraps individual admin-only routes (e.g. `/administration/*`) and redirects to `/home` if the user's roles don't match.
- `/storefront` and `/kds` are standalone routes rendered outside the authenticated app shell (customer-facing / kiosk-facing).

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`) — always import via `@/...`, not relative `../../` paths.

## Working agreements for Claude Code

- **Mock → real backend**: never flip a feature's service from mock data to a real API call without
  first confirming the endpoint against the local backend's live swagger/OpenAPI spec (see the
  `connect-backend` skill). A wrong assumption here breaks a working UI against a nonexistent or
  mismatched endpoint.
- **Types/service lockstep**: `src/types/<feature>.ts` changes and `services/<feature>.service.ts`
  changes land together — never one without the other.
- **No new data-fetching/state library**: TanStack React Query is the standard here; don't introduce
  SWR, Redux, Zustand, etc.
- **Auth-sensitive files** (`src/api/client.ts`, `features/auth/**`, anything touching the
  `accessToken`/`refreshToken` in `localStorage`) get extra caution and explicit confirmation before
  changes land, given the blast radius.
- **Before calling a task done**: `yarn lint` and `yarn build` (or `tsc -b`) clean. There's no test
  suite in this repo, so type-checking and lint are the only automated safety net.
- **Fast-feedback hook**: `.claude/hooks/lint-typecheck.cjs` runs `eslint --fix` plus a scoped
  incremental `tsc --noEmit` after every Edit/Write on a `*.ts`/`*.tsx` file, asynchronously
  (non-blocking — it never gates the edit). It surfaces remaining issues via a system message; it
  does not replace running `yarn build` before finishing a task.
- **Browser verification (`verify-ui`) is for behavior, not for discovering fixes**: CSS/layout/
  stacking bugs are derivable from source (grep `z-index`/`position`, read the DOM ancestry) —
  reason out the fix and apply it, then dispatch at most once to confirm. Don't iterate fixes
  through repeated browser dispatches; each one is tens of thousands of tokens and minutes of wall
  time. When a check needs a real backend response, use real test credentials (see the
  `order-ui-test-login` memory) via the actual `/login` form, not a synthetic JWT — a synthetic
  token passes route guards but always 401s against real endpoints. For a follow-up check on the
  same flow, resume the prior `ui-behavior-verifier` agent via `SendMessage` instead of dispatching
  fresh — see the `verify-ui` skill for details.
- **Model tiering for subagents**: a custom agent with no `model:` in its frontmatter silently
  inherits whatever model is driving the *main* session — if that's Opus, every dispatch of it
  pays Opus rates regardless of how mechanical the task is. Pin `model:` explicitly on every
  `.claude/agents/*.md` file to match the task, not the caller:
  - `sonnet` — anything that correlates code across files and forms a judgment call (verdicts,
    drift reports, bug findings). Both `requirement-auditor` and `ui-behavior-verifier` are pinned
    here; don't bump either to `opus` and don't drop either to `haiku` — both do real
    cross-file/cross-state reasoning where a wrong verdict is expensive to discover later.
  - `haiku` — only for genuinely mechanical work with no judgment call: pure lookup/formatting/
    extraction where the acceptance criteria are unambiguous. This repo has no such agent yet;
    don't force-fit an existing judgment-heavy agent down to this tier just to save cost.
  - Leave unpinned (inherit) only for a one-off `Agent` dispatch you're driving interactively in
    the same turn, where you're choosing the model yourself via the `model` param anyway.
- **Prefer `fork` over a fresh agent mid-conversation** for research that needs this session's
  context (e.g. "what's left before X ships" style survey questions) — a fork shares this
  session's prompt cache, so it doesn't re-pay cache-creation cost for context the main session
  already paid for. Reach for a fresh `general-purpose`/custom agent only when the task doesn't
  need conversation context (it starts cold either way) or when you deliberately want the noisy
  transcript kept out of both this session and a fork's shared history.

## Git workflow

- **Branch:** all work is committed to `Claude-Assisted-Development` and pushed to
  `origin/Claude-Assisted-Development`. `main` stays untouched until there is something concrete
  to release — never commit to, merge into, or push `main`.
- **Commit at the end of every task**, after `yarn build` and `yarn lint` are clean. Use an
  explicit pathspec (`git commit -m "..." -- <files>`) and a conventional message (`feat(...)`,
  `fix(...)`, `docs(...)`). Never `git add -A`.
- **Push** to `origin/Claude-Assisted-Development` after committing (plain push, never force).
- **Only the main agent commits/pushes.** Subagents never run git write commands; the main agent
  reviews their work first. Never `git stash` (shared `.git` across worktrees).
