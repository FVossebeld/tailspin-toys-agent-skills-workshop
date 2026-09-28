# Exercise — make the engineering method repeatable

**Time:** about 100 minutes in six modules, plus stretch goals · **Tool:** GitHub Copilot CLI in a Codespace (or locally)

You will fix a bug with a method, then build a new feature with methods written by someone else:

| # | Module | Min | You practise |
| --- | --- | --- | --- |
| 1 | [Fix a bug with a method](#module-1--fix-a-bug-with-a-method) | 25 | improve a skill · `explore` · `task` · a red test |
| 2 | [Import a skill from the internet](#module-2--import-a-skill-from-the-internet) | 10 | install `grill-me`, find out why it half-works, fix it |
| 3 | [Grill the feature, then write the spec](#module-3--grill-the-feature-then-write-the-spec) | 15 | answer design questions · adapt `to-spec` to this repo |
| 4 | [Build it test-first](#module-4--build-it-test-first) | 35 | import `tdd` with its supporting files · red → green |
| 5 | [Review in two independent contexts](#module-5--review-in-two-independent-contexts) | 10 | a skill that runs two subagents in parallel |
| 6 | [Hand off and ship](#module-6--hand-off-and-ship) | 5 | `handoff` · commit · optional pull request |
| ★ | [Finished early?](#finished-early) | — | write your own skill and test whether it is reused |

Behind? **Checkpoint branches** let you start Modules 2 to 6 without finishing the one before. See [Catch up](#catch-up).

## Setup (before the clock starts)

**Codespace:** on the repository page choose **Code → Codespaces → Create codespace on main**. Wait until the terminal says the post-create command has finished.

**Local:** Node.js 22.13+, then `npm ci`. Install Copilot CLI with `npm install -g @github/copilot`, `winget install GitHub.Copilot` or `brew install --cask copilot-cli`.

Start Copilot CLI from the repository root:

```bash
copilot
```

Trust the folder when asked, and sign in with `/login` if prompted. When Copilot asks to run `npm`, you may approve it for the session.

**Keep two terminals open:** one runs `copilot`, the other is a normal shell. Blocks marked `bash` in this guide go into the **shell**; blocks marked `text` are typed into **Copilot**, including the lines that start with `/` or `!`.

Useful commands inside Copilot CLI:

| Command | What it does |
| --- | --- |
| `/skills list` · `/skills info <name>` | see which skills are loaded and what one contains |
| `/skills add --project <url>` | install a skill's `SKILL.md` from a URL into `.github/skills/` |
| `/skills reload` | pick up skills you edited |
| `/context` | show how full the context window is |
| `/clear` | start a fresh conversation |
| `!<command>` | run a shell command without leaving Copilot |

---

## Module 1 — Fix a bug with a method

**25 min.** A skill gives the method, a subagent explores in its own context, and a test proves the fix.

### The bug report

> **Minimum-rating filter hides games it should show**
>
> On the home page, choosing **3★ & up** shows 18 of 21 games, although no game in the catalog is rated below 3.0. Choosing **4★ & up** hides *Repo Rampart*.

### Phase 1 — Observe the failure

```bash
npm run test:filter-bug
```

It fails every time. The very first run on a fresh install can take 10–30 seconds; reruns take a few seconds. Optional: `npm run dev`, open the site and choose **3★ & up**.

Write down:

- What is visibly wrong?
- What would a **superficial** correction look like?
- What evidence would prove the **root cause**?

Then ask Copilot how it *would* approach the bug — read-only, so nothing is fixed yet — and note its **first step**:

```text
The minimum-rating filter on the home page hides some games that it should show. Describe the first three steps you would take. Do not modify any files.
```

### Phase 2 — Improve the skill

Open [`.github/skills/diagnosing-bugs/SKILL.md`](../.github/skills/diagnosing-bugs/SKILL.md). It is deliberately incomplete in three places, each marked `TODO(workshop n/3)`.

| TODO | Improve | Good looks like |
| --- | --- | --- |
| 1/3 | **Activation** — the `description` | Says what the skill does *and* when to use it, with trigger phrases a teammate would actually type. Copilot matches your prompt against it to decide whether to load the skill automatically. |
| 2/3 | **Method** — Phase 1 | Requires one command that goes red on this symptom, has been run, is deterministic and fast — *before* any hypothesis or edit. |
| 3/3 | **Completion** — definition of done | A fixed report: symptom, loop red→green, root cause at `file:line`, accepted/rejected hypotheses, changed files, regression test, exact commands with results, remaining uncertainty. |

Then, in Copilot CLI, reload the skill and start a fresh conversation:

```text
/skills reload
/clear
```

Ask the **same read-only question** from Phase 1 again and compare the first step. With the improved skill it should start from the failing reproduction instead of from a theory.

> **Why the description still matters:** this repository has only two skills, so Copilot often picks `diagnosing-bugs` by its name alone. In a real repository with many skills, the description decides which one loads. You can always invoke a skill explicitly with `/diagnosing-bugs`.

### Phase 3 — Delegate exploration

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

### Phase 4 — Apply the skill

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

### Phase 5 — Verify separately

```text
Use the task subagent to verify the correction.

Do not change implementation files.
Run the reproduction and the smallest relevant test suite.
Return the exact commands and results.
```

### Phase 6 — Compare

Discuss with your neighbour (or note for the debrief):

1. What information stayed inside the exploration subagent?
2. What information came back to the main session?
3. Which actions came from the **skill** rather than from your prompt?
4. Did the skill improve the method, the output, or both?
5. What **executable evidence** proves the correction?
6. Would another developer likely follow a similar process?

**Checkpoint:** `npm run test:filter-bug`, `npm run test:unit` and `npm run lint` are green, and you have an evidence report in the skill's definition-of-done format. Commit your work:

```bash
git add -A && git commit -m "Fix minimum-rating boundary"
```

---

## Module 2 — Import a skill from the internet

**10 min.** Public skills are reference implementations. Installing the file is the easy part; making it work in *your* repository is the job.

The next feature request is vague on purpose:

> **Players want to see the best-rated games first. Add sorting to the catalog.**

Before anyone writes code, you want Copilot to **interview you** about it. Matt Pocock's `grill-me` skill does exactly that. The links below are pinned to one commit, so everyone gets the same files.

Start a branch for the feature first:

```bash
git switch -c feature/catalog-sorting
```

1. **Inspect before you install.** Open [`grill-me/SKILL.md`](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity/grill-me/SKILL.md). How long is it? What does `disable-model-invocation: true` mean?
2. **Install it** from inside Copilot CLI:

   ```text
   /skills add --project https://raw.githubusercontent.com/mattpocock/skills/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity/grill-me/SKILL.md
   ```

3. **Try it:**

   ```text
   /grill-me I want to add sorting to the game catalog on the home page.
   ```

   Watch the tool calls. Something is missing. Note what the interview looks like: how many questions at once, whether Copilot recommends answers, and whether it asks you things it could look up itself.

   If Copilot offers to download the missing piece by itself, **decline** for now. You would not install an unreviewed dependency without reading it first, and a skill is no different.

4. **Make it work.** Read the one-line body of the skill again, work out what it depends on, and install that too. (The upstream folder is [`skills/productivity`](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity).) Then:

   ```text
   /skills reload
   /clear
   /grill-me I want to add sorting to the game catalog on the home page.
   ```

**Checkpoint:** `/skills list` shows both skills; the interview now comes in **numbered rounds**, each question has a **➡️ recommended answer**, and facts come from reading the code (often in a subagent) instead of from you.

> **Why two skills?** `grill-me` is *user-invoked*: only you can start it, by typing `/grill-me`. It hands over to `grilling`, a *model-invoked* skill that holds the actual method and that other skills can reuse. `disable-model-invocation: true` is what keeps the model from starting `grill-me` on its own.

---

## Module 3 — Grill the feature, then write the spec

**15 min.** The decisions are yours. The facts are Copilot's job.

### 3.1 Answer the interview · 8 min

Keep going in the same conversation. Answer each round; accept, change or reject the recommendations, and end with *"Next round, please."*

- **Challenge at least one recommendation** and see how the next round changes.
- Watch which questions Copilot answers **by itself**, by reading the code.
- If Copilot starts **editing files**, press `Esc`. A grilling session ends in a shared understanding, not in code.
- **Time-box it.** Grilling is relentless on purpose. After three rounds, say:

  ```text
  Accept your recommendation for anything still open, then summarise the settled decisions.
  ```

### 3.2 Turn the decisions into a spec · 7 min

Do **not** run `/clear`: the next skill writes the spec from this conversation.

1. Install Matt Pocock's `to-spec`:

   ```text
   /skills add --project https://raw.githubusercontent.com/mattpocock/skills/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/to-spec/SKILL.md
   ```

2. Run `/to-spec` and watch what it expects. **Do not let it create issues or labels in GitHub.** Stop it with `Esc` if it tries.
3. **Adapt it to this repository.** Open `.github/skills/to-spec/SKILL.md` and change the method so that the spec is saved as `docs/specs/catalog-sorting.md`, with no issue tracker, labels or setup skill involved. That takes about three edits.
4. `/skills reload`, then `/to-spec` again.

**Checkpoint:** `docs/specs/catalog-sorting.md` exists and covers the sort options, where unrated games go, tie-breaks, the URL, what **Clear filters** does, and the test seams. Commit:

```bash
git add -A && git commit -m "Spec: catalog sorting"
```

---

## Module 4 — Build it test-first

**35 min.** A skill makes "test first" the default. A subagent finds the seams. A separate subagent proves the result.

### 4.1 Import `tdd` — the whole folder · 5 min

Look at [`skills/engineering/tdd`](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd) first. `SKILL.md` links to two supporting files that `/skills add` does not download.

```text
/skills add --project https://raw.githubusercontent.com/mattpocock/skills/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd/SKILL.md
!curl -fsSL -o .github/skills/tdd/tests.md https://raw.githubusercontent.com/mattpocock/skills/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd/tests.md
!curl -fsSL -o .github/skills/tdd/mocking.md https://raw.githubusercontent.com/mattpocock/skills/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/tdd/mocking.md
```

On Windows PowerShell, use `curl.exe` instead of `curl`.

### 4.2 Make it yours · 3 min

Open `.github/skills/tdd/SKILL.md`:

- It points to a `codebase-design` skill that you do not have. Replace that pointer with one line of your own, or remove it.
- Add a short **In this repository** section: where unit tests live, the catalog-test pattern, where the E2E specs live, and the exact commands to run one test file, the unit suite, lint, `npm run typecheck:all` and one E2E spec. `.github/skills/diagnosing-bugs/references/repository-testing.md` has most of them.

Then `/skills reload` and `/clear`. Commit, and tag the point that the review in Module 5 compares against:

```bash
git add -A && git commit -m "Import and adapt tdd" && git tag build-start
```

### 4.3 Find the seams in a separate context · 4 min

```text
Use the explore subagent to prepare the implementation of docs/specs/catalog-sorting.md.

Do not modify files.

Return only:
- the public interface to add, and where it should live
- existing tests to copy as prior art
- the test seams (unit, catalog, E2E)
- the smallest vertical slices, in order
```

### 4.4 Red, then green · 20 min

```text
Use the tdd skill to implement docs/specs/catalog-sorting.md, using the explore findings.

Scope for now: the sort module at the unit seam, then one E2E scenario:
"Highest rated" reorders the cards and updates the status line. Stop there and list what is left.

Confirm the seams with me before writing any test.
One slice at a time: write one failing test, show me the red run, then write the minimal code to make it green.
```

Watch for:

- Does it ask you to **confirm the seams** before writing a test?
- Do you see a **red run** before every green run?
- Are the expected values **independent literals**, not recomputed the way the code computes them?
- When a new test passes straight away, does Copilot **say so**? Such a test has not proved anything yet: strengthen it until it can fail, or drop it.

The remaining scenarios from the spec are a stretch goal (see [Finished early?](#finished-early)).

### 4.5 Verify separately · 3 min

```text
Use the task subagent to verify the catalog-sorting feature.

Do not change files.
Run npm run test:unit, npm run lint, npm run typecheck:all and the E2E specs for filtering and sorting.
Return the exact commands and results.
```

Optional: `npm run dev`, open the site and try **Sort by → Highest rated** with **4★ & up**.

**Checkpoint:** new unit tests and one E2E scenario exist, you saw each fail before it passed, and the task subagent reports everything green. Commit:

```bash
git add -A && git commit -m "Add catalog sorting"
```

---

## Module 5 — Review in two independent contexts

**10 min.** A reviewer that shares the author's context tends to agree with the author. This skill gives each review its own subagent.

1. Install Matt Pocock's `code-review`:

   ```text
   /skills add --project https://raw.githubusercontent.com/mattpocock/skills/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/code-review/SKILL.md
   ```

2. **Read it before you run it.** It starts two subagents in parallel: *Standards* and *Spec*. Which file does it expect that this repository does not have? Where are this repository's standards (hint: `.github/`)? Where is the spec? Adapt those lines, then `/skills reload`.
3. Run it:

   ```text
   Use the code-review skill to review the changes since build-start against docs/specs/catalog-sorting.md.
   ```

4. For each finding, decide: **fix** it or **reject** it with a reason. A behavioural finding gets a failing test first; a consistency or refactoring finding can rely on the existing checks. Ask the task subagent to re-run the checks after any fix.

**Checkpoint:** you saw two subagents run in parallel, their findings are reported under **Standards** and **Spec** separately, and every finding is fixed or rejected with a reason.

---

## Module 6 — Hand off and ship

**5 min.**

1. Commit your review fixes, if you made any, so the handoff describes the final state:

   ```bash
   git status --short
   git add -A && git commit -m "Apply review findings"   # only if git status listed changes
   ```

2. ```text
   Use the handoff skill to hand the catalog-sorting feature to a teammate who has not seen this session.
   ```

   Check that it references files, tests and commits by path instead of pasting them.
3. **Optional:** in your own copy of the repository (**Use this template**, or a fork with Actions enabled), push `feature/catalog-sorting` and open a pull request to `main`. CI runs lint, typecheck, unit and E2E tests, and Copilot code review on GitHub also reads the skills in `.github/skills/`.

**Checkpoint:** a handoff another engineer could act on, and a branch whose checks are green.

---

## Finished early?

Pick one.

1. **Finish the spec.** Ask the tdd skill for the remaining catalog and E2E scenarios in `docs/specs/catalog-sorting.md`, one red run at a time.
2. **Write your own skill from what you just did.** Create `.github/skills/adding-a-catalog-control/SKILL.md` (30 lines at most): where the pure helper goes, the `data-*` attributes, the URL key, the status line, the three test seams and the commands. Then `/skills reload`, `/clear` and ask: *"Add a search box that filters games by title."* Does Copilot load your skill and follow it? Do the tests prove the result?
3. **A/B the method.** Run `!copilot skill disable tdd`, `/skills reload` and `/clear`, then ask for a small change such as *"Add a Title (Z–A) sort option."* Undo it with `git restore .`, run `!copilot skill enable tdd`, reload, clear and ask again. Which run wrote the test first?
4. **Second opinion.** Run `/rubber-duck` on your spec or your implementation and compare its feedback with the `code-review` findings.
5. **Let CI decide.** Open the pull request from Module 6 and watch the checks.

---

## Done when

- [ ] **Module 1:** `npm run test:filter-bug`, `npm run test:unit` and `npm run lint` are green; a regression test would fail on the original code; no test expectation was weakened; you have an evidence report.
- [ ] **Module 2:** `grill-me` works because its dependency is installed, and you can explain why it is two skills.
- [ ] **Module 3:** `docs/specs/catalog-sorting.md` records your decisions, and `to-spec` writes a file instead of an issue.
- [ ] **Module 4:** the unit seam and one E2E scenario went red before green; unit, lint, `typecheck:all` and E2E are green.
- [ ] **Module 5:** every review finding is fixed or rejected with a reason.
- [ ] **Module 6:** a handoff someone else could continue from.

## Catch up

Commit or stash your work first (`git stash -u`), then run the command for the module you want to start **in the shell**:

| Start at | Command | What you get |
| --- | --- | --- |
| Module 2 | `git fetch origin && git switch -C feature/catalog-sorting origin/checkpoint-feature` | bug fixed, completed `diagnosing-bugs` |
| Module 3 | `git fetch origin && git switch -C feature/catalog-sorting origin/checkpoint-grill` | + working `grill-me` and `grilling` |
| Module 4 | `git fetch origin && git switch -C feature/catalog-sorting origin/checkpoint-build` | + adapted `to-spec` and a reference spec |
| Module 5 or 6 | as for Module 4, then `git tag -f build-start && git checkout origin/solution -- src e2e-tests && git commit -m "Reference implementation"` | + the reference implementation to review and hand off |

Then run `/skills reload` and `/clear` in Copilot CLI.

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

**Module 1: start over on the code** — discards your changes in `src/` and `e2e-tests/` (including any regression test), keeps your `SKILL.md` edits:

```bash
git restore --source=HEAD -- src e2e-tests
```

**Module 1: compare your skill with the facilitator's version:**

```bash
git fetch origin && git diff HEAD origin/demo-start -- .github/skills/diagnosing-bugs/SKILL.md
```

**Windows without a Codespace:** use the Node command `node .github/skills/diagnosing-bugs/scripts/feedback-loop.mjs --runs 3 -- npm run test:filter-bug` instead of the `.sh` script.

**Other IDEs:** Copilot CLI runs in any terminal, so you can follow along from JetBrains, Visual Studio or a plain shell. VS Code agent mode also loads the skills in `.github/skills/`.
