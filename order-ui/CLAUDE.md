## Start here (shared by backend and frontend; keep identical in both repos)

- **Docs live in the backend repo** `gtavaresdevs/enterprise-order-suite`, folder `docs/`, branch `feature/ai-agent`. Read `docs/README.md` first: it says what phase we are in and what to read for each kind of task. Frontend sessions clone the backend repo read-only to read them.
- **The backend owns the docs and the API contract** and keeps them current (ADR-0010, ADR-0011). The frontend reads them and may add an annotation only when necessary and only after Gabriel has agreed to it.
- **Decisions are ADRs** in `docs/adr/`. Check them before proposing anything that contradicts one; raise the conflict instead of working around it. Never apply a legacy decision from an old spec without checking `docs/adr/0000-legacy-decisions-triage.md`.
- **Open questions** live in `docs/planning/open-questions.md` (ids `Q-NN`, never renumbered). Never record an answer Gabriel did not give.
- **Current phase:** planning, documentation and Claude readiness (`docs/roadmap.md`). No feature code for the new architecture until the readiness gate in `docs/roadmap.md` passes.
- **Git:** work only on the working branch (backend `feature/ai-agent`, frontend `Claude-Assisted-Development`); never read or base work on `main`. Commit straight to the working branch with an explicit pathspec (`git commit -m "..." -- <files>`) and push. Never merge (no `git merge`, no PR merges, nothing into `main`), never `git stash`, never `git add -A`, never force-push (ADR-0013). Only the main agent commits; subagents never write git state.
- **Architecture in one paragraph:** one shared multi-tenant SaaS; every restaurant-owned row is scoped to its restaurant and fails closed without one (ADR-0001). One operational core (one Order model with channel + source, one Menu) that every interface calls through application services; no business rules in channel adapters (ADR-0002). The Restaurant Edge is optional and not built this run (ADR-0003); offline support means orders (ADR-0004). Payments are record-only: the app never processes or queues a payment and never reports an unconfirmed external operation as successful (ADR-0005). There is no production data yet, so schema and API may be reshaped (ADR-0008); ids are ULIDs (ADR-0009).
- **Language:** code, comments and docs in English; ask Gabriel questions in the language he writes in.

## This repo (frontend, `order-ui/`)

React 19 + TypeScript SPA on Vite; Tailwind 4 with shadcn/Radix primitives; TanStack Query; React Router 7; axios; i18next (EN and pt-BR). Most features still run on mock data (see "Mock vs real backend").

## Commands

- `yarn dev` (Vite), `yarn build` (`tsc -b && vite build`), `yarn lint` (`eslint .`), `yarn test` (`vitest run`).
- Verification before "done": `yarn lint && yarn build && yarn test`. Vitest runs `*.test.ts(x)` files next to the code they test (first ones: `src/utils/*.test.ts`); the default environment is Node, so a component test must opt into a DOM environment first. CI (`.github/workflows/ci.yml` at the repo root) runs the same three commands on every push to `Claude-Assisted-Development`.
- `yarn lint` is clean (0 errors, re-checked 2026-09-29 in S3). Keep it clean: CI fails on any lint error.

## Direction (replaces the 2026-09-09 "Active initiative")

- `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` is superseded where the ADRs differ: single-tenant deployment (ADR-0001), in-app payment through a gateway (ADR-0005, ADR-0006), automatic WhatsApp messages (ADR-0006). It is no longer the concept source or the backend's contract; the backend `docs/` (README, architecture, ADRs) is. Read its banner.
- Still holds: one order stream (one `Order` model, one KDS queue) and one menu source (ADR-0002). `features/menu` is the only source of `MenuItem` data; no feature keeps its own fixture copy.
- Shared domain types (`Order`, `MenuItem`, `Table`, ...) live once in `src/types/`. Never duplicate one per feature with a slightly different shape. Use `migrate-shared-type` when changing a type with more than one consumer, `scaffold-feature` for a new feature module.
- Mock services keep the *target* shapes, so wiring the backend later is additive. Target shapes now come from the backend docs (contract docs, `docs/api/drafts/`), not from the 2026-09-09 spec's "Backend gaps". Mocks retire feature by feature in the build order (ADR-0007).
- Mock `MenuItem` ids `m1`-`m9` (`features/menu/constants/menu.constants.ts`) are load-bearing while menu is mock: the mock orders in `features/orders/constants/orders.constants.ts` (served by `orders.service.ts`) reference `m1`-`m8`. Never change them without checking every consumer.
- Never show a `MenuItem` with `available === false` in a customer-facing view.

## API contract (ADR-0010)

