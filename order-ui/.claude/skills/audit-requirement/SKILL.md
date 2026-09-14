---
name: audit-requirement
description: Check whether a stated functional requirement is actually implemented in the order-ui codebase, before or after a change. Dispatches an isolated subagent (requirement-auditor) to locate the relevant feature module(s), correlate components/hooks/services/types, and report MET/PARTIAL/NOT MET with file:line evidence — keeping the file-reading legwork out of the main conversation. Use when the user states a requirement/spec and asks to verify, audit, or check it against the code, or wants to know what's missing before proposing a fix.
---

# Audit a requirement against the code

Use this instead of reading through feature files yourself to eyeball whether a requirement is
satisfied. It replaces "let me check the code" with a dispatched, read-only audit that returns a
compact verdict instead of filling your own context with every file it had to open.

**Do not explore the codebase yourself first.** The entire point is to keep that legwork off the
main conversation — dispatch immediately once you have the requirement text.

## How to invoke it

Dispatch the `requirement-auditor` custom agent via the `Agent` tool
(`subagent_type: "requirement-auditor"`). It starts with **zero context** — it has not seen this
conversation — so the prompt must be fully self-contained. Include:

1. **The requirement, verbatim.** Don't paraphrase or summarize it down before handing it off — the
   agent needs to split it into sub-requirements itself.
2. **Any known location hint**: feature name, route, component, or file, if you already know where
   this lives. If you don't know, say so explicitly rather than omitting it — the agent will
   search from the requirement wording instead.
3. **Whether this is a pre-check or a post-check** — i.e. auditing existing behavior "as is" versus
   verifying a change you just made actually satisfies the requirement. This changes what counts as
   a meaningful gap to report.
4. Anything you already know that would save it a search (e.g. "this is the `orders` feature,
   still on mock data" or "this touches `features/administration/services`").

## After it returns

Read its report, not the raw file-by-file search. Then:

- Relay the verdict(s) and evidence to the user concisely — don't re-explain what the report
  already states plainly.
- For any `PARTIAL`/`NOT MET` gap, present the agent's proposed fix outline as **your own proposal**
  and get the user's explicit approval before touching any file. This agent never edits code, and
  neither should you without that approval — treat the fix outline as a starting point you may
  refine, not something to apply verbatim.
- If the report raises open questions (ambiguous requirement wording, context it couldn't resolve),
  surface those to the user before proposing a fix — don't silently pick an interpretation on their
  behalf.
- Auth-sensitive or types+service-lockstep changes still get the extra caution this repo's
  `CLAUDE.md` calls for, regardless of how confident the audit report is.
