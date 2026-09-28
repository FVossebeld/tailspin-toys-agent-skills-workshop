# Exercise — make the engineering method repeatable

**Time:** 30 minutes in a Codespace created before the session (allow 5–10 extra minutes locally on a cold cache) · **Tool:** GitHub Copilot CLI

You will experience three things:

1. An online skill can give an agent a **reusable engineering method**.
2. A subagent can keep **context-heavy exploration** out of your main session.
3. **Executable tests** are stronger proof than an agent saying "done".

## The bug report

> **Minimum-rating filter hides games it should show**
>
> On the home page, choosing **3★ & up** shows 18 of 21 games, although no game in the catalog is rated below 3.0. Choosing **4★ & up** hides *Repo Rampart*.

## Setup (before the clock starts)

**Codespace:** on the repository page choose **Code → Codespaces → Create codespace on main**. Wait until the terminal says the post-create command has finished.

**Local:** Node.js 22.13+, then `npm ci`. Install Copilot CLI with `npm install -g @github/copilot`, `winget install GitHub.Copilot` or `brew install --cask copilot-cli`.

Start Copilot CLI from the repository root:

```bash
copilot
```

Trust the folder when asked, and sign in with `/login` if prompted. When Copilot asks to run `npm`, you may approve it for the session.

---

## Phase 1 — Observe the failure · 3 min

```bash
npm run test:filter-bug
```

It fails every time. The very first run on a fresh install can take 10–30 seconds; reruns take a few seconds. Optional: `npm run dev`, open the site and choose **3★ & up**.

Write down:

- What is visibly wrong?
- What would a **superficial** correction look like?
- What evidence would prove the **root cause**?

## Phase 2 — Improve the skill · 5 min

Open [`.github/skills/diagnosing-bugs/SKILL.md`](../.github/skills/diagnosing-bugs/SKILL.md). It is deliberately incomplete in three places, each marked `TODO(workshop n/3)`.

| TODO | Improve | Good looks like |
| --- | --- | --- |
| 1/3 | **Activation** — the `description` | Says what the skill does *and* when to use it, with trigger phrases a teammate would actually type. Copilot matches your prompt against it to load the skill automatically. |
| 2/3 | **Method** — Phase 1 | Requires one command that goes red on this symptom, has been run, is deterministic and fast — *before* any hypothesis or edit. |
| 3/3 | **Completion** — definition of done | A fixed report: symptom, loop red→green, root cause at `file:line`, accepted/rejected hypotheses, changed files, regression test, exact commands with results, remaining uncertainty. |

Then, in Copilot CLI:

```text
/skills reload
/skills list
```

You can always invoke a skill explicitly with `/diagnosing-bugs`. Optional activation check — in a **new** session, describe the symptom without naming the skill and see whether Copilot loads it:

```text
The minimum-rating filter on the home page hides some games. What would you do first?
```

## Phase 3 — Delegate exploration · 6 min

Run `/context` and note the token count. Then:

```text
Use the explore subagent to investigate the game-filter failure reported by npm run test:filter-bug.

Do not modify files.

Use the repository context and return only:
- relevant files
- execution path
- verified behavior
- competing hypotheses
- evidence supporting or rejecting each hypothesis
- unresolved questions
```

Run `/context` again. The subagent read many files; your main session received a compact summary.

> Prefer a custom agent? `.github/agents/investigator.agent.md` is a read-only investigator with a fixed return format. Select it with `/agent`.

## Phase 4 — Apply the skill · 8 min

```text
Use the diagnosing-bugs skill to diagnose and correct the game-filter problem.

Begin with the provided reproduction.
Make the smallest correction supported by evidence.
```

Watch for:

- Does it run the feedback loop **before** forming a theory?
- Does it separate the **symptom** from the **root cause**?
- Does it add or strengthen a **regression test at the right seam**?
- Does it avoid unrelated changes and avoid weakening test expectations?

## Phase 5 — Verify separately · 4 min

```text
Use the task subagent to verify the correction.

Do not change implementation files.
Run the reproduction and the smallest relevant test suite.
Return the exact commands and results.
```

## Phase 6 — Compare · 4 min

Discuss with your neighbour:

1. What information stayed inside the exploration subagent?
2. What information came back to the main session?
3. Which actions came from the **skill** rather than from your prompt?
4. Did the skill improve the method, the output, or both?
5. What **executable evidence** proves the correction?
6. Would another developer likely follow a similar process?

---

## Done when

- [ ] `npm run test:filter-bug` is green.
- [ ] `npm run test:unit` is green and `npm run lint` is clean.
- [ ] A new or strengthened regression test would fail on the original code.
- [ ] The production change is small and no test expectation was weakened.
- [ ] You have an evidence report in the skill's definition-of-done format.

Stretch: run `npx playwright test e2e-tests/filters.spec.ts`, ask for a handoff with the `handoff` skill, or open a pull request to `main` in your own copy and let CI prove it.

## Stuck?

<details>
<summary>Hint 1 — where to start</summary>

Start from the red command, not from the code. Which assertion fails, and what exactly is missing from the received list?

</details>

<details>
<summary>Hint 2 — what to compare</summary>

Compare what the product promises to users with what the code decides. The UI labels and the type documentation are part of the requirement.

</details>

<details>
<summary>Hint 3 — why the unit tests pass</summary>

If the catalog test fails but the unit tests for the same helper pass, which inputs do the unit tests never try?

</details>

**Start over on the code** — discards your changes in `src/` and `e2e-tests/` (including any regression test), keeps your `SKILL.md` edits:

```bash
git restore --source=HEAD -- src e2e-tests
```

**Compare your skill with the facilitator's version:**

```bash
git fetch origin && git diff HEAD origin/demo-start -- .github/skills/diagnosing-bugs/SKILL.md
```

**Windows without a Codespace:** use the Node command `node .github/skills/diagnosing-bugs/scripts/feedback-loop.mjs --runs 3 -- npm run test:filter-bug` instead of the `.sh` script.

**Other IDEs:** Copilot CLI runs in any terminal, so you can follow along from JetBrains, Visual Studio or a plain shell. VS Code agent mode also loads the skills in `.github/skills/`.