- The backend owns the contract. API shapes come from the backend repo docs: `docs/api/drafts/` while a contract is designed, `docs/api/openapi.yaml` once implemented. Types generated from that spec (`openapi-typescript`) arrive with Build 1, as one of its acceptance criteria (ADR-0010); hand-written API types in `src/types/*` are then deleted feature by feature as each moves to the real backend. How frontend CI and sessions get the spec: Q-76 a, a vendored copy of `docs/api/openapi.yaml` updated by a sync script from a pinned backend commit; CI checks that the generated types match it (ADR-0010 Decision 7).
- A frontend need that changes the contract (a field added or renamed on a shared type, a new or changed endpoint, an auth/CORS/cookie behavior, a rule the server must enforce) is raised to Gabriel and the backend. It is never written into a frontend manifest or doc.
- `docs/superpowers/specs/2026-09-14-backend-integration-manifest.openapi.yaml` is frozen at 0.4.0 and read-only: never edit it, bump `info.version`, or add `x-changelog` or `x-open-decisions` entries.
- Annotations to shared docs: only when necessary and only with Gabriel's prior agreement (ADR-0011). Where an agreed annotation lives is not decided yet; ask.
- Mock → real: switch a service only to an endpoint present in the committed backend `docs/api/openapi.yaml`, never to an assumed one; a wrong assumption breaks a working UI. `src/types/<feature>.ts` and `services/<feature>.service.ts` change together, never one without the other.

## Code structure

All domain code lives in `src/features/<feature>/`:

```
features/<feature>/
  components/   # feature UI; a top-level <Feature>Feature.tsx composes the page
  hooks/        # use<Feature> hooks: hold state, orchestrate services
  services/     # data access: real calls via src/api/client.ts, or mock data
  constants/    # static/mock data, enum-like lookups
  index.ts      # re-exports only the top-level Feature component
```

- Route → page → feature: routes are in `src/app/router.tsx`; `src/pages/*.tsx` only render the feature's top-level component (`pages/Orders.tsx` renders `<OrdersFeature />`). Logic goes in the feature, not the page.
- `src/components/ui/`: presentational shadcn-based primitives (Button, Card, Input, ...). `src/components/<domain>/`: a domain component used by two or more features today (`payment/PaymentMethodPicker.tsx`, used by `orders` and `storefront`). With one consumer it stays in that feature's `components/`; "might be reused later" is not a second consumer.
- Import through the `@/*` → `src/*` alias (`tsconfig.app.json`, `vite.config.ts`), never relative `../../` paths.
- Server state: TanStack React Query only. Do not add SWR, Redux, Zustand or another data/state library.
- UI strings are translated with i18next (`src/i18n/locales/en`, `src/i18n/locales/pt-BR`).

## Mock vs real backend (as of 2026-09-29)

Check the service file before editing a feature: a hook that looks like it fetches may be reading a mock.
- Real (through `src/api/client.ts`): `auth`; `profile` get and update (avatar upload is still a `setTimeout` mock); `administration` (team, roles, audit log).
- Mock (in-memory fixtures from `constants/`, mostly with `setTimeout` latency; `menu`, `orders` and `tables` carry `// TODO: connect-backend` markers): `menu`, `orders`, `tables`, `settings`, `notifications`. `storefront`, `table-menu`, `track-order`, `kds`, `home` and `analytics` read the `menu`/`orders`/`tables` mocks.
- `preferences` is stored in the browser's `localStorage`. Restaurant settings are to become a typed backend-owned schema (ADR-0014).

## Auth (current behavior)

- Access token: `localStorage.accessToken`, sent as `Authorization: Bearer` by the `api` axios instance (`src/api/client.ts`). The `User` (id, email, name, `roles`) is decoded client-side (`features/auth/utils/auth.utils.ts`: `parseJwt`, `extractUserFromStorage`); roles come from `roles[]`, `role` or `authorities[]`, then the stored `role`, and default to `USER`.
- Refresh token: an HttpOnly cookie since the 2026-09-25 auth plan (`docs/superpowers/plans/2026-09-25-auth-refresh-cookie-cross-tab.md`), set by `/auth/login` and rotated by `POST /auth/refresh` (both `withCredentials`). JavaScript cannot read it. A leftover `localStorage.refreshToken` predates the cookie: it is sent once in the refresh body, then removed.
- On a 401 from a non-`/auth/*` endpoint the client refreshes once and replays the request. Refresh is shared within the tab and serialized across tabs by a Web Lock (`order-ui:auth-refresh`), because reusing a rotated token revokes the whole token family. A 4xx from refresh ends the session, except 403 `ORIGIN_NOT_ALLOWED`; a network error or 5xx shows `ServiceUnavailable`.
- `useAuth()` reads the user from storage and follows other tabs through the `storage` event. Logout calls `POST /auth/logout` (the server clears the cookie), then clears `localStorage` and the React Query cache.
- Route protection (`src/app/router.tsx`): `ProtectedLayout` (no token → `/login`; expired token → refresh before rendering) wraps `AppLayout` (sidebar and header shell); `RoleGuard` wraps admin routes (team: `ADMIN`/`SUPER_ADMIN`; roles and audit log: `SUPER_ADMIN`).
- `/storefront`, `/checkout`, `/kds`, `/table-menu` and `/track-order` render outside the shell with no login. That describes today, not a rule: the KDS will sign in with a staff login (Q-54 a, Order Core, Build 3), and the access token moves into memory in Build 1 (Q-29 a).
- **Auth-sensitive files** (`src/api/client.ts`, `features/auth/**`, `src/layouts/protected-layout/**`, anything that touches the tokens or `role` in `localStorage` or relies on the refresh cookie): extra caution, and Gabriel's explicit confirmation before a change lands.

