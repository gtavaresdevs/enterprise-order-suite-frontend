# Restaurant Ops Phase 5 — Administration (real backend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three "Coming Soon" Administration pages (Users, Administrators, Roles) with a
real implementation wired to the live backend: a merged **Team** page (`GET /users`, `GET
/users/{id}`, invite/edit/role-change/deactivate/reactivate/resend-setup-email), a read-only
**Roles** reference page (`GET /roles`), and a new **Audit Log** page (`GET
/admin/identity-audit`).

**Architecture:** `features/administration` keeps its existing folder but is split into three
sibling sub-features that each follow the standard `components/hooks/services` shape: Team, Roles,
Audit Log. All three call the real API via `src/api/client.ts` (the same pattern already used by
`auth`/`profile`), using TanStack Query for server state (queryKey per resource, mutations
invalidate the relevant list). No new UI library — components are hand-built Tailwind markup
using existing `components/ui/*` primitives (`Input`, `Label`, `Button`, `Select`), matching the
visual style already established by `features/orders` and `features/tables` (fixed-overlay modals,
slate/mono "Outfit" aesthetic, no shadcn `Table`/`Dialog`).

**Tech Stack:** React + TypeScript, TanStack React Query, Axios (`src/api/client.ts`), Tailwind,
`lucide-react` icons, existing `components/ui/{input,label,button,select,badge,skeleton}`.

