# Dev Tooling Workflow (Graphify, ponytail, wshobson/agents) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install and wire up three project-scoped dev-tooling additions (Graphify knowledge-graph skill+MCP, ponytail minimalism plugin, two wshobson/agents marketplace plugins) into `order-ui/.claude/` without touching global (user-level) Claude Code config.

**Architecture:** Each tool is installed independently via its own CLI/slash-command flow, then verified by running its own smoke command. No code changes to the app itself — this plan only touches `.claude/` config, `.mcp.json`, and (for Graphify) an ignored output directory. Tasks are ordered by dependency risk: Graphify (external CLI, most likely to need troubleshooting) first, then ponytail (single marketplace), then wshobson/agents (marketplace with a two-plugin subset), then a final cross-cutting collision/model-pinning check.

**Tech Stack:** Claude Code plugin/marketplace system, `graphifyy` PyPI CLI (`uv tool install`), MCP (`.mcp.json`), project-scoped `.claude/settings.json` (`enabledPlugins`, `extraKnownMarketplaces`).

**Spec:** `docs/superpowers/specs/2026-09-15-dev-tooling-workflow-design.md`

## Global Constraints

- Project-scoped only — nothing installed at user/global scope (spec: "Scope: this project only... Not installed globally").
- ponytail intensity: `full` (default) — do not change to `lite`/`ultra`.
- Only **two** wshobson/agents plugins get installed: `accessibility-compliance` and `comprehensive-review`. Do not install the full 94-plugin catalog.
- No git hook for Graphify sync — manual `/graphify` refresh only.
- Any new agent pulled in from the wshobson plugins must get `model:` pinned explicitly per `feedback_subagent_model_tiering.md` / CLAUDE.md before first use — none may inherit the parent session's model.
- Existing skills (`migrate-shared-type`, `scaffold-feature`, `connect-backend`, `audit-requirement`, `verify-ui`) and agents (`requirement-auditor`, `ui-behavior-verifier`) are unchanged and take precedence over overlapping generic tooling.

---

### Task 1: Install Graphify as a project-scoped skill + MCP server

**Files:**
- Create: `.claude/skills/graphify/SKILL.md` (written by the `graphify` CLI, not hand-authored)
- Create/Modify: `.mcp.json` (project root) — registers the `graphify` MCP server at project scope
- Modify: `.gitignore` — add the Graphify output directory (graph cache) if the installer creates one outside `.claude/`

**Interfaces:**
- Produces: a `/graphify` skill invocable from any future session in this repo, and an MCP server named `graphify` exposing knowledge-graph query tools (used by later `migrate-shared-type` skill runs, per spec — no code interface, this is tooling-only).

- [ ] **Step 1: Install the Graphify CLI (user-level tool install — this is the CLI binary, not project config, so global here is correct)**

Run: `uv tool install graphifyy`
Expected: installs successfully; `graphify --version` prints a version string afterward.

- [ ] **Step 2: Verify the CLI is on PATH**

Run: `graphify --version`
Expected: prints a version number, no "command not found".

- [ ] **Step 3: Run the project-scoped install for the Claude platform**

Run (from `order-ui/` repo root): `graphify claude install --project`
Expected: output confirms it wrote the skill under `.claude/skills/graphify/SKILL.md` (relative to `order-ui/`, not the user home directory) and generated an initial graph.

- [ ] **Step 4: Confirm no user-level files were touched**

Run: `git -C "$HOME" status 2>/dev/null; echo "no home git repo, expected"` and separately check `ls ~/.claude/skills/graphify 2>/dev/null` returns nothing.
Expected: `~/.claude/skills/graphify` does not exist — proves the install was project-scoped, matching the spec's "not installed globally" requirement.

- [ ] **Step 5: Confirm the skill and any graph output are tracked correctly in git**

Run: `git status --short`
Expected: `.claude/skills/graphify/SKILL.md` (and `.mcp.json` if the installer wrote it) show as new files. If the installer also wrote a large `graph.json`/`graph.html` output outside `.claude/skills/`, add that path to `.gitignore` instead of committing it — the spec calls Graphify's sync "manual refresh only," and a committed graph blob would immediately go stale and bloat the repo.

- [ ] **Step 6: Register the MCP server explicitly if `graphify claude install --project` didn't already write `.mcp.json`**

Check: `cat .mcp.json 2>/dev/null` — if a `graphify` entry is already present, skip this step.
If missing, create/edit `.mcp.json` at the repo root with:

```json
{
  "mcpServers": {
    "graphify": {
      "command": "python",
      "args": ["-m", "graphify.serve", "graphify-out/graph.json"]
    }
  }
}
```

