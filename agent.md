# order-ui — Implementation Roadmap

> **Tracking location:** This file lives at the repo root while app code is in `order-ui/`. After Phase 12, move or duplicate here to `order-ui/agent.md` so phases stay next to the app.

## App structure snapshot (post–auth roadmap)

```
order-ui/src/
├── api/client.ts
├── app/router.tsx
├── components/{layout,ui}
├── features/auth/{components,hooks,services}
├── pages/{Login,Register,Home}
├── types/auth.tsx          → rename to auth.ts (Phase 9)
├── lib/utils.tsx           → rename to utils.ts (Phase 9)
└── App.tsx / main.tsx
```

**What’s working:** feature layout (`features/auth/*`), thin pages, Axios singleton + bearer interceptor, shared UI primitives, `QueryClientProvider` + `RouterProvider` entry.

---

## Phases 1–5: Auth foundation (COMPLETED)

### Phase 1: Login flow & base core
- [x] UI primitives (`@/components/ui`)
- [x] Axios client + token interceptors (`src/api/client.ts`)
- [x] `auth.service.ts` login request
- [x] `useLogin.ts` mutation hook
- [x] `LoginForm.tsx` + `pages/Login.tsx`
- [x] Base routes in `src/app/router.tsx`

### Phase 2: Registration API contract
- [x] Auth types in `src/types/auth.tsx`
- [x] `registerRequest` in `auth.service.ts`

### Phase 3: Registration hook layer
- [x] `useRegister.ts` (TanStack Query)

### Phase 4: Registration UI
- [x] `RegisterForm.tsx` + `pages/Register.tsx`

### Phase 5: Routing & layout
- [x] `/register` route; login ↔ register links
- [x] `AppLayout` for `/home`; root `App.tsx` cleanup

---

## Phase 6: Registration password bug (CRITICAL) — **DONE**

**Problem:** Form validates password fields but submits only `{ fullName, email, role }`. Backend likely expects `password`.

**Steps:**
- [x] Add `password: string` to `RegisterFields` in `src/types/auth.tsx`
- [x] Include `password: formData.password` in `RegisterForm` `register({ ... })` payload
- [x] `registerRequest` posts full `RegisterFields` (password included automatically)
- [ ] Smoke-test against live API: confirm backend accepts field name `password`

**Acceptance:** Registration request body includes password; successful signup when API is up.

---

## Phase 7: Route guards (CRITICAL)

**Problem:** `/home` is reachable without `accessToken` in `localStorage`.

**Steps:**
1. Create `src/components/auth/ProtectedRoute.tsx`:
   - Read `localStorage.getItem('accessToken')`.
   - If missing → `<Navigate to="/login" replace />`.
   - Else → render `children` or `<Outlet />`.
2. Wrap `/home` (and future private routes) in `router.tsx` under `ProtectedRoute`.
3. *(Optional, same phase)* `GuestRoute` for `/login` and `/register`: if token present → `<Navigate to="/home" replace />`.

**Acceptance:** Unauthenticated users cannot view `/home`; authenticated users hitting `/login` redirect to `/home` (if GuestRoute added).

---

## Phase 8: Register error UX (CRITICAL)

**Problem:** `useRegister` only `console.error`s; users see nothing on API failure.

**Steps:**
1. Remove silent `console.error`-only handling from `useRegister` (or keep log + rethrow).
2. In `RegisterForm`, read `error` / `isError` from mutation (same pattern as `LoginForm`).
3. Render alert banner for API errors (reuse Login styling).

**Acceptance:** Failed registration shows a visible error message without opening devtools.

---

## Phase 9: Env, deps, shared errors (POLISH)

**Steps:**
1. Add `order-ui/.env.example`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
2. Add direct dependency: `clsx` (`yarn add clsx` in `order-ui`) — `lib/utils` imports it but it’s not in `package.json`.
3. Create `src/lib/api-error.ts`:
   ```ts
   export function getApiErrorMessage(error: unknown, fallback: string): string
   ```
