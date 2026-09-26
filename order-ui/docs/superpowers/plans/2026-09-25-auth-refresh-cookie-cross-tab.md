# Auth Refresh Cookie + Cross-Tab Single-Flight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the frontend onto the backend's Phase 1 HttpOnly refresh cookie, stop keeping the refresh token in `localStorage`, and make refresh run at most once across all open tabs. The backend now treats a second use of a rotated token as reuse and revokes the whole family.

**Architecture:** All refresh logic stays in `src/api/client.ts::refreshSession`. The existing in-tab promise dedupe gets wrapped in a Web Lock (`navigator.locks`), so only one tab at a time can call `POST /auth/refresh`. After a tab gets the lock, it re-reads `localStorage` and reuses the access token another tab just wrote instead of rotating again. The access token stays in `localStorage` for this phase. Moving it into memory (the manifest's full TARGET) is a separate, later change. `/auth/*` calls send `withCredentials: true` so the browser stores and sends the cookie. A leftover `refreshToken` in `localStorage` from before this change gets sent in the body one last time, then deleted (silent migration).

**Tech Stack:** React 19, TypeScript 6, axios 1.x, TanStack Query 5, Vite 8, yarn. Browser verification uses Playwright with the preinstalled Chromium.

**Spec:** Backend Phase 1 refresh-token decisions (agreed 2026-09-25, summarized under Global Constraints) plus `docs/superpowers/specs/2026-09-14-backend-integration-manifest.openapi.yaml` (auth paths, `x-open-decisions.dev-cookie-secure`).

## Global Constraints

- **Sequencing:** this lands only after backend Phase 1 (migration V21, cookie, family revocation) is running locally. Task 1 gates this. Against the old backend, dropping the stored refresh token would log everyone out at their first refresh.
- Backend reads the refresh token from the `refreshToken` cookie first and falls back to the body `refreshToken`. The body is optional. No token from either source → 401.
- Reuse (a token that's already used or revoked) → the whole family is revoked, then 401. **No grace window.** Two simultaneous refreshes → one wins, and the other counts as reuse.
- A valid refresh → 200 with `{accessToken, refreshToken}` in the body (backward compatibility) plus `Set-Cookie`. The frontend ignores body `refreshToken`, and the cookie is the source of truth.
- Cookie: `refreshToken`, `HttpOnly`, `Path=/api/auth`, `Max-Age` = 14 days, `SameSite=Lax` by default. `Secure` is off in local dev (`REFRESH_COOKIE_SECURE=false`).
- Origin check runs only when the token came from the cookie. A missing or foreign `Origin` → **403** with `code: "ORIGIN_NOT_ALLOWED"`, before any token is touched.
- Logout revokes the whole family and returns `Set-Cookie: refreshToken=; Max-Age=0`. It answers 200 even when there's no token.
- A successful password reset revokes every refresh token the user has. Access tokens stay valid until `exp` (24h).
- JWT now carries `firstName`, `lastName`, `email`. They're display-only and can go stale after a profile edit until the next refresh.
- Frontend origin `http://localhost:3000`, API base `http://localhost:8080/api` (`VITE_API_URL` fallback in `client.ts`).
- Repo rules (`order-ui/CLAUDE.md`): **no test runner exists**. Don't add one in this plan. The safety net is `yarn lint`, `yarn build`, and the scripted Playwright scenarios below (kept in the session scratchpad and not committed). Auth-sensitive files need explicit user confirmation before commit. Commits use explicit pathspecs, never `git add -A`, and only on `Claude-Assisted-Development`. Manifest changes land in the **same commit** as the behavior they describe.
- Test credentials come from the `order-ui-test-login` memory. Never write them into this plan, the scripts that get committed, or commit messages.

## Review Focus

1. **Two tabs hit an expired token at the same moment**: exactly one `POST /auth/refresh` goes out, and both tabs stay logged in. Pinned in Task 3, Step 1/4.
2. **A user logged in before this deploy** (refresh token in `localStorage`, no cookie) keeps their session. The first refresh migrates them to the cookie and deletes the stored token. Pinned in Task 2, Step 6.
3. **A browser without Web Locks** (plain-HTTP non-localhost origin, or an old browser) doesn't crash and falls back to in-tab dedupe. Pinned in Task 3, Step 5.
4. **403 `ORIGIN_NOT_ALLOWED` from refresh** (a deploy misconfiguration) shows the outage screen and doesn't log the user out, so the misconfiguration stays visible. Pinned in Task 2, Step 7.
5. **After logout**, the cookie is gone. A back-button visit or a stale second tab ends up on `/login` and doesn't loop. Pinned in Task 2, Step 8.

---

### Task 1: Contract gate against the live Phase 1 backend

No code changes. Confirms the real contract before any client code changes (`connect-backend` skill rule).

**Files:** none (notes go in the Task 2 commit message / manifest changelog if drift is found)

**Interfaces:**
- Produces: confirmed facts Task 2 relies on: login `Set-Cookie` attributes, refresh accepting an empty JSON body `{}` with the cookie, the exact 403 `code` string, and the error body shape `{message, code}`.

- [ ] **Step 1: Confirm the backend is Phase 1**

Run: `curl -s http://localhost:8080/api/v3/api-docs | python -m json.tool > "$SCRATCH/api-docs.json"` and then `grep -n "refresh" -A30 "$SCRATCH/api-docs.json" | head -80`
Expected: the refresh request schema's `refreshToken` is **not** in `required`, and the request body itself is `required: false`. If `refreshToken` is still required, **stop**: Phase 1 isn't deployed, so tell the user.

- [ ] **Step 2: Confirm login sets the cookie**

Run (credentials from memory; don't echo them into files):
```bash
curl -si -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -d '{"email":"<test email>","password":"<test password>"}' \
  http://localhost:8080/api/auth/login | grep -i -E '^(HTTP|set-cookie|access-control-allow-(origin|credentials))'
```
Expected: `HTTP/1.1 200`, `Set-Cookie: refreshToken=...; Path=/api/auth; Max-Age=1209600; HttpOnly; SameSite=Lax` (no `Secure` locally), `Access-Control-Allow-Origin: http://localhost:3000`, `Access-Control-Allow-Credentials: true`.

- [ ] **Step 3: Confirm cookie-only refresh with an empty JSON body and the 403 shape**

```bash
curl -si -c "$SCRATCH/jar" -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -d '{"email":"<test email>","password":"<test password>"}' http://localhost:8080/api/auth/login > /dev/null
curl -si -b "$SCRATCH/jar" -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' -d '{}' \
  http://localhost:8080/api/auth/refresh | head -20
curl -si -b "$SCRATCH/jar" -H 'Origin: http://evil.example' -H 'Content-Type: application/json' -d '{}' \
  http://localhost:8080/api/auth/refresh | tail -3
```
Expected: the first refresh returns `200` with a new `Set-Cookie`. The foreign-origin call returns `403` with a JSON body containing `"code":"ORIGIN_NOT_ALLOWED"`. If the code string or body shape differs, use the real value in Task 2 and record the drift in the manifest changelog.

---

### Task 2: Cookie transport, silent migration, 403 handling, manifest 0.4.0

**Files:**
- Modify: `src/api/client.ts` (entire `endSession` / `refreshSession` block, lines 21-60)
- Modify: `src/features/auth/services/auth.service.ts` (all four token-bearing calls)
- Modify: `src/features/auth/hooks/useLogin.ts:17-18`
- Modify: `src/types/auth.tsx:11-14`
- Modify: `docs/superpowers/specs/2026-09-14-backend-integration-manifest.openapi.yaml` (info.version, Error.code description, `/auth/refresh`, `/auth/logout`, `AuthResponse` descriptions, `x-changelog`)
- Test: `$SCRATCH/verify-cookie.mjs` (scratchpad Playwright script, not committed)

**Interfaces:**
- Consumes: Task 1 facts.
- Produces (Task 3 and Task 4 rely on these exact names):
  - `export function clearSession(): void`: removes `accessToken`, `refreshToken`, `role` from `localStorage`. No navigation.
  - `export function endSession(): void`: `clearSession()` + `window.location.replace('/login')` (unchanged behavior).
  - `export function refreshSession(): Promise<string>`: same signature as today.
  - `async function postRefresh(): Promise<string>`: module-private. It does one network refresh, writes `accessToken`, deletes the legacy `refreshToken`, and returns the new access token.
  - `const ORIGIN_NOT_ALLOWED = 'ORIGIN_NOT_ALLOWED'`: module-private.

- [ ] **Step 1: Write the failing browser check (baseline)**

Create `$SCRATCH/verify-cookie.mjs`. Resolve `playwright` from `order-ui/node_modules` if present, else use `executablePath: '/opt/pw-browsers/chromium'` (or the local Chromium on Windows):
```js
import { chromium } from 'playwright';
const [email, password] = [process.env.TEST_EMAIL, process.env.TEST_PASSWORD];
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto('http://localhost:3000/login');
await page.getByLabel(/email/i).fill(email);
await page.getByLabel(/password/i).first().fill(password);
await page.getByRole('button', { name: /sign in|log in|entrar/i }).click();
await page.waitForURL('**/home');
const rc = (await ctx.cookies('http://localhost:8080/api/auth/refresh')).find(c => c.name === 'refreshToken');
const stored = await page.evaluate(() => localStorage.getItem('refreshToken'));
console.log(JSON.stringify({
  cookie: rc ? { httpOnly: rc.httpOnly, path: rc.path } : null,
  storedRefreshToken: stored !== null,
}));
await browser.close();
```

- [ ] **Step 2: Run it against the current code to see it fail**

Run: `TEST_EMAIL=... TEST_PASSWORD=... node "$SCRATCH/verify-cookie.mjs"` (with `yarn dev` running and the Phase 1 backend up)
Expected: `{"cookie":null,"storedRefreshToken":true}`. There's no cookie because login isn't `withCredentials`, and the refresh token is still in `localStorage`.

- [ ] **Step 3: Implement the client changes**

`src/types/auth.tsx`, replacing `AuthResponse`:
```ts
export interface AuthResponse {
  accessToken: string;
  // Still sent in the body by the backend for older clients. Ignored here: the HttpOnly
  // refreshToken cookie is the source of truth and is never readable from JS.
  refreshToken?: string;
}
```

`src/api/client.ts`, replacing lines 21-60 (`endSession` through the end of `refreshSession`):
```ts
// Drops every trace of the session from localStorage without navigating. The refresh cookie is
// HttpOnly, so only the server can clear it (POST /auth/logout).
export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
}

// Drops the local session and does a full navigation to /login. The full reload also wipes the
// in-memory React Query cache, so nothing from this session survives into the next login.
export function endSession() {
  clearSession();
  window.location.replace('/login');
}

// The backend answers 403 with this code when the refresh cookie arrives from an origin outside
// its CORS list: a deploy misconfiguration, not an expired session, so it must not log out.
const ORIGIN_NOT_ALLOWED = 'ORIGIN_NOT_ALLOWED';

// One network refresh. The refresh token travels in the HttpOnly cookie (withCredentials). A
// refreshToken still in localStorage predates the cookie: send it in the body this one time
// (the backend falls back to it when there is no cookie), then forget it; the response sets the
// cookie. `{}` keeps Content-Type: application/json on the cookie-only request.
async function postRefresh(): Promise<string> {
  const legacyRefreshToken = localStorage.getItem('refreshToken');
  const body = legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {};
  // Bare axios, not `api`, so a failing refresh can't re-enter the 401 interceptor.
  const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, body, { withCredentials: true });
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.removeItem('refreshToken');
  return data.accessToken;
}

let refreshInFlight: Promise<string> | null = null;

// POST /auth/refresh rotates the refresh token, and a second use of a rotated token revokes the
// whole token family (no grace window), so concurrent callers must share a single request.
// Resolves with the new access token. A 4xx means the session is over (ends it), except
// ORIGIN_NOT_ALLOWED; a network error, 5xx or that 403 is rethrown so the UI shows an outage.
export function refreshSession(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        return await postRefresh();
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const code = isAxiosError(error)
          ? (error.response?.data as { code?: string } | undefined)?.code
          : undefined;
        if (status !== undefined && status >= 400 && status < 500 && code !== ORIGIN_NOT_ALLOWED) {
          endSession();
        }
        throw error;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
```
The old "no refresh token in storage → endSession" pre-check is gone on purpose. JS can't see the cookie, so the server's 401 is now the only way to know there's no session.

`src/features/auth/services/auth.service.ts`: login, register and logout become:
```ts
// withCredentials so the browser stores the HttpOnly refreshToken cookie from Set-Cookie.
export const loginRequest = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials, { withCredentials: true });
  return data;
};

export const registerRequest = async (data: RegisterFields): Promise<void> => {
  const response = await api.post('/auth/register', data, { withCredentials: true });
  return response.data;
};
```
```ts
export const logoutRequest = async (): Promise<void> => {
  // POST /auth/logout revokes the whole token family and clears the cookie; idempotent (200 even
  // with no token). A pre-cookie refreshToken still in localStorage goes in the body instead.
  const legacyRefreshToken = localStorage.getItem('refreshToken');
  await api.post('/auth/logout', legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}, {
    withCredentials: true,
  });
};
```

`src/features/auth/hooks/useLogin.ts`: delete line 18 (`localStorage.setItem('refreshToken', data.refreshToken);`) and add `localStorage.removeItem('refreshToken');` in its place, so a leftover legacy token from an earlier session never gets sent. `useLogout.ts` keeps its existing `removeItem('refreshToken')` calls, which are harmless cleanup.

- [ ] **Step 4: Lint and type-check**

Run: `yarn lint && yarn build`
Expected: both clean. If `data.refreshToken` is still referenced anywhere, the build flags it as possibly undefined. Search for it with `grep -rn "refreshToken" src` and confirm the only remaining hits are the legacy read/remove calls above and the type comment.

- [ ] **Step 5: Re-run the Step 1 check**

Run: `node "$SCRATCH/verify-cookie.mjs"`
Expected: `{"cookie":{"httpOnly":true,"path":"/api/auth"},"storedRefreshToken":false}`

- [ ] **Step 6: Legacy-session migration check (Review Focus 2)**

Append to the script (or a copy, `$SCRATCH/verify-migration.mjs`) after login:
```js
// Simulate a pre-deploy session: token in localStorage, no cookie, expired access token.
const { refreshToken } = await (await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
})).json();
await ctx.clearCookies();
await page.evaluate((rt) => {
  localStorage.setItem('refreshToken', rt);
  localStorage.setItem('accessToken', 'x.eyJleHAiOjF9.x'); // {"exp":1}: expired
}, refreshToken);
await page.goto('http://localhost:3000/orders');
await page.waitForURL('**/orders');
const after = await page.evaluate(() => localStorage.getItem('refreshToken'));
const hasCookie = (await ctx.cookies('http://localhost:8080/api/auth/refresh')).some(c => c.name === 'refreshToken');
console.log(JSON.stringify({ url: page.url(), legacyGone: after === null, hasCookie }));
```
Expected: `{"url":"http://localhost:3000/orders","legacyGone":true,"hasCookie":true}`

- [ ] **Step 7: 403 ORIGIN_NOT_ALLOWED check (Review Focus 4)**

In a fresh logged-in context:
```js
await page.route('**/api/auth/refresh', (r) => r.fulfill({
  status: 403, contentType: 'application/json',
  body: JSON.stringify({ message: 'Origin not allowed', code: 'ORIGIN_NOT_ALLOWED' }),
}));
await page.evaluate(() => localStorage.setItem('accessToken', 'x.eyJleHAiOjF9.x'));
await page.goto('http://localhost:3000/orders');
await page.waitForTimeout(1500);
console.log(JSON.stringify({
  url: page.url(),
  tokenKept: await page.evaluate(() => localStorage.getItem('accessToken') !== null),
  outageShown: await page.getByRole('button', { name: /retry|tentar/i }).isVisible(),
}));
```
Expected: `url` is still `/orders` (not `/login`), `tokenKept: true`, `outageShown: true`.

- [ ] **Step 8: Logout check (Review Focus 5)**

After a login, click the account chip, then the logout item. Then:
```js
const hasCookie = (await ctx.cookies('http://localhost:8080/api/auth/refresh')).some(c => c.name === 'refreshToken');
const status = await page.evaluate(async () => (await fetch('http://localhost:8080/api/auth/refresh', {
  method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}',
})).status);
await page.goBack();
await page.waitForTimeout(1000);
console.log(JSON.stringify({ hasCookie, status, url: page.url() }));
```
Expected: `{"hasCookie":false,"status":401,"url":"http://localhost:3000/login"}`

- [ ] **Step 9: Patch the manifest (same commit)**

Read `x-maintenance` first. Patch only these spots and leave every other line byte-identical:
- `info.version: "0.3.0"` → `"0.4.0"`.
- `components.schemas.Error.properties.code.description`: append `ORIGIN_NOT_ALLOWED` to the Known list.
- `AuthResponse.description`: replace the `LIVE today:` sentence with: `LIVE since backend Phase 1 (2026-09-25): body still carries refreshToken for older clients, plus the Set-Cookie; the frontend ignores the body value and no longer stores it.`
- `/auth/refresh` description: append: `DECIDED 2026-09-25 (backend Phase 1): cookie wins, body refreshToken is an optional fallback (no token from either -> 401); reuse of a used/revoked token revokes the whole family, strict, no grace window; the lookup row-locks so two concurrent refreshes cannot both succeed. The frontend therefore single-flights refresh across tabs (Web Locks) and re-reads the access token another tab wrote before rotating again. The Origin check applies only when the token came from the cookie.` Change the `'403'` response description to `'Origin missing or not allowed (code ORIGIN_NOT_ALLOWED); only when the token came from the cookie. The frontend treats it as an outage, not a logout.'`
- `/auth/logout` description: append `LIVE since backend Phase 1: revokes the whole family.`
- Under the Auth description or at `/auth/reset-password`, if that path exists (it doesn't today, so add one line to the Auth tag description instead): `A successful password reset revokes every refresh token of the user (backend Phase 1); the frontend also drops the local session on success.`
- New `x-changelog` entry at the **top**:
```yaml
  - version: "0.4.0"
    date: 2026-09-25
    changes:
      - 'Auth: recorded backend Phase 1 behavior - refresh cookie live (body refreshToken kept for older clients, optional on /auth/refresh), token families with strict reuse revocation (no grace window), row-locked refresh, 403 ORIGIN_NOT_ALLOWED only on cookie-sourced tokens, logout revokes the family, password reset revokes all refresh tokens.'
      - 'Frontend: stops storing the refresh token (cookie only, one-time body migration for pre-cookie sessions), sends withCredentials on /auth calls, single-flights refresh across tabs, treats ORIGIN_NOT_ALLOWED as an outage.'
      - 'Error.code: ORIGIN_NOT_ALLOWED added to the known list.'
    why: 'Backend Phase 1 decisions (strict no-grace reuse detection, password-reset revocation) require the frontend to never race two refreshes and to move to the cookie.'
    breaking: 'None on the wire: additive. Access token stays in localStorage for now; moving it to memory (the full TARGET) is a later coordinated change.'
```
Validate: `python -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" docs/superpowers/specs/2026-09-14-backend-integration-manifest.openapi.yaml` exits 0. Then `git diff --stat` on the manifest shows only the touched lines.

- [ ] **Step 10: Confirm with the user, then commit**

These are auth-sensitive files, so show the diff and wait for explicit confirmation. Then:
```bash
git commit -m "feat(auth): refresh token via HttpOnly cookie, drop it from localStorage

<body; include any Task 1 drift>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- \
  src/api/client.ts src/features/auth/services/auth.service.ts src/features/auth/hooks/useLogin.ts \
  src/types/auth.tsx docs/superpowers/specs/2026-09-14-backend-integration-manifest.openapi.yaml
git push -u origin Claude-Assisted-Development
```

---

### Task 3: Single-flight refresh across tabs (Web Locks)

**Files:**
- Modify: `src/api/client.ts` (`refreshSession` from Task 2, plus a new `withRefreshLock` helper)
- Test: `$SCRATCH/verify-two-tabs.mjs` (not committed)

**Interfaces:**
- Consumes: `postRefresh(): Promise<string>`, `refreshSession(): Promise<string>`, `ORIGIN_NOT_ALLOWED` from Task 2.
- Produces: `refreshSession()` with the same signature. Callers (`ProtectedLayout.tsx`, the 401 interceptor) are unchanged.

- [ ] **Step 1: Write the two-tab check**

`$SCRATCH/verify-two-tabs.mjs`:
```js
import { chromium } from 'playwright';
const [email, password] = [process.env.TEST_EMAIL, process.env.TEST_PASSWORD];
const browser = await chromium.launch();
const ctx = await browser.newContext();
let refreshCalls = 0;
ctx.on('request', (r) => { if (r.url().endsWith('/api/auth/refresh') && r.method() === 'POST') refreshCalls++; });
const a = await ctx.newPage();
await a.goto('http://localhost:3000/login');
await a.getByLabel(/email/i).fill(email);
await a.getByLabel(/password/i).first().fill(password);
await a.getByRole('button', { name: /sign in|log in|entrar/i }).click();
await a.waitForURL('**/home');
const b = await ctx.newPage();
await b.goto('http://localhost:3000/home');
// Expire the access token (localStorage is shared), then load both tabs at the same moment.
await a.evaluate(() => localStorage.setItem('accessToken', 'x.eyJleHAiOjF9.x'));
refreshCalls = 0;
await Promise.all([a.goto('http://localhost:3000/orders'), b.goto('http://localhost:3000/profile')]);
await Promise.all([a.waitForURL('**/orders'), b.waitForURL('**/profile')]);
await a.waitForTimeout(1500);
// A real authenticated call after the race: fails with 401 -> /login if the family was revoked.
await b.reload();
await b.waitForTimeout(1500);
console.log(JSON.stringify({ refreshCalls, a: a.url(), b: b.url() }));
await browser.close();
```

- [ ] **Step 2: Run it against the Task 2 code to see it fail**

Run: `node "$SCRATCH/verify-two-tabs.mjs"`
Expected (bug reproduced): `refreshCalls: 2`, and at least one of `a`/`b` ends on `/login` because the second refresh counted as reuse. If it doesn't reproduce on a given run (timing), run it up to three times. One reproduction is enough. If it never reproduces, say so in the task report and continue. The Step 4 assertion still holds.

- [ ] **Step 3: Implement the lock**

In `src/api/client.ts`, add above `refreshSession`:
```ts
// Web Locks serialize refresh across every tab of this origin. They need a secure context
// (https or localhost); where unavailable, fall back to the in-tab dedupe alone.
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator.locks?.request !== 'function') return fn();
  return navigator.locks.request('order-ui:auth-refresh', fn);
}
```
Replace the body of `refreshInFlight = (async () => { ... })()` with a lock-wrapped version:
```ts
export function refreshSession(): Promise<string> {
  if (!refreshInFlight) {
    // The token that triggered this refresh. If localStorage holds a different one once we get
    // the lock, another tab already rotated: reuse its token. Rotating again would only waste a
    // rotation, and in the legacy body path it would spend a token that tab already used.
    const staleAccessToken = localStorage.getItem('accessToken');
    refreshInFlight = withRefreshLock(async () => {
      const current = localStorage.getItem('accessToken');
      if (current && current !== staleAccessToken) return current;
      try {
        return await postRefresh();
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const code = isAxiosError(error)
          ? (error.response?.data as { code?: string } | undefined)?.code
          : undefined;
        if (status !== undefined && status >= 400 && status < 500 && code !== ORIGIN_NOT_ALLOWED) {
          endSession();
        }
        throw error;
      }
    }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
```
Update the comment above `refreshSession` to say concurrent callers share one request **in this tab**, and the Web Lock serializes tabs.

- [ ] **Step 4: Re-run the two-tab check**

Run: `node "$SCRATCH/verify-two-tabs.mjs"` three times.
Expected every run: `{"refreshCalls":1,"a":"http://localhost:3000/orders","b":"http://localhost:3000/profile"}`

- [ ] **Step 5: No-Web-Locks fallback check (Review Focus 3)**

Copy the Step 1 script to `$SCRATCH/verify-no-locks.mjs` and add, right after `browser.newContext()`:
```js
await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true }));
```
Only load tab `a` (drop tab `b`), expire the token, and go to `/orders`.
Expected: `refreshCalls: 1`, `a` ends on `/orders`, and there's no `TypeError` in `a.on('pageerror')` output.

- [ ] **Step 6: Lint and type-check**

Run: `yarn lint && yarn build`
Expected: clean. If TS rejects `navigator.locks?.request` as always defined, keep the optional chain and the `typeof` guard (the runtime can lack it). Only add `// eslint-disable-next-line` with a reason if a type-aware rule actually fires.

- [ ] **Step 7: Confirm with the user, then commit**

```bash
git commit -m "fix(auth): single-flight token refresh across tabs with Web Locks

<body>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- src/api/client.ts
git push -u origin Claude-Assisted-Development
```

---

### Task 4: Password reset drops the local session

The backend revokes every refresh token on reset, but the access token in this browser stays valid for up to 24h. After a successful reset, this browser shouldn't still look logged in.

**Files:**
- Modify: `src/features/auth/hooks/useResetPassword.ts:9-11`

**Interfaces:**
- Consumes: `clearSession(): void` from `@/api/client` (Task 2).

- [ ] **Step 1: Write the check**

`$SCRATCH/verify-reset.mjs`: log in (as in Task 3 Step 1), then in the same context route the reset call so no real password changes:
```js
await a.route('**/api/auth/reset-password', (r) => r.fulfill({ status: 200, body: '' }));
await a.goto('http://localhost:3000/reset-password?token=fake');
await a.getByLabel(/^new password|^password/i).first().fill('Passw0rd!x');
await a.getByLabel(/confirm/i).fill('Passw0rd!x');
await a.getByRole('button', { name: /reset/i }).click();
await a.waitForTimeout(800);
console.log(JSON.stringify({
  tokenGone: await a.evaluate(() => localStorage.getItem('accessToken') === null),
  successShown: await a.getByText(/success|updated|redefinida/i).first().isVisible(),
}));
```

- [ ] **Step 2: Run it to see it fail**

Expected: `tokenGone: false`, `successShown: true`.

- [ ] **Step 3: Implement**

`src/features/auth/hooks/useResetPassword.ts`: add `import { clearSession } from '@/api/client';` and change `onSuccess`:
```ts
    onSuccess: () => {
      // The backend revoked every refresh token of this user; drop the local access token too so
      // this browser doesn't stay signed in on it until it expires. No redirect: the form shows
      // its own success state with a link to /login.
      clearSession();
      onSuccessCallback();
    },
```

- [ ] **Step 4: Re-run the check**

Expected: `{"tokenGone":true,"successShown":true}`

- [ ] **Step 5: Lint, build, confirm with the user, commit**

Run: `yarn lint && yarn build` and make sure both are clean. Then:
```bash
git commit -m "fix(auth): clear the local session after a successful password reset

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- src/features/auth/hooks/useResetPassword.ts
git push -u origin Claude-Assisted-Development
```

---

### Task 5: End-to-end confirmation and JWT claims

No code changes unless something fails. One `ui-behavior-verifier` dispatch through the `verify-ui` skill (pinned to sonnet), against the real backend with real credentials.

- [ ] **Step 1: Claims render on first paint**

`extractUserFromStorage` (`src/features/auth/utils/auth.utils.ts:78-84`) already reads `payload.firstName`, `lastName` and `email`, and `useProfileSummary` falls back to them while `GET /me/profile` loads. Check: log in, block `**/api/me/profile` with a never-resolving route, reload `/home`, and confirm the sidebar chip shows the real name, not the email or "Account". If it shows the email, decode the token (`parseJwt`) and compare the claim names with Task 1's api-docs before changing anything.

- [ ] **Step 2: Full regression pass**

Dispatch the verifier with these scenarios: login → `/home`; F5 on `/orders` with a valid token (no refresh call); an expired token on one tab (one refresh); logout → `/login` and the cookie cleared; register → the login flow still works.
Expected: all pass. Any failure goes back to the owning task. Don't iterate fixes through repeated dispatches (repo rule). Resume the same verifier with `SendMessage` for a re-check.

- [ ] **Step 3: Final gate**

Run: `yarn lint && yarn build`, then `git status` and check that only the intended files changed and nothing from `.playwright-cli/`, `.vite/` or the scratchpad got staged.

---

## Out of scope (explicit)

- Access token in memory with a boot-time refresh (the manifest's full TARGET). It needs a `ProtectedLayout`/`useAuth` rewrite and cross-tab token sharing over `BroadcastChannel`, so it's a separate plan once the backend drops `refreshToken` from the body.
- Pushing logout from one tab to the other tabs immediately. Today a stale tab finds out at its next refresh (401 → `/login`), which is acceptable.
- Adding a test runner (Vitest). Worth proposing separately, since `refreshSession` is now the most test-worthy code in the repo.
