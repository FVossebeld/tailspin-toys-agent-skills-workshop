---
name: diagnosing-bugs
description: Helps with bugs.
license: MIT
---

# Diagnosing bugs

Workshop adaptation of Matt Pocock's `diagnosing-bugs` skill (MIT): <https://github.com/mattpocock/skills>.
Follow the phases in order. Skip a phase only when you state why.

<!--
TODO(workshop 1/3) — ACTIVATION
Copilot matches a prompt against the `description` above to decide whether to load this skill automatically.
"Helps with bugs." does not say what the skill does or when to use it. Rewrite it so that a request
like "the rating filter hides some games" would load this skill without naming it.
-->

## 1. Understand the problem

- Read the code related to the bug report and form a theory about the cause.

<!--
TODO(workshop 2/3) — METHOD
Nothing above forces a reproduction first, so an agent can jump straight to a theory and a patch.
Replace this phase with one that requires ONE command that goes red on this symptom, has already
been run, is deterministic and fast — BEFORE any hypothesis or code change.
Hints: references/repository-testing.md and scripts/feedback-loop.mjs.
-->

## 2. Read just enough context

- Trace the path from the symptom to the code. Start from [architecture-summary.md](references/architecture-summary.md), then open only the files the red loop implicates. Use `.github/copilot-instructions.md` for repository-wide conventions.
- Delegate wide searches to a subagent and keep only its findings in the main session.

## 3. Hypothesise before editing

- List **2–3 ranked, falsifiable** hypotheses: "If X is the cause, then changing Y turns the loop green."
- Gather evidence for or against each one **before** changing code. Keep the rejected ones and the evidence that rejected them.

## 4. Fix with a regression test

- Add or strengthen a regression test at the correct seam: the smallest unit that contains the cause. Watch it fail.
- Make the smallest correction that removes the root cause. Never edit test expectations to match buggy behaviour, add tolerances, or special-case data.
- Watch the regression test turn green.

## 5. Verify

- Re-run the relevant tests: `npm run test:unit`, plus `npx playwright test e2e-tests/<spec>.spec.ts` when the behaviour is visible in the UI, then `npm run lint`.
- Prefer a separate verification subagent that runs commands but does not edit files.

## Definition of done

When you are done, summarise what you changed.

<!--
TODO(workshop 3/3) — EVIDENCE
"Summarise what you changed" invites a confident story instead of proof.
Replace it with a fixed report format that requires: the symptom, the feedback-loop command
(red before / green after), the root cause with file and line, accepted and rejected hypotheses,
changed files, the regression test, exact verification commands with results, and remaining uncertainty.
-->
