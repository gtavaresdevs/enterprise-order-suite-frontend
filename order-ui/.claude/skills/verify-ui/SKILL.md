---
name: verify-ui
description: Verify a frontend feature's actual behavior in a real browser (clicks, forms, conditional rendering, navigation, state, validation) before calling frontend work done. Dispatches an isolated subagent (ui-behavior-verifier) driving Playwright so the noisy step-by-step browser transcript doesn't pollute the main conversation. Scoped to frontend behavior only — it does not judge backend correctness. Use after finishing a UI-affecting change, or whenever the user asks to check/verify/test a feature's behavior in the browser.
---

# Verify UI behavior

Use this at the point you'd otherwise just eyeball a diff and call a frontend task done — it
replaces "I believe this works" with an actual browser-driven check, without filling your own
context with the click-by-click transcript.

**Do not** wire this to fire automatically on every edit — a browser check costs tens of seconds
(dev server readiness, browser launch, navigation), and most single edits aren't a complete
testable behavior. Invoke it deliberately: when you judge a feature/task is functionally
complete, or when the user asks you to check/verify/test something in the browser.

## Static verification comes first

A browser dispatch is expensive (tens of thousands of tokens, minutes of wall time). Only reach
for it to confirm something that genuinely requires a running browser — real interaction,
client-side state transitions, or a real network round-trip. It is not a substitute for reading
the code.

- **CSS/layout/stacking bugs** (z-index, overlap, visibility, positioning) are fully derivable
  from source — grep the relevant `z-index`/`position` usage and the DOM ancestry, reason about
  the fix, and apply it. Don't use a browser agent to discover the fix by trial and error; dispatch
  once, at most, to *confirm* a fix you already derived by reading the code.
- Type errors, prop wiring, obviously-dead code paths: `yarn build`/`tsc` and reading the diff are
  enough — no browser needed.
- Reserve the agent for things that actually need a live DOM/event loop: click→state→render chains,
  form validation, conditional rendering driven by async data, navigation, real API integration.

If a first dispatch reveals your fix was wrong, don't immediately re-dispatch to try another guess
— stop, re-read the code with what the report told you, form a reasoned fix, then verify once more.
Two or three dispatches on the same bug is a sign the fix was guessed, not derived.

## Credentials for real-backend checks

Before writing the brief, check saved memory for existing test login credentials for this project.
If the behavior under test depends on a real, live-backend-gated response (not mock data) — e.g.
verifying displayed data actually matches an API response — pass those real credentials and tell
the agent to log in through the real `/login` form. A synthetic JWT (the agent's default, see its
own instructions) satisfies route guards but will always 401 against real endpoints, so using it
for a real-data check is a guaranteed wasted dispatch, not a shortcut.

## Reusing an agent for follow-up checks

If you need to verify a second attempt at the same fix, or a related behavior on the same flow,
**resume the same agent via `SendMessage` to its agent id** instead of dispatching a fresh one. A
resumed agent keeps its logged-in session, current page, and prior findings — a fresh dispatch pays
the full cold-start cost (login, navigation, re-discovery) again for no benefit when the flow is
unchanged.

## How to invoke it

Dispatch the `ui-behavior-verifier` custom agent via the `Agent` tool
(`subagent_type: "ui-behavior-verifier"`). It starts with **zero context** — it has not seen this
conversation — so the prompt must be fully self-contained. Include:

1. **What behavior to verify**, stated as concrete, checkable requirements — not "check the orders
   feature" but "creating an order via the 'New Order' modal should: require at least one line
   item, show a validation message if submitted empty, close the modal and add a row to the table
   on success."
2. **Where it lives**: route/URL, component file(s), and feature folder
   (`src/features/<feature>/`), so it doesn't have to rediscover the app structure.
3. **Any role/auth requirement** for the route (so it knows what `roles` to put in the synthetic
   JWT it injects — see its own instructions for how).
4. **What NOT to worry about**: explicitly remind it that backend/network failures are out of
   scope unless the task itself is backend integration (this is also in its own instructions, but
   repeating the specific context — e.g. "this feature is still mock data, ignore any 404s" —
   helps it calibrate the actual check).

## After it returns

Read its report, not the raw transcript. Summarize the verdict to the user concisely. If it found
a genuine frontend bug, fix it yourself (this agent doesn't edit code) and consider re-running the
check on just that behavior afterward.