**Spec:** `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` (sections
"Administration reshaped around the real backend" and "`features/administration` — real
implementation, not 'Coming Soon'") and `docs/superpowers/plans/RESTAURANT-OPS-ROADMAP.md` ("Phase
5" goal). This plan also captures the live OpenAPI contract fetched from
`http://localhost:8080/api/v3/api-docs` on 2026-09-13, which is the authority for exact field names
below (the spec doc was written from a 2026-09-09 snapshot and does not itemize every field).

## Global Constraints

- `@/*` path alias only, never relative `../../` imports.
- No test suite exists — `yarn build` (`tsc -b && vite build`) and `yarn lint` are the only
  automated safety net for every task.
- Types (`src/types/administration.ts`) and service changes land together in the same task.
- No new data-fetching/state library — TanStack Query only.
- Never show a `MenuItem` where `available === false` — not touched by this phase, but stays true
  repo-wide.
- Do NOT run `git stash` in any worktree — `.git` is shared across all worktrees in this repo.
- Always commit with an explicit pathspec (`git commit -m "..." -- <files>`), never a bare
  `git commit -m "..."`.
- Limit Playwright/browser verification to *confirming* a fix already reasoned out from source — at
  most one dispatch, at the very end of the whole plan (Task 7), using the real test-login
  credentials (see the `order-ui-test-login` memory / `connect-backend` skill), never a synthetic
  JWT.
- `/administration/*` routes stay inside `ProtectedLayout`/`AppLayout` + `RoleGuard`, per this
  repo's existing pattern — nothing in this phase is public-facing.

## Live API contract (fetched 2026-09-13 from `/api/v3/api-docs`)

```
GET    /users?page&size              -> PagedResponseUserSummaryResponse
GET    /users/{id}                   -> UserDetailResponse
POST   /admin/users                  <- AdminCreateUserRequest -> AdminCreateUserResponse
PATCH  /admin/users/{id}              <- AdminUpdateUserRequest -> AdminUpdateUserResponse
PATCH  /admin/users/{id}/role         <- SetUserRoleRequest -> UserStatusResponse
POST   /admin/users/{id}/deactivate  -> UserStatusResponse
POST   /admin/users/{id}/reactivate  -> UserStatusResponse
POST   /admin/users/{id}/password-setup -> 200 (empty body)
GET    /admin/users/{id}/status      -> UserStatusResponse   (not used by this plan — status is
                                          already returned by deactivate/reactivate/setRole)
GET    /roles                        -> RoleResponse[]
GET    /admin/identity-audit?page&size -> PagedResponseIdentityAuditEventResponse
```

Schemas (only the fields that exist — this is the authoritative shape, not the spec doc's guess):

```ts
// AdminCreateUserRequest
{ email: string; firstName: string; lastName: string; role?: string; sendPasswordSetupEmail?: boolean }
// AdminCreateUserResponse
{ id: number; email: string; role: string; active: boolean; createdAt: string }
// AdminUpdateUserRequest
{ firstName?: string; lastName?: string; email: string }   // email required by the backend even on edit
// AdminUpdateUserResponse
{ id: number; firstName: string; lastName: string; email: string; updatedAt: string }
// UserStatusResponse
{ userId: number; active: boolean }
// SetUserRoleRequest
{ role: string }   // minLength 1
// RoleResponse
{ id: number; name: string }
// PagedResponse<T>
{ items: T[]; page: number; size: number; totalItems: number; totalPages: number }
// UserSummaryResponse  (GET /users list rows — NO firstName/lastName)
{ id: number; email: string; role: string; active: boolean; createdAt: string; updatedAt: string }
// UserDetailResponse   (GET /users/{id} — HAS firstName/lastName)
{ id: number; email: string; role: string; active: boolean; firstName: string; lastName: string; createdAt: string; updatedAt: string }
// IdentityAuditEventResponse
{ id: number; type: string; actorUserId: number; targetUserId?: number; metadata: unknown; createdAt: string }
```

**Backend gap to flag in the UI (not a bug to work around):** `GET /users` rows carry no name, only
`email`/`role`/`active`/dates — the Team list table shows email as the primary identifier; full
name only appears once a row is expanded into the detail drawer (`GET /users/{id}`). Don't invent a
`name` field or fetch every detail row just to backfill a list column — that's an N+1 the backend
doesn't support pagination-efficiently.

**Role gating decision:** the backend's admin-managed roles (`GET /roles` — freeform `name` per
tenant) are a different concept from this frontend's own three-value `Role` union
(`src/types/auth.ts` — `'SUPER_ADMIN' | 'ADMIN' | 'USER'`, decoded from the JWT for route
gating). Do not conflate them: a user's `role` field from the backend is typed as a plain `string`
in `src/types/administration.ts`; `RoleGuard`/nav gating keeps using the JWT-derived `Role` type
unchanged. Per-action gating beyond the existing page-level `RoleGuard` (e.g. "only SUPER_ADMIN can
deactivate") is not in the spec and the backend already enforces its own authorization — don't
invent extra frontend role checks the spec doesn't ask for.

---

### Task 1: Types + Team service

**Files:**
- Modify: `src/types/administration.ts` (full rewrite)
- Create: `src/features/administration/services/team.service.ts`
- Delete: `src/features/administration/services/administration.service.ts`

**Interfaces:**
- Produces: `PagedResponse<T>`, `UserSummary`, `UserDetail`, `RoleOption`, `AuditEvent`,
  `CreateUserRequest`, `UpdateUserRequest`, `SetUserRoleRequest`, `UserStatusResponse`,
  `AdministrationPageId` (now `"team" | "roles" | "audit-log"`), and `teamService` with methods
  `listUsers`, `getUser`, `inviteUser`, `updateUser`, `setUserRole`, `deactivateUser`,
  `reactivateUser`, `resendPasswordSetup` — consumed by Task 2/3's hook.

- [ ] **Step 1: Rewrite the types file**

```ts
// src/types/administration.ts
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types/auth";

export type AdministrationPageId = "team" | "roles" | "audit-log";

export interface AdministrationPageConfig {
    id: AdministrationPageId;
    title: string;
    description: string;
    icon: LucideIcon;
    roles: Role[];
    route: string;
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface UserSummary {
    id: number;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserDetail extends UserSummary {
    firstName: string;
    lastName: string;
}

export interface RoleOption {
    id: number;
    name: string;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    sendPasswordSetupEmail?: boolean;
}

export interface UpdateUserRequest {
    email: string;
    firstName?: string;
    lastName?: string;
}

export interface SetUserRoleRequest {
    role: string;
}

export interface UserStatusResponse {
    userId: number;
    active: boolean;
}

export interface AuditEvent {
    id: number;
    type: string;
    actorUserId: number;
    targetUserId?: number;
    metadata: unknown;
    createdAt: string;
}
```

- [ ] **Step 2: Delete the mock service**

Delete `src/features/administration/services/administration.service.ts` — its only consumer
(`useAdministrationPage.ts`) is deleted in Task 6.

- [ ] **Step 3: Write the Team service**

```ts
// src/features/administration/services/team.service.ts
import api from "@/api/client";
import type {
    PagedResponse,
    UserSummary,
    UserDetail,
    CreateUserRequest,
    UpdateUserRequest,
    SetUserRoleRequest,
    UserStatusResponse,
} from "@/types/administration";

export const teamService = {
    // GET /api/users?page&size
    listUsers: async (page: number, size: number): Promise<PagedResponse<UserSummary>> => {
        const { data } = await api.get<PagedResponse<UserSummary>>("/users", {
            params: { page, size },
        });
        return data;
    },

    // GET /api/users/{id}
    getUser: async (id: number): Promise<UserDetail> => {
        const { data } = await api.get<UserDetail>(`/users/${id}`);
        return data;
    },

    // POST /api/admin/users
    inviteUser: async (request: CreateUserRequest): Promise<void> => {
        await api.post("/admin/users", request);
    },

    // PATCH /api/admin/users/{id}
    updateUser: async (id: number, request: UpdateUserRequest): Promise<void> => {
        await api.patch(`/admin/users/${id}`, request);
    },

    // PATCH /api/admin/users/{id}/role
    setUserRole: async (id: number, request: SetUserRoleRequest): Promise<UserStatusResponse> => {
        const { data } = await api.patch<UserStatusResponse>(`/admin/users/${id}/role`, request);
        return data;
    },

    // POST /api/admin/users/{id}/deactivate
    deactivateUser: async (id: number): Promise<UserStatusResponse> => {
        const { data } = await api.post<UserStatusResponse>(`/admin/users/${id}/deactivate`);
        return data;
    },

    // POST /api/admin/users/{id}/reactivate
    reactivateUser: async (id: number): Promise<UserStatusResponse> => {
        const { data } = await api.post<UserStatusResponse>(`/admin/users/${id}/reactivate`);
        return data;
    },

    // POST /api/admin/users/{id}/password-setup
    resendPasswordSetup: async (id: number): Promise<void> => {
        await api.post(`/admin/users/${id}/password-setup`);
    },
};
```

- [ ] **Step 4: Verify types compile**

Run: `yarn tsc -b --incremental false 2>&1 | grep administration` (or just `yarn build` once other
consumers are updated in later tasks — at this point `administration.constants.ts` and the old
components/hooks still reference the removed `ADMINISTRATION_PAGES`/`AdministrationPageStatus`
shape, so expect errors there until Task 6; that's fine, don't chase them yet).

- [ ] **Step 5: Commit**

```bash
git add src/types/administration.ts src/features/administration/services/team.service.ts
git rm src/features/administration/services/administration.service.ts
git commit -m "feat(administration): add real Team service against live backend" -- \
  src/types/administration.ts \
  src/features/administration/services/team.service.ts \
  src/features/administration/services/administration.service.ts
```

---

### Task 2: `useTeam` hook + paginated Team list UI

**Files:**
- Create: `src/features/administration/hooks/useTeam.ts`
- Create: `src/features/administration/components/Pagination.tsx`
- Create: `src/features/administration/components/StatusPill.tsx`
- Create: `src/features/administration/components/TeamFeature.tsx`

**Interfaces:**
- Consumes: `teamService` (Task 1), `PagedResponse<UserSummary>` (Task 1).
- Produces: `useTeam(page, size)` returning `{ data, isLoading, isError, invite, isInviting,
  update, isUpdating, setRole, isSettingRole, deactivate, reactivate, resendSetup }`; `<Pagination
  page size totalPages onPageChange />`; `<StatusPill active />`; `<TeamFeature />` (default export
  target for the page) — consumed by Task 3's drawer/modal and Task 6's page wiring.

- [ ] **Step 1: Write the hook**

```ts
// src/features/administration/hooks/useTeam.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "../services/team.service";
import type { CreateUserRequest, UpdateUserRequest, SetUserRoleRequest } from "@/types/administration";

export const PAGE_SIZE = 20;

export function useTeam(page: number) {
    const queryClient = useQueryClient();
    const queryKey = ["users", page, PAGE_SIZE] as const;

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => teamService.listUsers(page, PAGE_SIZE),
    });

    const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] });

    const inviteMutation = useMutation({
        mutationFn: (request: CreateUserRequest) => teamService.inviteUser(request),
        onSuccess: invalidateUsers,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, request }: { id: number; request: UpdateUserRequest }) =>
            teamService.updateUser(id, request),
        onSuccess: invalidateUsers,
    });

    const setRoleMutation = useMutation({
        mutationFn: ({ id, request }: { id: number; request: SetUserRoleRequest }) =>
            teamService.setUserRole(id, request),
        onSuccess: invalidateUsers,
    });

    const deactivateMutation = useMutation({
        mutationFn: (id: number) => teamService.deactivateUser(id),
        onSuccess: invalidateUsers,
    });

    const reactivateMutation = useMutation({
        mutationFn: (id: number) => teamService.reactivateUser(id),
        onSuccess: invalidateUsers,
    });

    const resendSetupMutation = useMutation({
        mutationFn: (id: number) => teamService.resendPasswordSetup(id),
    });

    return {
        data,
        isLoading,
        isError,
        invite: inviteMutation.mutateAsync,
        isInviting: inviteMutation.isPending,
        update: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        setRole: setRoleMutation.mutateAsync,
        isSettingRole: setRoleMutation.isPending,
        deactivate: deactivateMutation.mutate,
        isDeactivating: deactivateMutation.isPending,
        reactivate: reactivateMutation.mutate,
        isReactivating: reactivateMutation.isPending,
        resendSetup: resendSetupMutation.mutate,
        isResendingSetup: resendSetupMutation.isPending,
    };
}
```

- [ ] **Step 2: Write the shared Pagination component**

```tsx
// src/features/administration/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-400 font-mono">
                Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 0}
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Write the StatusPill component**

```tsx
// src/features/administration/components/StatusPill.tsx
export function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-xs font-medium tracking-wide ${
                active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
            {active ? "Active" : "Inactive"}
        </span>
    );
}
```

- [ ] **Step 4: Write TeamFeature (list only — invite/detail wired in Task 3)**

```tsx
// src/features/administration/components/TeamFeature.tsx
import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { useTeam } from "@/features/administration/hooks/useTeam";
import { Pagination } from "./Pagination";
import { StatusPill } from "./StatusPill";
import { AdministrationHeader } from "./AdministrationHeader";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { InviteUserModal } from "./InviteUserModal";
import type { UserSummary } from "@/types/administration";

export function TeamFeature() {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useTeam(page);
    const [selected, setSelected] = useState<UserSummary | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-8 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <AdministrationHeader
                        title="Team"
                        description="Manage user accounts, invitations, roles, and access."
                    />
                    <button
                        onClick={() => setInviteOpen(true)}
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-slate-950 text-slate-50 text-sm font-semibold border border-slate-800 shadow-inner hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" /> Invite User
                    </button>
                </div>

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.8fr] gap-4 items-center px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                        {["Email", "Role", "Status", "Created"].map((col) => (
                            <span key={col} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{col}</span>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400 font-mono animate-pulse">Loading team...</p>
                        </div>
                    ) : isError ? (
                        <div className="py-16 flex flex-col items-center gap-2">
                            <p className="text-sm text-slate-400">Couldn't load the team list.</p>
                        </div>
                    ) : data && data.items.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <Users className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-400">No users yet.</p>
                        </div>
                    ) : (
                        data?.items.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => setSelected(u)}
                                className="w-full grid grid-cols-[1.5fr_0.8fr_0.6fr_0.8fr] gap-4 items-center px-5 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors text-left"
                            >
                                <span className="text-sm text-slate-800 truncate">{u.email}</span>
                                <span className="text-xs font-mono text-slate-500">{u.role}</span>
                                <StatusPill active={u.active} />
                                <span className="text-xs text-slate-400 font-mono">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                            </button>
                        ))
                    )}

                    {data && (
                        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
                    )}
                </div>
            </div>

            {selected && <UserDetailDrawer userId={selected.id} onClose={() => setSelected(null)} />}
            {inviteOpen && <InviteUserModal onClose={() => setInviteOpen(false)} />}
        </div>
    );
}
```

Note: this step references `UserDetailDrawer` and `InviteUserModal`, which Task 3 creates — this
task's build will fail (missing modules) until Task 3 lands. That's expected and acceptable since
tasks 2 and 3 are reviewed together as one feature slice; if the reviewer wants Task 2 buildable in
isolation, stub both as `function UserDetailDrawer() { return null; }` /
`function InviteUserModal() { return null; }` at the bottom of this same file temporarily and
delete the stubs in Task 3 — prefer building Task 3 immediately after so this doesn't linger.

- [ ] **Step 5: Commit**

```bash
git add src/features/administration/hooks/useTeam.ts \
  src/features/administration/components/Pagination.tsx \
  src/features/administration/components/StatusPill.tsx \
  src/features/administration/components/TeamFeature.tsx
