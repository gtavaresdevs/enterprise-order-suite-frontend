# Dev tooling workflow: Graphify, ponytail, wshobson/agents

> **Status:** Implemented 2026-09-15 — see `docs/superpowers/plans/2026-09-15-dev-tooling-workflow-design.md`.
> Two deviations from the plan as installed, both documented in the plan: Graphify's Claude
> integration is skill-only (CLI-invoked), no separate MCP server exists for it; its default
> `claude install` also registers an auto-sync `PreToolUse` hook + `CLAUDE.md` directive, which
> was explicitly uninstalled (`graphify claude uninstall`) to honor "manual refresh only, no
> hook." `.claude/` is already git-ignored repo-wide in this project, so project-scoped installs
> here are local-machine state, not shared via git, despite Claude Code's "project scope" naming.

## Context

The restaurant-ops redesign is mid-flight (see `2026-09-09-restaurant-ops-redesign-design.md` and
`RESTAURANT-OPS-ROADMAP.md`). The existing spec-driven loop —
`superpowers:brainstorming` → design doc → `superpowers:writing-plans` → implementation — stays
the backbone of how work gets planned in this repo. This spec adds three project-scoped tools
around that loop; none of them replace it.

Scope: **this project only** (`order-ui/.claude/`). Not installed globally.

## Tools and where they plug in

### Graphify — codebase knowledge graph

Parses the codebase (tree-sitter, no LLM on code itself) into a queryable graph
(`graph.json`/`graph.html`), installed as a project skill + MCP server.

- **Use:** run `/graphify` manually before starting a brainstorming design pass on a cross-cutting
  change, and before/during use of the `migrate-shared-type` skill — to see every real consumer of
  a shared type (`Order`, `MenuItem`, `Table`) instead of relying on grep.
- **Sync:** manual refresh only. No git hook. Rationale: avoids adding overhead to every commit
  while the workflow is still being validated; revisit git-hook automation later if manual refresh
  proves to lag behind the code too often.
- **Not used for:** anything requiring the graph to be always up to date automatically (e.g. CI
  gating) — out of scope for this pass.

### ponytail — minimalism enforcement

Installed as a project plugin, default intensity **`full`**.

- **Use:** ambient constraint across all phases (brainstorming, plan-writing, implementation) —
  reinforces the scope/simplicity rules already written into this repo's `CLAUDE.md` ("don't
  refactor beyond what the task needs", "no error handling for cases that can't occur") so they're
  enforced consistently rather than depending on the assistant remembering them each session.
  `/ponytail audit` is available for an explicit manual over-engineering pass on demand.
- **Relationship to CLAUDE.md:** this doesn't add new rules — it's an enforcement layer for rules
  that already exist in this repo's own instructions.

### wshobson/agents — specialist subagent marketplace

Marketplace added via `/plugin marketplace add wshobson/agents`; **only two plugins installed**,
not the full 94-plugin catalog:

- **`accessibility-compliance`** — WCAG auditing. No overlap with existing agents/skills. Relevant
  because `/storefront` and `/kds` are customer- and kiosk-facing routes rendered outside the
  authenticated app shell.
- **`comprehensive-review`** — multi-perspective code review. Complements (does not replace)
  `requirement-auditor`, which checks one stated functional requirement against the implementation
  (MET/PARTIAL/NOT MET with file:line evidence); `comprehensive-review` is a general code-quality
  pass, not requirement-specific.

Any agent pulled in from these plugins gets `model:` pinned explicitly per the existing tiering
rule (see `feedback_subagent_model_tiering.md` memory / CLAUDE.md "Model tiering for subagents")
before it's used — it does not inherit the parent session's model by default.

**Plugins evaluated and explicitly skipped**, with reasons:

| Plugin | Reason skipped |
|---|---|
| `frontend-mobile-development` | React Native / cross-platform scope; this repo is web-only, mobile/native explicitly out of scope per the redesign spec. |
| `ui-design` | Overlaps with the brainstorming skill's own visual-companion flow for mockup/design questions. |
| `multi-platform-apps` | Cross-platform (web/iOS/Android) orchestration; not applicable. |
| `full-stack-orchestration` | Spans backend/deploy concerns this repo doesn't own (order-ui is frontend-only, talks to a separate backend via `src/api/client.ts`). |
| `javascript-typescript` (generic scaffolding) | **Loses to existing `scaffold-feature` skill**, which already encodes this repo's exact feature-module shape and shared-type rules; a generic scaffolder doesn't know those conventions. |
| `unit-testing`, `tdd-workflows` | No test runner exists in this repo yet (confirmed in `CLAUDE.md`) — nothing for these to run against. Revisit if a runner is ever added. |
| `developer-essentials` | Bundled auth guidance risks conflicting with this repo's explicit "extra caution + confirmation" rule for auth-sensitive files (`src/api/client.ts`, `features/auth/**`). Skipped rather than risk undercutting an existing safeguard. |
| `performance-testing-review` | Half the plugin (test-coverage review) doesn't apply without a runner; marginal fit for now. |

## What does NOT change

- The `superpowers:brainstorming` → design doc → `writing-plans` → implementation loop stays as-is.
- `requirement-auditor`, `ui-behavior-verifier` agents are unchanged.
- `migrate-shared-type`, `scaffold-feature`, `connect-backend`, `audit-requirement`, `verify-ui`
  skills are unchanged and take precedence over any overlapping generic tooling from the
  marketplace (see `javascript-typescript` skip above).
- No global (user-level) install of any of the three tools — project-scoped only.
- No git-hook automation for Graphify.

## Risks / maintenance cost

- Graphify's graph can drift from the code between manual refreshes — acceptable tradeoff for
  avoiding hook overhead while the workflow is new; if drift causes real mistakes, revisit.
- ponytail at `full` may push back on defensive code that's actually warranted at a boundary
  (auth, external API responses) — use judgment, don't let the tool override the repo's explicit
  auth-caution rule.
- Installing two wshobson plugins still pulls in their full agent/skill/command sets, not just the
  headline feature — worth a quick pass after installation to confirm no naming collisions with
  existing custom agents/skills, and to pin `model:` on any new agents before first use.
