---
name: diagnosing-bugs
description: Disciplined diagnosis loop for bugs, failing tests and wrong behaviour in this repository. Use when the user says "diagnose", "debug", "why is this failing", or reports that something is broken, incorrect, missing, throwing or flaky. Builds a red-capable reproduction before any hypothesis or code change, and finishes with an evidence report.
license: MIT
---

# Diagnosing bugs

Workshop adaptation of Matt Pocock's `diagnosing-bugs` skill (MIT): <https://github.com/mattpocock/skills>.
Follow the phases in order. Skip a phase only when you state why.

## 1. Build a red feedback loop — before anything else

- Name **one** command that goes red on *this* symptom and green once it is fixed. Prefer an existing reproduction; see [repository-testing.md](references/repository-testing.md).
- Run it. Show the command and the relevant failing lines.
- Confirm it is deterministic and fast: `node .github/skills/diagnosing-bugs/scripts/feedback-loop.mjs --runs 3 -- <command>`.
- No red loop, no Phase 2. If you cannot build one, stop and say what you tried.

## 2. Read just enough context

- Trace the path from the symptom to the code. Start from [architecture-summary.md](references/architecture-summary.md), then open only the files the red loop implicates. Use `.github/copilot-instructions.md` for repository-wide conventions.
- Delegate wide searches to a subagent and keep only its findings in the main session.

## 3. Hypothesise before editing

- List **2–3 ranked, falsifiable** hypotheses: "If X is the cause, then changing Y turns the loop green."
- Gather evidence for or against each one **before** changing code. Keep the rejected ones and the evidence that rejected them.

## 4. Fix with a regression test

- Add or strengthen a regression test at the correct seam: the smallest unit that contains the cause. Watch it fail.
- Make the smallest correction that removes the root cause. Never edit test expectations to match buggy behaviour, add tolerances, or special-case data.
- Watch the regression test and the Phase 1 loop turn green.

## 5. Verify

- Re-run the Phase 1 loop, then the smallest relevant suite: `npm run test:unit`, plus `npx playwright test e2e-tests/<spec>.spec.ts` when the behaviour is visible in the UI, then `npm run lint`.
- Prefer a separate verification subagent that runs commands but does not edit files.

## Definition of done — report exactly this

```text
Symptom:       <user-visible behaviour, one line>
Feedback loop: <command> — red before, green after
Root cause:    <file:line and why it produces the symptom>
Hypotheses:    <accepted one; rejected ones with the evidence that rejected them>
Fix:           <each changed file, one line each>
Regression:    <test name and file>
Verification:  <exact commands with pass/fail counts>
Uncertainty:   <what is still unproven, or "none">
```
