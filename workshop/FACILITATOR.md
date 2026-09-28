# Facilitator guide

**Session promise:** Skills give probabilistic agents a more repeatable method. Subagents perform bounded work in isolated contexts. Tests provide the proof.

| Block | Minutes | Surface |
| --- | --- | --- |
| Concepts | 8 | Slides 1–7 |
| Ecosystem | 3–4 | Browser (3 tabs) |
| Live demo | 12–14 | VS Code + Copilot CLI on `demo-start` |
| Exercise | 100 | Participants on `main`, six modules (plan a 10-minute break after Module 3) |
| Debrief | 5 | Slides |

This guide lives only on the `solution` branch so that agents exploring `main` or `demo-start` cannot read the answer.

## Pre-flight

**The day before**

- [ ] `git clone` the repository, `npm ci`, `npx playwright install chromium`.
- [ ] `git switch demo-start` → `npm run test:filter-bug` is **red** (2 failed, 2 passed).
- [ ] `git switch solution` → `npm run test:unit`, `npm run lint` and `npx playwright test` are **green** (108 unit, 31 E2E).
- [ ] `checkpoint-feature`, `checkpoint-grill` and `checkpoint-build` exist on the remote; CI is green on all three.
- [ ] The pinned skill URLs in `workshop/EXERCISE.md` still resolve (`curl -fsSI` one of them).
- [ ] Rehearse the demo once end to end on `demo-start`, then reset (see below).
- [ ] Open one Codespace on `main` to confirm post-create finishes and `copilot --version` works.
- [ ] Share the repository link and ask participants to create their Codespace **before** the session.

**Thirty minutes before**

- [ ] `git switch demo-start && git reset --hard origin/demo-start && git clean -fd`
- [ ] Stop stale servers on port 4321. Run `npm run build` once to warm the cache.
- [ ] Use a **clean Copilot profile** so your personal plugins, skills and MCP servers do not load on stage or inflate `/context`: in PowerShell `$env:COPILOT_HOME = "$HOME\.copilot-workshop"`, in bash `export COPILOT_HOME=~/.copilot-workshop`. Sign in with `/login` if asked.
- [ ] Run `npm ci` first. Without `node_modules`, the explore subagent wastes minutes fetching Vitest.
- [ ] Start `copilot` in the VS Code integrated terminal. Check `/skills list` shows only `diagnosing-bugs` and `handoff` under project skills, and `/agent` shows `investigator`. Pick the model with `/model`.
- [ ] Terminal font ≥ 18 pt, editor zoom +2, notifications off, unrelated tabs closed.
- [ ] Browser tabs ready:
  1. <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills>
  2. <https://github.com/github/awesome-copilot/tree/main/skills>
  3. <https://github.com/mattpocock/skills> and <https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md>
  4. For the exercise: <https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills> (the pinned commit participants install from)

**Screen layout:** Explorer on the left (`.github/skills`, `src`, `e2e-tests`), `SKILL.md` in the centre, a large Copilot CLI terminal at the bottom.

## Live demo (on `demo-start`)

**Same bug as Module 1, on purpose: I do, you do.** You demo the method with the *completed* skill; participants then run it with the *incomplete* skill on `main` and have to write the method into `SKILL.md` themselves. Say it out loud before Step 1: *"You will see the fix. That is fine: in Module 1 you are not graded on finding it, but on whether your skill makes Copilot reproduce first, weigh hypotheses, add a regression test and report evidence."* Modules 2–6 are new work that the demo does not reveal.

### Step 1 — Inspect the skill · 2 min

Open `.github/skills/diagnosing-bugs/SKILL.md`. Point at three things only:

- The `description` is the trigger for automatic activation (Copilot matches the prompt against it). `/diagnosing-bugs` invokes it explicitly.
- Phase 1: *no red loop, no hypotheses*. This is the method we want every run to follow.
- The fixed evidence report at the end.