4. Use `getApiErrorMessage` in `useLogin` and `useRegister` (remove duplicated `isAxiosError` extraction).

**Acceptance:** `.env.example` documents API URL; `clsx` listed in dependencies; both auth hooks use one error helper.

---

## Phase 10: Types, naming, exports (POLISH)

**Steps:**
1. Rename `src/types/auth.tsx` → `auth.ts` (no JSX); update all imports.
2. Rename `src/lib/utils.tsx` → `utils.ts`; update imports.
3. `LoginCredentials`: make `password: string` required (form always sends it).
4. `registerRequest`: align with `loginRequest` — `const { data } = await api.post(...); return data;` (adjust return type if API returns body).
5. Standardize exports: prefer **named** export for `RegisterForm` (match `LoginForm`); update `Register.tsx` import.

**Acceptance:** No `.tsx` files without JSX; consistent hook/service patterns; named form exports.

---

## Phase 11: Auth page shell + login UX (POLISH)

**Problem:** Login (gradient + Package) vs Register (dot grid + Building2) feel like two products.

**Steps:**
1. Extract `AuthPageShell` (logo slot, background, footer) under `src/components/auth/` or `layout/`.
2. Refactor `Login.tsx` and `Register.tsx` to use shell; unify visual language (pick one background/icon treatment).
3. Login UX cleanup (low priority within phase):
   - **Remember me:** either wire persistence (e.g. email in `localStorage`) or remove unused state until implemented.
   - **Forgot password:** keep `href="#"` but add `aria-disabled` / “Coming soon” label, or remove link until feature exists.

**Acceptance:** Login and Register share one shell; no dead UI without a deliberate placeholder.

---

## Phase 12: Documentation & tracking (MEDIUM)

**Steps:**
1. Replace default Vite `order-ui/README.md`: install, `yarn dev`, `VITE_API_URL`, API base URL, auth routes overview.
2. Move or duplicate this `agent.md` to `order-ui/agent.md` and link from README.

**Acceptance:** New dev can run app and find env vars without reading `client.ts`.

---

## Phase 13: Auth hardening (MEDIUM — plan, implement when needed)

| Topic | Why | Steps (high level) |
|-------|-----|-------------------|
| Refresh token | Stored in `localStorage`, never used | 401 interceptor; call refresh endpoint; retry queue; logout on failure |
| Auth state | Ad hoc `localStorage` reads | `AuthProvider` or Zustand slice: user, tokens, login/logout |
| Role-based UI | `Role` exists, unused | Route/UI gates for `ADMIN` vs `USER` |
| User vs register DTO | `User` has `firstName`/`lastName`; register sends `fullName` | Align types and payload with backend contract |

**Acceptance:** Document chosen approach in this file before coding; implement sub-items in follow-up PRs.

---

## Suggested execution order

| Order | Phase | Effort |
|-------|--------|--------|
| 1 | **6** — Password in registration | Small |
| 2 | **7** — ProtectedRoute (+ GuestRoute) | Small |
| 3 | **8** — Register errors in UI | Small |
| 4 | **9** — `.env.example`, `clsx`, `getApiErrorMessage` | Small |
| 5 | **10** — Renames, types, exports | Small |
| 6 | **11** — AuthPageShell + login UX | Medium |
| 7 | **12** — README + agent.md location | Small |
| 8 | **13** — Refresh, AuthProvider, roles, DTOs | Medium+ |

---

## Phase status

| Phase | Status |
|-------|--------|
| 1–5 | Done |
| 6 | Done |
| 7–8 | Pending (critical) — **Phase 7 next** |
| 9–11 | Pending (polish) |
| 12–13 | Pending (medium-term) |

---

## Notes for agents

- Work in `order-ui/` unless updating this roadmap.
- Match existing patterns: TanStack Query mutations, thin pages, `features/auth/*`.
- Do not commit unless asked.
- After each phase: run lint/build, update checkboxes above, then wait for user before next phase.
