---
name: migrate-shared-type
description: Use when a type or interface referenced by more than one feature module needs its shape changed, renamed, or consolidated with a duplicate — before editing any file that consumes it. Symptoms include multiple near-identical interfaces for the same real-world concept (e.g. an Order type and a Ticket type both describing an order), or a field rename that needs to propagate across features.
---

# Migrate a shared type across consumers

The highest-error part of a cross-feature refactor is a type change landing in the type file but
not propagating everywhere it's used — leaving two shapes silently coexisting until a runtime
mismatch or a `tsc` error surfaces far from where the change was made. This skill is the checklist
that prevents that, whether the change is "rename a field" or "merge three duplicate interfaces
into one."

## Checklist

1. **Find every consumer before touching anything.** Grep the old type name(s) and, if renaming
   fields, the field names too, across `src/` — not just `src/features/<feature>/`, since a shared
   domain type is often consumed by more than one feature (e.g. an `Order` type read by both
   `orders` and `kds`). List every file that matches; this is your change set.
2. **Define the new shape in one place.** The target type lives in `src/types/<domain>.ts`. If
   this migration is consolidating duplicates (e.g. `orders`' `Order` + `kds`' `KdsTicket` +
   `storefront`'s `MenuItem`/inventory's `Product`), pick the one target file and delete the
   others' local definitions — don't leave a second definition "just in case."
3. **Update every consumer in the same pass**, not incrementally across separate commits, so the
   codebase is never left with two shapes both compiling. For each consumer file, follow the
   `component → hook → service → constants` chain (same chain `requirement-auditor` checks) — a
   type change usually touches the mock fixture, the service's return type, and the component
   prop that renders it together.
4. **Re-grep for the old name(s) after editing.** Zero remaining references is the exit
   condition — not "the build passes" alone, since an untyped `any` cast or a stale mock fixture
   can hide a leftover old-shape reference from the compiler.
5. **Run `yarn lint` and `yarn build`** (per this repo's CLAUDE.md — no test suite exists, so this
   is the safety net) after the full pass, not after each file, so `tsc` sees the whole change set
   already consistent.
6. **If a target field has no backend support yet**, keep the mock fixture shaped exactly like the
   eventual real DTO (see the initiative's spec at
   `docs/superpowers/specs/2026-09-09-restaurant-ops-redesign-design.md` for target shapes) rather
   than approximating — a second migration later is more expensive than getting the mock shape
   right now.

## Common mistakes

- Updating the type file and one obvious consumer, then discovering a second consumer (often in
  a less-obvious feature, e.g. `analytics` reading `Order.status` for a chart) still on the old
  shape weeks later.
- Leaving both the old and new type exported "temporarily" for a gradual migration — this repo
  has no deprecation-window convention; a cross-feature type change is a single atomic pass.
- Renaming a field but missing its occurrence inside a mock fixture in `constants/`, which then
  silently mismatches the type via a loose object literal until something reads the missing field.