git commit -m "feat(administration): add Team list UI with pagination" -- \
  src/features/administration/hooks/useTeam.ts \
  src/features/administration/components/Pagination.tsx \
  src/features/administration/components/StatusPill.tsx \
  src/features/administration/components/TeamFeature.tsx
```

---

### Task 3: User detail drawer + invite modal + role/status actions

**Files:**
- Create: `src/features/administration/components/UserDetailDrawer.tsx`
- Create: `src/features/administration/components/InviteUserModal.tsx`

**Interfaces:**
- Consumes: `useTeam` (Task 2, called again here — hooks are cheap, TanStack Query dedupes by
  queryKey so a second `useTeam(0)` call inside the drawer doesn't refetch the list), `teamService`
  (Task 1 — drawer calls `teamService.getUser` directly via its own `useQuery` since the detail
  shape differs from the list), `useRoles` (Task 4 — role `<select>` options; if Task 4 hasn't
  landed yet when this task is implemented, hardcode the role options list is NOT acceptable —
  implement Task 4 first, or inline a minimal `useQuery(["roles"], () =>
  api.get("/roles").then(r => r.data))` here and delete it once Task 4's `useRoles` exists).
- Produces: `<UserDetailDrawer userId onClose />`, `<InviteUserModal onClose />` — consumed by
  Task 2's `TeamFeature`.

- [ ] **Step 1: Write the detail drawer**

```tsx
// src/features/administration/components/UserDetailDrawer.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Mail, Shield } from "lucide-react";
import { teamService } from "@/features/administration/services/team.service";
import { useTeam } from "@/features/administration/hooks/useTeam";
import { useRoles } from "@/features/administration/hooks/useRoles";
import { StatusPill } from "./StatusPill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function UserDetailDrawer({ userId, onClose }: { userId: number; onClose: () => void }) {
    const { data: user, isLoading } = useQuery({
        queryKey: ["users", "detail", userId],
        queryFn: () => teamService.getUser(userId),
    });
    const { roles } = useRoles();
    const { update, isUpdating, setRole, isSettingRole, deactivate, reactivate, resendSetup } =
        useTeam(0);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
        }
    }, [user]);

    if (isLoading || !user) {
        return (
            <>
                <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={onClose} />
                <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl flex items-center justify-center">
                    <p className="text-sm text-slate-400 font-mono animate-pulse">Loading user...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl shadow-slate-900/20 flex flex-col border-l border-slate-200">
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{user.firstName} {user.lastName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusPill active={user.active} />
                            <span className="text-xs text-slate-400 font-mono">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8 h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">First name</Label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Last name</Label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                        </div>
                    </div>
                    <Button
                        onClick={() => update({ id: userId, request: { email, firstName, lastName } })}
                        disabled={isUpdating || !email.trim()}
                        className="h-9 rounded-[8px] bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800"
                    >
                        {isUpdating ? "Saving..." : "Save changes"}
                    </Button>

                    <div className="h-px bg-slate-100" />

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> Role
                        </Label>
                        <Select
                            value={user.role}
                            onValueChange={(role) => setRole({ id: userId, request: { role } })}
                            disabled={isSettingRole}
                        >
                            <SelectTrigger className="h-9 rounded-[8px] bg-slate-50 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="flex flex-col gap-2">
                        {user.active ? (
                            <Button variant="outline" onClick={() => deactivate(userId)} className="h-9 rounded-[8px] border-red-200 text-red-600 hover:bg-red-50">
                                Deactivate
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => reactivate(userId)} className="h-9 rounded-[8px] border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                                Reactivate
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => resendSetup(userId)} className="h-9 rounded-[8px] border-slate-200 text-slate-600 hover:bg-slate-100">
                            Resend password setup email
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Write the invite modal**

```tsx
// src/features/administration/components/InviteUserModal.tsx
import { useState } from "react";
import { X, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTeam } from "@/features/administration/hooks/useTeam";
import { useRoles } from "@/features/administration/hooks/useRoles";

export function InviteUserModal({ onClose }: { onClose: () => void }) {
    const { invite, isInviting } = useTeam(0);
    const { roles } = useRoles();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [sendPasswordSetupEmail, setSendPasswordSetupEmail] = useState(true);
    const [error, setError] = useState("");

    async function handleSubmit() {
        if (!email.trim() || !firstName.trim() || !lastName.trim()) {
            setError("Email, first name, and last name are required.");
            return;
        }
        setError("");
        try {
            await invite({
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                role: role || undefined,
                sendPasswordSetupEmail,
            });
            onClose();
        } catch {
            setError("Couldn't invite this user. Check the email isn't already in use.");
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-900">Invite User</h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8 h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">First name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-8 h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Last name</Label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="h-9 rounded-[8px] bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Default role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <Checkbox checked={sendPasswordSetupEmail} onCheckedChange={(v) => setSendPasswordSetupEmail(!!v)} />
                            Send password setup email
                        </label>
                        {error && <p className="text-xs text-red-600">{error}</p>}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px]">
                        <Button variant="outline" onClick={onClose} className="h-9 rounded-[8px] border-slate-200 text-slate-600 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isInviting} className="h-9 rounded-[8px] bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800">
                            {isInviting ? "Inviting..." : "Invite"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
```

Note: `components/ui/checkbox.tsx` already exists in this repo (confirmed via `ls
src/components/ui`) — reuse it, don't hand-roll a checkbox.

- [ ] **Step 3: Verify build (Team slice is now complete)**

Run: `yarn tsc -b` — expect no errors from `features/administration/**` at this point (Task 4's
`useRoles` must exist first since both new files import it — if doing tasks strictly in order,
implement Task 4 before this step, or swap Task 3/4 order; either is fine, they don't depend on
each other except for this import).

- [ ] **Step 4: Commit**

```bash
git add src/features/administration/components/UserDetailDrawer.tsx \
  src/features/administration/components/InviteUserModal.tsx
git commit -m "feat(administration): add user detail drawer and invite modal" -- \
  src/features/administration/components/UserDetailDrawer.tsx \
  src/features/administration/components/InviteUserModal.tsx
```

---

### Task 4: Roles reference page

**Files:**
- Create: `src/features/administration/services/roles.service.ts`
- Create: `src/features/administration/hooks/useRoles.ts`
- Create: `src/features/administration/components/RolesFeature.tsx`

**Interfaces:**
- Produces: `rolesService.listRoles()`, `useRoles()` returning `{ roles, isLoading }` (consumed by
  Task 3's drawer/modal and this task's own `RolesFeature`), `<RolesFeature />`.

- [ ] **Step 1: Write the roles service**

```ts
// src/features/administration/services/roles.service.ts
import api from "@/api/client";
import type { RoleOption } from "@/types/administration";

export const rolesService = {
    // GET /api/roles
    listRoles: async (): Promise<RoleOption[]> => {
        const { data } = await api.get<RoleOption[]>("/roles");
        return data;
    },
};
```

- [ ] **Step 2: Write the hook**

```ts
// src/features/administration/hooks/useRoles.ts
import { useQuery } from "@tanstack/react-query";
import { rolesService } from "../services/roles.service";

export function useRoles() {
    const { data: roles = [], isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: rolesService.listRoles,
    });

    return { roles, isLoading };
}
```

- [ ] **Step 3: Write the Roles page**

```tsx
// src/features/administration/components/RolesFeature.tsx
import { KeySquare } from "lucide-react";
import { useRoles } from "@/features/administration/hooks/useRoles";
import { AdministrationHeader } from "./AdministrationHeader";

export function RolesFeature() {
    const { roles, isLoading } = useRoles();

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[700px] mx-auto px-6 py-8 flex flex-col gap-6">
                <AdministrationHeader
                    title="Roles"
                    description="Reference list of roles available in your organization."
                />
                <p className="text-xs text-slate-400 -mt-4">
                    Read-only — the backend currently exposes role names only, not custom permission sets.
                </p>

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400 font-mono animate-pulse">Loading roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <KeySquare className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-400">No roles found.</p>
                        </div>
                    ) : (
                        roles.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-b-0">
                                <div className="w-8 h-8 rounded-[8px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <KeySquare className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-800">{r.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Verify build**

Run: `yarn tsc -b` — should now be clean for everything except `AdministrationFeature.tsx`,
`ComingSoonPanel.tsx`, `useAdministrationPage.ts`, `administration.constants.ts`, and the router/nav
files, all handled in Task 6.

- [ ] **Step 5: Commit**

```bash
git add src/features/administration/services/roles.service.ts \
  src/features/administration/hooks/useRoles.ts \
  src/features/administration/components/RolesFeature.tsx
git commit -m "feat(administration): add read-only Roles reference page" -- \
  src/features/administration/services/roles.service.ts \
  src/features/administration/hooks/useRoles.ts \
  src/features/administration/components/RolesFeature.tsx
```

---

### Task 5: Audit Log page

**Files:**
- Create: `src/features/administration/services/auditLog.service.ts`
- Create: `src/features/administration/hooks/useAuditLog.ts`
- Create: `src/features/administration/components/AuditLogFeature.tsx`

**Interfaces:**
- Consumes: `PagedResponse<AuditEvent>`, `AuditEvent` (Task 1), `<Pagination>` (Task 2).
- Produces: `<AuditLogFeature />` — consumed by Task 6's page wiring.

- [ ] **Step 1: Write the audit log service**

```ts
// src/features/administration/services/auditLog.service.ts
import api from "@/api/client";
import type { PagedResponse, AuditEvent } from "@/types/administration";

export const auditLogService = {
    // GET /api/admin/identity-audit?page&size
    listEvents: async (page: number, size: number): Promise<PagedResponse<AuditEvent>> => {
        const { data } = await api.get<PagedResponse<AuditEvent>>("/admin/identity-audit", {
            params: { page, size },
        });
        return data;
    },
};
```

- [ ] **Step 2: Write the hook**

```ts
// src/features/administration/hooks/useAuditLog.ts
import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLog.service";

export const AUDIT_PAGE_SIZE = 20;

export function useAuditLog(page: number) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["identity-audit", page, AUDIT_PAGE_SIZE],
        queryFn: () => auditLogService.listEvents(page, AUDIT_PAGE_SIZE),
    });

    return { data, isLoading, isError };
}
```

- [ ] **Step 3: Write the Audit Log page**

```tsx
// src/features/administration/components/AuditLogFeature.tsx
import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditLog } from "@/features/administration/hooks/useAuditLog";
import { Pagination } from "./Pagination";
import { AdministrationHeader } from "./AdministrationHeader";

