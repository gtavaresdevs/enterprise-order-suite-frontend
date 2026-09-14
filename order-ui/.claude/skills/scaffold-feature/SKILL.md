---
name: scaffold-feature
description: Use when creating a new feature module under src/features/ (e.g. a brand-new domain like Menu or Tables), or when checking whether an existing feature folder actually matches this repo's standard module shape, before writing any feature files.
---

# Scaffold a feature module

This repo (`order-ui`) requires every feature under `src/features/<feature>/` to follow one
fixed shape, per this repo's `CLAUDE.md`. Deviating (a component reading `constants/` directly
instead of through a hook, a service exported inline in a component, a missing `index.ts`) is
exactly the kind of inconsistency that makes the app feel unfinished — this skill exists so a new
feature is right on the first pass instead of getting reshaped later.

## The shape

```
features/<feature>/
  components/   # UI. One top-level "<Feature>Feature.tsx" composes the page.
  hooks/        # use<Feature>-style hooks — hold state, orchestrate services. Components never
                # call services directly.
  services/     # data access only — real api.* calls via src/api/client.ts, OR mock data from
                # constants/, never both mixed ad hoc.
  constants/    # static/mock data, enum-like lookups.
  index.ts      # re-exports ONLY the top-level Feature component:
                # export * from "./components/<Feature>Feature"
```

Plus, outside the feature folder:
- `src/types/<feature>.ts` — one types file per feature/domain. If the feature's core type is
  shared with another feature (e.g. an `Order` used by both `orders` and `kds`), it belongs in
  the domain's single shared types file, not duplicated per-feature — see the
  `migrate-shared-type` skill if a shared type already exists elsewhere and needs consolidating
  instead of a fresh one being introduced here.
- `src/pages/<Feature>.tsx` — thin route entry point that only renders `<FeatureNameFeature />`.
  No logic here.
- Route registered in `src/app/router.tsx` under the existing `ProtectedLayout`/`AppLayout`
  nesting (add `RoleGuard` only if the feature is role-restricted).
- Nav entry added to `src/layouts/app-layout/navigation.ts` (`NAVIGATION_ITEMS` or
  `ADMINISTRATION_ITEMS`), not hardcoded into the sidebar component.

## Mock-vs-real default

New features start in **mock mode** unless the task explicitly says to wire a real endpoint
(see `connect-backend` skill for that): `services/<feature>.service.ts` returns data from
`constants/`, optionally behind an artificial `setTimeout` to simulate latency, with the real
`api.get/post/...` call written out and commented as a `// TODO: connect-backend` above it — this
is the existing pattern every mock feature in this repo already follows, and it's what makes a
later real-backend wiring pass additive instead of a rewrite.

If a target backend field doesn't exist yet (common for this initiative — see
`docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md`), still shape the mock data
exactly like the eventual real DTO. Don't invent a convenient interim shape.

## Build order

Building in this order avoids circular rework (e.g. writing a component before the hook exists,
then reshaping the component when the hook's real interface turns out different):

1. `src/types/<feature>.ts` — the data shape first.
2. `constants/` — mock fixtures matching that shape.
3. `services/<feature>.service.ts` — returns the mock fixtures (or real calls, per above).
4. `hooks/use<Feature>.ts` — owns state, calls the service.
5. `components/` — leaf components first, then the top-level `<Feature>Feature.tsx` that
   composes them and calls the hook.
6. `index.ts` — single re-export.
7. `src/pages/<Feature>.tsx`, route registration, nav entry.

## Common mistakes

- A component importing from `services/` or `constants/` directly, skipping the hook — breaks
  the "hooks own state/orchestration" boundary and makes the component untestable in isolation.
- `index.ts` re-exporting more than the top-level Feature component (leaks internal component
  names to importers).
- Relative imports (`../../types/orders`) instead of `@/types/orders`.
- A new feature's core entity type duplicating one that already exists elsewhere in
  `src/types/` under a different name/shape — check first; if it should be shared, see
  `migrate-shared-type`.