## Claude tooling (`order-ui/.claude/`, versioned)

- `order-ui/.claude/` is in git since Gabriel's commit `c4a7309` (Q-06, Q-07): the skills (`migrate-shared-type`, `scaffold-feature`, `connect-backend`, `verify-ui`, `audit-requirement`, `graphify`), the agents `requirement-auditor` and `ui-behavior-verifier`, the hook `hooks/lint-typecheck.cjs`, `settings.json` (hook, plugins, git `permissions.deny`) and `.claude/CLAUDE.md` (Graphify trigger). Machine-local state stays ignored (`order-ui/.gitignore`): `settings.local.json`, `.tsc-hook-cache`, `scheduled_tasks.lock`, `*.graphify-bak`.
- Where you start Claude Code matters. Settings load only from the starting directory: started in `order-ui/` (Gabriel's machine), `order-ui/.claude/settings.json` applies; started at the repo root (cloud sessions), the root `.claude/settings.json` applies instead, and it carries only the git `permissions.deny` rules, so the lint hook and plugins do not run there. Skills, agents and this file load on demand once the session works under `order-ui/`.
- Graphify needs the `graphifyy` Python package on the machine; its output (`graphify-out/`) is gitignored and refreshed by hand.
- Where a skill conflicts with an ADR, the ADR wins: `connect-backend` predates ADR-0010, which requires it to read the backend spec.
- The hook runs `eslint --fix` and a scoped incremental `tsc --noEmit` after each Edit/Write on `*.ts`/`*.tsx`, asynchronously and without blocking. It does not replace `yarn build` before finishing a task.

## Browser verification (`verify-ui`)

- It confirms behavior; it does not discover fixes. CSS, layout and stacking bugs are derivable from source (grep `z-index`/`position`, read the DOM ancestry): reason out the fix, apply it, then dispatch at most once to confirm. Each dispatch costs tens of thousands of tokens and minutes.
- For a follow-up check on the same flow, resume the prior `ui-behavior-verifier` agent with `SendMessage` instead of dispatching a fresh one.
- A check that needs a real backend response logs in through the real `/login` form with real test credentials, never a synthetic JWT (it passes route guards but 401s on every real endpoint). The credentials are in Gabriel's machine-local `order-ui-test-login` memory; cloud sessions do not have it, so ask Gabriel. No shared source is set yet.

## Subagents

- Pin `model:` on every `.claude/agents/*.md`. An agent without it inherits the main session's model, so an Opus session pays Opus rates for mechanical work.
  - `sonnet`: work that correlates code across files and makes a judgment call (verdicts, drift reports, bug findings). `requirement-auditor` and `ui-behavior-verifier` stay on `sonnet`; move neither to `opus` nor to `haiku`.
  - `haiku`: only purely mechanical lookup, formatting or extraction with unambiguous acceptance criteria. No such agent exists yet; do not force a judgment-heavy agent down to it.
  - Unpinned only for a one-off `Agent` dispatch where you pass `model` yourself.
- Prefer a `fork` over a fresh agent mid-conversation for research that needs this session's context: a fork shares this session's prompt cache. Use a fresh agent when the task needs no conversation context, or to keep a noisy transcript out of this session and a fork's history.

## Git workflow (ADR-0013)

- Working branch `Claude-Assisted-Development`, pushed to `origin/Claude-Assisted-Development`. Never commit to, merge into or push `main`, and never read `main` as the reference.
- Commit at the end of every task, after `yarn lint && yarn build && yarn test` passes. Always an explicit pathspec (`git commit -m "..." -- <files>`) and a conventional message (`feat(...)`, `fix(...)`, `docs(...)`). Never `git add -A`, `git add .` or `git commit -a`.
- Push with a plain `git push`, never force. Update with `git pull --ff-only` (a plain pull can create a merge commit).
- Never merge: no `git merge` in any form, including local worktree-to-branch merges; no PR merge or auto-merge. Parallel worktree results land by `git cherry-pick`.
- Never `git stash`: `.git` is shared across worktrees, and stash/pop can clobber another worktree's work.
- Only the main agent commits and pushes, after reviewing subagent work. Subagents never run git write commands.
- `permissions.deny` in `order-ui/.claude/settings.json` and in the root `.claude/settings.json` blocks the common forms of these commands. It matches command prefixes, so it is a guardrail, not a boundary.

## Legacy docs in this repo

`docs/superpowers/` holds the frontend's earlier specs and plans. Each carries a superseded or status banner (under the title; in the manifest, comment lines at the top): read it first. The plans are executed records: never re-execute them or copy their worktree-merge or manifest-patch steps. `2026-09-16-business-rules-master-en.md` is a 2026-09-16 snapshot that wins over the pt-BR copies (ADR-0012); it stays here until S5 re-verifies it, then the English master moves to the backend `docs/business-rules/` (Q-14, decided by Claude, Gabriel may override).