export function AuditLogFeature() {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useAuditLog(page);

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[900px] mx-auto px-6 py-8 flex flex-col gap-6">
                <AdministrationHeader
                    title="Audit Log"
                    description="Who did what to whom, and when — identity and access changes."
                />

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] gap-4 items-center px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                        {["Event", "Actor", "Target", "When"].map((col) => (
                            <span key={col} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{col}</span>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400 font-mono animate-pulse">Loading audit log...</p>
                        </div>
                    ) : isError ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400">Couldn't load the audit log.</p>
                        </div>
                    ) : data && data.items.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <ScrollText className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-400">No audit events yet.</p>
                        </div>
                    ) : (
                        data?.items.map((event) => (
                            <div key={event.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] gap-4 items-center px-5 py-3.5 border-b border-slate-50 last:border-b-0">
                                <span className="text-sm font-medium text-slate-800">{event.type}</span>
                                <span className="text-xs font-mono text-slate-500">#{event.actorUserId}</span>
                                <span className="text-xs font-mono text-slate-500">{event.targetUserId ? `#${event.targetUserId}` : "—"}</span>
                                <span className="text-xs text-slate-400 font-mono">{new Date(event.createdAt).toLocaleString()}</span>
                            </div>
                        ))
                    )}

                    {data && (
                        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
                    )}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/administration/services/auditLog.service.ts \
  src/features/administration/hooks/useAuditLog.ts \
  src/features/administration/components/AuditLogFeature.tsx
