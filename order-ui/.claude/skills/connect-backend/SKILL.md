---
name: connect-backend
description: Wire a feature's service layer to the real backend (running locally via Docker) using its live OpenAPI/swagger spec — either auditing an already-connected feature (e.g. profile, auth) for drift, or converting a mock feature's service from constants-based fake data to real Axios calls. Use when the user asks to "connect", "wire up", "hook up to the backend", or "implement" a feature against the real API, or to check a feature against swagger.
---

# Connect a feature to the real backend

This project's backend runs locally in Docker (started separately by the user, e.g. from an
IntelliJ terminal). Most feature services under `src/features/<feature>/services/` return mock
data from `constants/` with real `api.*` calls left commented out as TODOs — only `auth` and
`profile` currently call the real API via `src/api/client.ts`. This skill wires one feature at a
time against the actual spec, instead of guessing endpoint shapes.

## 0. Confirm the backend is reachable

The swagger/OpenAPI endpoints are mounted under the `/api` base path (confirmed working, this repo's
springdoc config does not use the bare root):

- `http://localhost:8080/api/v3/api-docs` (raw OpenAPI JSON spec — use this one for parsing)
- `http://localhost:8080/api/swagger-ui/index.html#/` (human-readable UI, not the raw spec)

The bare-root variants (`http://localhost:8080/v3/api-docs`, `http://localhost:8080/swagger-ui/index.html`)
404 on this backend — don't use them.

If nothing responds, the Docker container likely isn't running — ask the user to start it rather
than guessing endpoint shapes from old code or assumptions.

## 1. Fetch and read the spec

Fetch the raw OpenAPI JSON (not just the Swagger UI HTML). Identify the paths, request/response
schemas, and enum values relevant to the target feature. Don't skim — a mismatched field name or
enum value here is exactly the class of bug this skill exists to prevent.

## 2. Determine mode: audit vs. convert

Check `src/features/<feature>/services/<feature>.service.ts` first:

- **Already calling `api.*` (e.g. `profile`, `auth`)** → **audit mode**. Compare each call's method,
  path, request body, and response shape against the spec. Compare `src/types/<feature>.ts` against
  the response schema. Report drift; don't rewrite silently — confirm with the user before changing
  a working integration.
- **Returning mock data from `constants/`** → **convert mode**. Implement the real `api.get/post/...`
  calls per the existing pattern in `auth.service.ts` / `profile.service.ts` (same file, same
  `client.ts` instance, same error-handling shape). Keep the hook's public interface
  (`use<Feature>.ts`) stable so components don't need to change. Update `src/types/<feature>.ts` to
  match the backend DTOs exactly — don't assume the mock shape in `constants/` matches the real API.

Never flip a feature from mock to real without doing this comparison first — the whole point is
avoiding a UI that breaks against an endpoint that doesn't exist or returns a different shape than
assumed.

## 3. Apply changes

- Types and service changes land together.
- Preserve the feature-module structure from this repo's `CLAUDE.md` (`components/hooks/services/
  constants/index.ts`), and the `@/*` import alias.
- If the spec exposes fields the mock/current types don't have (or vice versa), flag it rather than
  silently dropping or inventing fields.
- Auth-sensitive endpoints (anything touching tokens, roles, permissions) — flag for extra review
  given the blast radius described in this repo's `CLAUDE.md` Auth section.

## 4. Verify

Run `yarn lint` and `yarn build` (`tsc -b`) — there's no test suite in this repo, so type-checking
and lint are the safety net. Do not claim the integration works without also exercising it in the
running app (`yarn dev`) if UI-visible.

## 5. Report

Summarize: which endpoints were wired/audited, what drift (if any) was found between the old
mock/types and the real spec, and what still needs the user's judgment call (e.g. an ambiguous
field, an endpoint the spec doesn't have yet).