Then show `references/repository-testing.md` and `scripts/feedback-loop.mjs`: the body and resources load only when the skill is used.

Run `npm run test:filter-bug` once so the room sees red.

### Step 2 — Delegate exploration · 4 min

Run `/context` and read out the token count. Then:

```text
Use the explore subagent to investigate why filtering games by minimum star rating returns incorrect results (npm run test:filter-bug fails).

Do not modify files.

Return only:
- the failing behavior
- the relevant execution path
- the most relevant files
- verified repository conventions
- two or three evidence-backed hypotheses
- unresolved questions
```

Point out: many reads happened in the subagent; the main session got a compact result. Run `/context` again and compare.

### Step 3 — Apply `diagnosing-bugs` · 4 min

```text
Apply the diagnosing-bugs skill to the explore subagent's findings.

Establish the smallest reliable reproduction before modifying the implementation.
Then identify the root cause, add or strengthen the regression test, and make the smallest safe correction.
```

Narrate what you observe:

- Did it run or build the loop first?
- Did it distinguish the symptom from the root cause?
- Did it list hypotheses and reject some with evidence?
- Did it use `references/repository-testing.md`?
- Did it avoid unrelated changes?

### Step 4 — Verification subagent · 3 min

```text
Use the task subagent to verify the correction.

Do not change implementation files.

Return:
- exact commands executed
- tests passed or failed
- the first meaningful failure, if any
- whether the original reproduction now passes
- whether the diagnosing-bugs definition of done is satisfied
```

Point out: the build and test output stayed in the subagent; the main session received evidence.

### Step 5 — Handoff (optional, only if on time) · 1 min

```text
Use the handoff skill to create a concise handoff for another engineer.
```

## Measured timings (real Copilot CLI 1.0.87 runs, clean profile)

| Step | Planned | Measured | What ran |
| --- | --- | --- | --- |
| 2 · explore | 4′ | 2.8′ | built-in `explore` subagent on a small model; no files changed |
| 3 · apply skill | 4′ | 4.4′ | skill loaded → both references read → reproduction + `feedback-loop.mjs` → boundary test → `>` to `>=` → tests + lint |
| 4 · verify | 3′ | 1.6′ | built-in `task` subagent on a small model; reproduction 4/4, unit tests, lint; no edits |
| 5 · handoff | +1′ | 0.6′ | `handoff` skill loaded; references real files and flags E2E as not re-run |

Expect the explore and task subagents to run on smaller, faster models than the main session. That is normal, and a good talking point.

## Recovery playbook

| If this happens | Do this |
| --- | --- |
| The agent edits code before reproducing | Stop it (`Esc`) and say: "Follow Phase 1 of diagnosing-bugs first." This is a teaching moment, not a failure. |
| The agent changes a test expectation | Reject the change and point at Phase 4 ("never edit expectations to match buggy behaviour"). |
| The explore subagent takes more than 3 minutes | Continue with Step 3; the skill still starts from the reproduction. |
| Permission prompts slow you down | Approve `npm` for the session when first asked. |
| Anything breaks badly | `git switch solution`, show the diff with `git diff demo-start solution -- src`, and walk through `workshop/EXPECTED-OUTCOME.md`. |
| E2E is slow or port 4321 is busy | Skip E2E in the demo; unit tests and the reproduction are enough proof. |

**Reset the demo**

```bash
git switch demo-start
git reset --hard origin/demo-start
git clean -fd
```

## Exercise support

Participants start on `main`. Each module ends with a commit; behind participants join from a checkpoint branch (`workshop/EXERCISE.md` → *Catch up*).

In Module 1, steer attention away from the fix they saw in the demo and towards the method: which steps did the skill cause, and what evidence did the run produce?

### Measured in rehearsal (Copilot CLI 1.0.87–1.0.89, clean profile)