git commit -m "feat(administration): add Audit Log page" -- \
  src/features/administration/services/auditLog.service.ts \
  src/features/administration/hooks/useAuditLog.ts \
  src/features/administration/components/AuditLogFeature.tsx
```

---

### Task 6: Retire the old Coming-Soon plumbing, rewire routes/nav/pages/index

**Files:**
- Delete: `src/features/administration/components/AdministrationFeature.tsx`
- Delete: `src/features/administration/components/ComingSoonPanel.tsx`
- Delete: `src/features/administration/hooks/useAdministrationPage.ts`
- Modify: `src/features/administration/constants/administration.constants.ts`
- Modify: `src/features/administration/index.ts`
- Delete: `src/pages/AdministrationUsers.tsx`
- Delete: `src/pages/AdministrationAdministrators.tsx`
- Create: `src/pages/AdministrationTeam.tsx`
- Modify: `src/pages/AdministrationRoles.tsx`
- Create: `src/pages/AdministrationAuditLog.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/layouts/app-layout/navigation.ts`

**Interfaces:**
- Consumes: `TeamFeature` (Task 2), `RolesFeature` (Task 4), `AuditLogFeature` (Task 5).
- Produces: final route table for `/administration/*`.

- [ ] **Step 1: Delete the old Coming-Soon files**

```bash
git rm src/features/administration/components/AdministrationFeature.tsx \
  src/features/administration/components/ComingSoonPanel.tsx \
  src/features/administration/hooks/useAdministrationPage.ts \
  src/pages/AdministrationUsers.tsx \
  src/pages/AdministrationAdministrators.tsx
```

- [ ] **Step 2: Rewrite the constants file**

`AdministrationHeader` is reused as-is (Task 2/4/5 already import it directly, no config lookup
needed) — the old `ADMINISTRATION_PAGES`/`COMING_SOON_MESSAGE`/`ESTIMATED_RELEASE` exports are
fully retired since nothing "Coming Soon" remains.

```ts
// src/features/administration/constants/administration.constants.ts
// Intentionally empty of the retired "Coming Soon" config — kept as a file so a future
// administration-wide constant (e.g. a shared page-size default) has an obvious home.
export const ADMINISTRATION_PAGE_SIZE = 20;
```

- [ ] **Step 3: Rewrite index.ts**

```ts
// src/features/administration/index.ts
export { TeamFeature } from "@/features/administration/components/TeamFeature";
export { RolesFeature } from "@/features/administration/components/RolesFeature";
export { AuditLogFeature } from "@/features/administration/components/AuditLogFeature";
```

- [ ] **Step 4: Create the Team page**

```tsx
// src/pages/AdministrationTeam.tsx
import { TeamFeature } from "@/features/administration";

export default function AdministrationTeamPage() {
    return <TeamFeature />;
}
```

- [ ] **Step 5: Rewrite the Roles page**

```tsx
// src/pages/AdministrationRoles.tsx
import { RolesFeature } from "@/features/administration";

export default function AdministrationRolesPage() {
    return <RolesFeature />;
}
```

- [ ] **Step 6: Create the Audit Log page**

```tsx
// src/pages/AdministrationAuditLog.tsx
import { AuditLogFeature } from "@/features/administration";

export default function AdministrationAuditLogPage() {
    return <AuditLogFeature />;
}
```

- [ ] **Step 7: Update navigation.ts**

Replace the `ADMINISTRATION_ITEMS` children (drop `UserCog`/administrators, add `ScrollText` for
audit log):

```ts
// src/layouts/app-layout/navigation.ts — only the changed parts shown
import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Shield,
  Users,
  KeySquare,
  ScrollText,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@/types/auth";

// ... NavItem interface and NAVIGATION_ITEMS unchanged ...

export const ADMINISTRATION_ITEMS: NavItem[] = [
  {
    label: "Administration",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      { to: "/administration/team", label: "Team", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
      { to: "/administration/roles", label: "Roles", icon: KeySquare, roles: ["SUPER_ADMIN"] },
      { to: "/administration/audit-log", label: "Audit Log", icon: ScrollText, roles: ["SUPER_ADMIN"] },
    ],
  },
];
```

(Drop the `UserCog` import — it becomes unused once "Administrators" is removed; keep every other
import as-is.)

- [ ] **Step 8: Update the router**

```tsx
// src/app/router.tsx — only the changed parts shown

// replace these three imports:
//   import AdministrationUsersPage from '@/pages/AdministrationUsers';
//   import AdministrationAdministratorsPage from '@/pages/AdministrationAdministrators';
//   import AdministrationRolesPage from '@/pages/AdministrationRoles';
// with:
import AdministrationTeamPage from '@/pages/AdministrationTeam';
import AdministrationRolesPage from '@/pages/AdministrationRoles';
import AdministrationAuditLogPage from '@/pages/AdministrationAuditLog';

// replace the three '/administration/*' route entries with:
          {
            path: '/administration/team',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdministrationTeamPage />
              </RoleGuard>
            ),
          },
          {
            path: '/administration/roles',
            element: (
              <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                <AdministrationRolesPage />
              </RoleGuard>
            ),
          },
          {
            path: '/administration/audit-log',
            element: (
              <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                <AdministrationAuditLogPage />
              </RoleGuard>
            ),
          },

// and add two redirects alongside the existing '/security' redirect, so old bookmarked
// links don't 404:
      {
        path: '/administration/users',
        element: <Navigate to="/administration/team" replace />,
      },
      {
        path: '/administration/administrators',
        element: <Navigate to="/administration/team" replace />,
      },
```

- [ ] **Step 9: Full build + lint**

Run: `yarn build` (must complete with zero TypeScript errors) and `yarn lint` (must be clean). This
is the first point in the plan where the whole repo — not just `features/administration` — must
compile, since router/nav are shared files.

- [ ] **Step 10: Commit**

```bash
git add src/features/administration/constants/administration.constants.ts \
  src/features/administration/index.ts \
  src/pages/AdministrationTeam.tsx \
  src/pages/AdministrationRoles.tsx \
  src/pages/AdministrationAuditLog.tsx \
  src/app/router.tsx \
  src/layouts/app-layout/navigation.ts
git rm src/features/administration/components/AdministrationFeature.tsx \
  src/features/administration/components/ComingSoonPanel.tsx \
  src/features/administration/hooks/useAdministrationPage.ts \
  src/pages/AdministrationUsers.tsx \
  src/pages/AdministrationAdministrators.tsx
git commit -m "feat(administration): rewire routes/nav to Team/Roles/Audit Log pages" -- \
  src/features/administration/components/AdministrationFeature.tsx \
  src/features/administration/components/ComingSoonPanel.tsx \
  src/features/administration/hooks/useAdministrationPage.ts \
  src/features/administration/constants/administration.constants.ts \
  src/features/administration/index.ts \
  src/pages/AdministrationUsers.tsx \
  src/pages/AdministrationAdministrators.tsx \
  src/pages/AdministrationTeam.tsx \
  src/pages/AdministrationRoles.tsx \
  src/pages/AdministrationAuditLog.tsx \
  src/app/router.tsx \
  src/layouts/app-layout/navigation.ts
```

---

### Task 7: Whole-branch review, fix-loop, and browser verification

This task has no fixed code — it's the process step the roadmap always runs after the last
implementation task:

- [ ] **Step 1: Dispatch a final whole-branch review** (per `superpowers:subagent-driven-development`)
  covering every file touched across Tasks 1-6 together — this is what has historically caught
  cross-task defects the per-task reviews couldn't see (e.g. Phase 3's loading-flash bug, Phase 4's
  misplaced mock data).
- [ ] **Step 2: Apply any findings**, re-running `yarn build`/`yarn lint` after each fix.
- [ ] **Step 3: One browser verification pass** using the `verify-ui` skill (dispatches
  `ui-behavior-verifier`) against the real backend, logged in via the real test credentials (see
  `order-ui-test-login` memory) — not a synthetic JWT. Confirm at minimum:
  - `/administration/team` loads a real paginated user list, pagination controls work, opening a
    row shows the detail drawer with first/last name (proving `GET /users/{id}` works, not just the
    list).
  - Inviting a user, changing a role, and deactivating/reactivating a user all reflect immediately
    (list/drawer update after the mutation) without a manual page refresh.
  - `/administration/roles` shows real role names.
  - `/administration/audit-log` shows real events, newest reflecting the actions just taken in the
    Team page (e.g. the invite/role-change/deactivate above should produce new audit rows once
    paginated back to page 0).
  - A non-admin `USER`-role login is redirected away from all three `/administration/*` routes
    (role gating still works).
- [ ] **Step 4: Report to the user** which endpoints were exercised, any real-backend drift found
  (e.g. wrong error status codes, unexpected validation messages) that needs their judgment call,
  and confirm the roadmap file should be updated to mark Phase 5 done.

---

## Self-Review Notes (completed during plan authoring)

- **Spec coverage:** all four roadmap goal items covered — Team merge (Task 2/3), Roles reference
  (Task 4), Audit Log (Task 5), nav update (Task 6). WhatsApp/Payment correctly excluded (blocked,
  not in scope).
- **Placeholder scan:** no TBD/"add error handling"/"similar to Task N" left — every step has full
  code. The one "Note" in Task 2 Step 4 about temporary stubs is an explicit, real fallback with
  exact code, not a placeholder.
- **Type consistency:** `PagedResponse<T>`, `UserSummary`, `UserDetail`, `RoleOption`, `AuditEvent`,
  `CreateUserRequest`, `UpdateUserRequest`, `SetUserRoleRequest`, `UserStatusResponse` are defined
  once in Task 1 and referenced identically (same names/shapes) through Tasks 2-6. `teamService`
  method names (`listUsers`, `getUser`, `inviteUser`, `updateUser`, `setUserRole`, `deactivateUser`,
  `reactivateUser`, `resendPasswordSetup`) match between the Task 1 service and every Task 2/3
  caller.
