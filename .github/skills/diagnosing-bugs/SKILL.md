---
name: diagnosing-bugs
description: Helps with bugs.
license: MIT
---

# Diagnosing bugs

Workshop adaptation of Matt Pocock's `diagnosing-bugs` skill (MIT): <https://github.com/mattpocock/skills>.
Follow the phases in order. Skip a phase only when you state why.

<!-- TODO(workshop 1/3): improve the description above. See workshop/EXERCISE.md, Phase 2. -->

## 1. Understand the problem

- Read the code related to the bug report and form a theory about the cause.

<!-- TODO(workshop 2/3): improve this phase. See workshop/EXERCISE.md, Phase 2. -->

## 2. Read just enough context

- Trace the path from the symptom to the code. Start from [architecture-summary.md](references/architecture-summary.md), then open only the files that look relevant. Use `.github/copilot-instructions.md` for repository-wide conventions.
- Delegate wide searches to a subagent and keep only its findings in the main session.

## 3. Hypothesise before editing

- List **2–3 ranked, falsifiable** hypotheses: "If X is the cause, then changing Y fixes it."
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

<!-- TODO(workshop 3/3): improve the definition of done. See workshop/EXERCISE.md, Phase 2. -->