| Module | Planned | Agent time measured | What happened |
| --- | --- | --- | --- |
| 1 · Fix a bug | 25′ | ~9′ | as in the demo; see the table above |
| 2 · Import `grill-me` | 10′ | ~2′ per run | `✗ Skill not found: grilling` with `grill-me` only; after adding `grilling`, numbered rounds with ➡️ recommendations |
| 3 · Grill and spec | 15′ | 1–1.5′ per round, ~1′ for `to-spec` | five rounds reached 13–16 questions; upstream `to-spec` stalled on the issue tracker and labels; the adapted one proposed the seams and wrote `docs/specs/` |
| 4 · Build | 35′ | explore 2.4–2.7′ · build 21′ (scoped) · verify 2.6′ | scoped to the unit seam plus one E2E scenario: 19 unit tests and one E2E test, each red first, then it stopped and listed what was left. The full spec took 9 unit and 5 E2E slices in 20′ |
| 5 · Review | 10′ | 5′ | two `code-review` subagents in parallel (2′37″ and 2′38″): one Standards judgement call, no Spec findings |
| 6 · Hand off | 5′ | 0.9′ | handoff referenced the commit, files, commands and the open finding |

Module 4 is the longest and the most expensive in premium requests: tell participants to start step 4.4 by minute 12. The exercise prompt scopes it to the unit seam plus one E2E scenario; the remaining scenarios are a stretch goal. Module 5 reviews from the `build-start` tag (set after `tdd` is imported), so every participant reviews only the feature code.

### What to watch for, per module

| Module | Walk the room at | Look for | If it goes wrong |
| --- | --- | --- | --- |
| 1 | 8′ and 20′ | concrete skill edits: trigger phrases, one red command, a fixed report | hints 1–3 in `EXERCISE.md`; compare with `demo-start` |
| 2 | 5′ | participants reading the one-line `SKILL.md` before fixing it | "What does it call? Is that installed?" |
| 3 | 8′ | at least one challenged recommendation; grilling time-boxed | if Copilot edits files during grilling, `Esc`; if `/to-spec` tries to create an issue or label, `Esc` and adapt the skill first |
| 4 | 10′ and 25′ | the seams confirmed before tests; a red run before each green | E2E slow in a Codespace: run one spec file, not the suite |
| 5 | 5′ | two subagents running at the same time; findings kept under two headings | no spec found: pass `docs/specs/catalog-sorting.md` explicitly |
| 6 | 3′ | the handoff references paths, not pasted content | — |

### Things rehearsal taught us

- **The agent may fix a broken import by itself.** In an autonomous run, Copilot noticed that `grilling` was missing, fetched it from GitHub and applied it. Interactively it has to ask first. Use it as a discussion point: would you approve installing an unreviewed skill?
- **A denied tool is not a sandbox.** With the `write` tool denied, an autonomous run wrote files through the shell instead. Permission prompts and reviews protect you; a single deny rule does not.
- **`disable-model-invocation: true` is honoured.** The model cannot start `grill-me` or `to-spec` on its own; participants must type `/grill-me` and `/to-spec`.
- **`/skills add` registers the skill at once**; `/skills reload` picks up edits. Do not `/clear` between grilling and `/to-spec`.
- **Grilling is relentless on purpose.** Tell participants to end answers with "Next round, please" and to wrap up after three rounds.
- **Recommendations differ between runs.** Two rehearsals disagreed about the default order and about whether Clear filters resets the sort. That is the probabilistic model at work, and the reason the spec records the human decision.

## Debrief (5 min)

Ask two or three groups:

1. Which actions came from the skill rather than from the prompt?
2. What stayed inside the subagent, and what came back?
3. What did you change to make someone else's skill work here? (Collect the four ways the imports broke: a missing dependency, a workflow assumption, missing supporting files, setup assumptions.)
4. What is your proof? (Expected: red→green loops, the regression and new tests, suite results, and review findings fixed or rejected.)

Close with: *The model remains probabilistic. The skill makes the method more repeatable. The subagent keeps bounded work focused. The test proves the outcome.*