(Adjust the graph path to match whatever Step 3's output actually named the generated graph file.)

- [ ] **Step 7: Smoke-test the skill manually**

Run inside a Claude Code session in this repo: `/graphify`
Expected: the command runs against the freshly generated graph without erroring (e.g., it lists or queries known symbols/files from `order-ui/src`).

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/graphify .mcp.json .gitignore
git commit -m "chore: add Graphify project-scoped knowledge-graph skill + MCP server"
```

---

### Task 2: Install ponytail as a project-scoped plugin at `full` intensity

**Files:**
- Modify: `.claude/settings.json` — adds `extraKnownMarketplaces` entry for `dietrichayala/ponytail` and `enabledPlugins` entry for `ponytail@ponytail`, both at project scope

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: a `/ponytail audit` slash command and an ambient minimalism-enforcement layer active for all future sessions in this repo (no code interface).

- [ ] **Step 1: Add the ponytail marketplace**

Run inside a Claude Code session in this repo: `/plugin marketplace add dietrichayala/ponytail`
Expected: confirms the marketplace was added.

- [ ] **Step 2: Install ponytail at project scope (non-interactive form, so scope is explicit rather than relying on an interactive prompt)**

Run: `claude plugin install ponytail@ponytail --scope project`
Expected: confirms install; command exits 0.

- [ ] **Step 3: Verify `.claude/settings.json` recorded the project-scope install**

Run: `cat .claude/settings.json`
Expected: contains an `enabledPlugins` entry `"ponytail@ponytail": true` and an `extraKnownMarketplaces` entry for the ponytail marketplace. If the entry is missing — this is a known Claude Code gap (project-scoped plugin installs not always writing `enabledPlugins`/`extraKnownMarketplaces` to project settings) — add both entries to `.claude/settings.json` by hand so collaborators pick it up via the checked-in file rather than only the local install state.

- [ ] **Step 4: Confirm default intensity is `full`**

Run: `/ponytail audit` (or check ponytail's own config output if it prints current intensity on first run)
Expected: intensity reads `full` (the plugin's documented default) — do not pass any flag that would set it to `lite` or `ultra`.

- [ ] **Step 5: Smoke-test the audit command**

Run: `/ponytail audit` against an existing file, e.g. one feature service file
Expected: command runs without error and returns output (even if it's "no issues found") — confirms the plugin is wired up, not just recorded in settings.

- [ ] **Step 6: Commit**

```bash
git add .claude/settings.json
git commit -m "chore: add ponytail minimalism plugin (project scope, full intensity)"
```

---

### Task 3: Add the wshobson/agents marketplace and install exactly two plugins

**Files:**
- Modify: `.claude/settings.json` — adds `extraKnownMarketplaces` entry for `wshobson/agents` and `enabledPlugins` entries for `accessibility-compliance@wshobson-agents` and `comprehensive-review@wshobson-agents` (marketplace alias confirmed in Step 1's output — use whatever alias the marketplace add actually registers)

**Interfaces:**
- Consumes: nothing from Tasks 1-2.
- Produces: WCAG audit commands/agents (from `accessibility-compliance`) and multi-perspective review commands/agents (from `comprehensive-review`), available for future use against `/storefront`, `/kds`, and general code review. Exact agent/command names are whatever those plugins ship — inspect after install rather than assuming names, since this plan doesn't invoke them yet (that's follow-up work, not this task).

- [ ] **Step 1: Add the wshobson/agents marketplace**

Run: `/plugin marketplace add wshobson/agents`
Expected: confirms the marketplace was added; note the marketplace alias it registers under (shown in the confirmation output) for use in Step 2.

- [ ] **Step 2: Install only `accessibility-compliance`, at project scope**

Run: `claude plugin install accessibility-compliance@<marketplace-alias-from-step-1> --scope project`
Expected: confirms install; command exits 0.

- [ ] **Step 3: Install only `comprehensive-review`, at project scope**

Run: `claude plugin install comprehensive-review@<marketplace-alias-from-step-1> --scope project`
Expected: confirms install; command exits 0.

- [ ] **Step 4: Verify exactly these two plugins are enabled from this marketplace — no others**

Run: `cat .claude/settings.json`
Expected: `enabledPlugins` contains exactly two entries under the wshobson marketplace alias (`accessibility-compliance...` and `comprehensive-review...`), and no other wshobson plugin got pulled in as a side effect. If either project-scope write didn't land in `.claude/settings.json` (same known gap as Task 2 Step 3), add the entries by hand.

- [ ] **Step 5: List what each plugin actually installed**

Run: `/plugin list` or inspect `~/.claude/plugins/` (or wherever this Claude Code version caches plugin contents) for the two plugins' agent/skill/command manifests.
Expected: a concrete list of new agent names, skill names, and command names — write these down for Step 6 and Task 4 (don't guess names from the marketplace README).

- [ ] **Step 6: Check for naming collisions against existing custom agents/skills**

Run: `ls .claude/agents/ .claude/skills/` and compare against the names collected in Step 5.
Expected: no filename or slash-command collisions with this repo's existing `requirement-auditor`, `ui-behavior-verifier`, `migrate-shared-type`, `scaffold-feature`, `connect-backend`, `audit-requirement`, `verify-ui`. If a collision exists, flag it here rather than silently letting one shadow the other — resolving it is out of scope for this task; surface it as a blocker before Task 4.

- [ ] **Step 7: Commit**

```bash
git add .claude/settings.json
git commit -m "chore: add wshobson/agents marketplace, install accessibility-compliance + comprehensive-review only"
```

---

### Task 4: Pin `model:` on every new agent pulled in from Tasks 2-3, and record the final tooling state

**Files:**
- Modify: any new agent `.md` files installed under the ponytail or wshobson plugins that define a Claude Code subagent with no `model:` in frontmatter (exact paths depend on Task 3 Step 5's findings — plugin-installed agents typically live under the plugin's own cache directory, not `.claude/agents/`; check whether this Claude Code version allows overriding a plugin agent's frontmatter or whether pinning has to happen at the dispatch call site instead)
- Modify: `docs/superpowers/specs/2026-09-15-dev-tooling-workflow-design.md` — mark the spec as implemented (add a one-line status note at the top), since the plan implements it end-to-end

**Interfaces:**
- Consumes: the agent/skill/command list from Task 3 Step 5.
- Produces: nothing further downstream — this is the closing verification task.

- [ ] **Step 1: Enumerate every agent shipped by `accessibility-compliance` and `comprehensive-review`**

Use the list from Task 3 Step 5. For each agent file found, check its frontmatter.

- [ ] **Step 2: For each agent missing `model:` in frontmatter, determine whether this Claude Code version supports editing a plugin-vendored agent file directly**

Run: attempt a trivial edit (e.g. add a comment) to one plugin agent file and check whether it's respected on next `/plugin` reload, or whether plugin content is treated as read-only/reinstalled-on-update.
Expected outcome (either is acceptable, document which applies): (a) plugin agent files are editable in place — add `model: sonnet` (per the tiering rule: these are judgment-bearing review/audit agents, not mechanical lookups, so `sonnet` not `haiku`) to each; or (b) plugin agents are not directly editable — in that case, document in this plan's notes that `model:` must be passed explicitly via the `model` param on every `Agent` dispatch of these agents instead, since frontmatter can't be pinned.

- [ ] **Step 3: If (a) from Step 2 — commit the frontmatter pins**

```bash
git add <edited agent files>
git commit -m "chore: pin model: sonnet on wshobson/agents review+accessibility agents"
```

- [ ] **Step 4: If (b) from Step 2 — no commit needed for this step; instead confirm the constraint is written down**

Check that this plan (Task 4 Step 2's outcome) and/or a follow-up memory note captures "pin `model: sonnet` via the `model` param when dispatching `accessibility-compliance`/`comprehensive-review` agents" so it isn't lost between sessions.

- [ ] **Step 5: Update the spec file with an implementation status line**

Add a single line near the top of `docs/superpowers/specs/2026-09-15-dev-tooling-workflow-design.md`, e.g. `> **Status:** Implemented 2026-09-15 — see docs/superpowers/plans/2026-09-15-dev-tooling-workflow-design.md`.

- [ ] **Step 6: Final full-repo check**

Run: `git status --short` and `git log --oneline -6`
Expected: only the commits from Tasks 1-4 (plus this doc-status commit) are present; working tree is otherwise clean.

- [ ] **Step 7: Commit the spec status update**

```bash
git add docs/superpowers/specs/2026-09-15-dev-tooling-workflow-design.md
git commit -m "docs: mark dev tooling workflow spec as implemented"
```

---

## Notes for the executor

- Every `/plugin` and `claude plugin install` command in this plan must be run with the actual marketplace alias Claude Code assigns on `add` — don't assume it matches the GitHub repo name verbatim; read the confirmation output.
- There's a documented Claude Code gap where project-scope plugin installs don't always persist to `.claude/settings.json` automatically (see Task 2 Step 3 and Task 3 Step 4) — always verify the file directly rather than trusting the install command's exit code alone.
- None of these tools are invoked against real app code by this plan — that's deliberate. This plan only proves the tooling is installed and smoke-tested; using Graphify during a real `migrate-shared-type` pass, running `/ponytail audit` on an actual PR, or dispatching `comprehensive-review`/`accessibility-compliance` on real code is follow-up work, not part of this install.
