# Expected outcome

This file lives only on the `solution` branch.

# Module 1 — the bug

## Root cause

`src/lib/game-filters.ts:91` — `meetsMinimumRating` uses a strict comparison:

```ts
return rating > minRating;
```

The contract is inclusive. `GameFilters.minRating` is documented as "Games rated at or above this value are kept", and the UI labels read "4★ & up". A game rated exactly at the threshold is therefore dropped:

| Filter | Wrongly hidden |
| --- | --- |
| 3★ & up | Bug Buster Brainteaser, Refactor Realms, Terminal Turbulence (all 3.0) |
| 3.5★ & up | Container Chaos (3.5) |
| 4★ & up | Repo Rampart (4.0) |
| 4.5★ & up | none — no game is rated exactly 4.5, which is why the combined-filter test stays green |

**Why the unit tests stayed green:** `game-filters.test.ts` only tried ratings strictly above or below the threshold. No test exercised the boundary.

## The correction

```diff
-    return rating > minRating;
+    return rating >= minRating;
```

One line in one file. The browser filter and catalog callers share this helper, so both are fixed.

## The regression test

Add a boundary case at the seam that owns the rule — the pure helper, in `src/lib/game-filters.test.ts`:

```ts
it.each([
    [3, 3],
    [4, 4],
    [4.5, 4.5],
])('keeps a game rated exactly at the minimum (%d with minimum %d)', (rating: number, minRating: number) => {
    expect(meetsMinimumRating(rating, minRating)).toBe(true);
});
```

It fails on the original code and passes after the correction. The catalog reproduction (`npm run test:filter-bug`) stays in place as the higher-level check.

## Hypotheses a good run considers

| Hypothesis | Verdict | Evidence |
| --- | --- | --- |
| Strict `>` contradicts the inclusive contract | **Accepted** | `meetsMinimumRating(4, 4)` returns `false`; changing `>` to `>=` turns the loop green. |
| `normalizeRatingThreshold` rounds 4 to something else | Rejected | `parseGameFilters('minRating=4').minRating === 4` (existing unit test). |
| Floating-point storage (4.0 stored as 3.999…) | Rejected | Ratings are rounded to one decimal; `4 > 4` is false even for an exact 4. |
| Category join returns `null` and filters games out | Rejected | No category filter is active in the failing cases; 21 games are seeded with categories. |
| Seed or `ratingFromTitle` produces wrong ratings | Rejected | 21 games seeded; minimum is exactly 3.0, which the skipped games have. |

## Superficial corrections to reject

- Editing the expected titles or counts in the catalog test.
- Subtracting an epsilon (`rating > minRating - 0.01`) or changing `normalizeRatingThreshold`.
- Changing `MIN_RATING_OPTIONS` to `2.9`, `3.4`, …
- Special-casing titles or ratings.
- Relabelling the UI to "more than 4★". That changes the requirement and needs a product decision.

## Example evidence report

```text
Symptom:       "3★ & up" shows 18 of 21 games; "4★ & up" hides Repo Rampart (4.0).
Feedback loop: npm run test:filter-bug — red (2 failed) before, green (4 passed) after.
Root cause:    src/lib/game-filters.ts:91 uses `rating > minRating`; the documented contract and UI labels are inclusive.
Hypotheses:    accepted strict comparison; rejected threshold normalisation (parse returns 4),
               float storage (exact 4.0 still fails `>`), category join (no category filter active).
Fix:           src/lib/game-filters.ts — `>` → `>=`.
Regression:    "keeps a game rated exactly at the minimum" in src/lib/game-filters.test.ts.
Verification:  npm run test:filter-bug (4/4), npm run test:unit (83/83), npm run lint (0 problems),
               stretch: npx playwright test e2e-tests/filters.spec.ts (5/5).
Uncertainty:   none for the filter; unrated games are still excluded by design.
```

## Module 1 debrief rubric

| Dimension | Weak | Strong |
| --- | --- | --- |
| Method | Patched after reading code | Loop red first, hypotheses with evidence, then the fix |
| Isolation | All exploration in the main session | Exploration and verification in subagents; compact results back |
| Proof | "Tests pass" | Exact commands, counts, red→green, and a boundary regression test |

# Modules 2–6 — catalog sorting

## Module 2: why `grill-me` half-works

- `grill-me/SKILL.md` has one line of body: *Call the Skill tool with "grilling".* With only `grill-me` installed, Copilot reports `✗ Skill not found: grilling` and improvises: a list of questions, no recommended answers, and questions it could have answered by reading the code.
- The fix is to install `skills/productivity/grilling/SKILL.md` from the same pinned commit.
- `disable-model-invocation: true` makes `grill-me` **user-invoked**: only `/grill-me` starts it. `grilling` is **model-invoked**: the reusable method that other skills (`grill-with-docs`, `triage`, …) also call.

## Module 3: what "good" looks like

The decisions vary between runs, and that is the point. Two rehearsals produced different recommendations for the default order ("Title (A–Z)" versus "Featured") and for **Clear filters** (keep the sort versus reset it). A good spec records whatever the participant decided, and covers:

- sort options and labels; default order; where unrated games go; tie-breaks;
- URL key and values, and what an unknown value does;
- what **Clear filters** does to the sort;
- how the status line and the DOM order behave (accessibility);
- the test seams: unit, catalog and E2E.

The adapted `to-spec` (see `.github/skills/to-spec/SKILL.md` on `checkpoint-build`) differs from upstream in three places: no issue-tracker or setup-skill paragraph, step 3 saves `docs/specs/<feature>.md`, and "Do not create an issue." The reference spec is `docs/specs/catalog-sorting.md`.

## Module 4: the reference implementation

| File | What it holds |
| --- | --- |
| `src/lib/game-sort.ts` | `GameSort`, `SORT_OPTIONS`, `parseGameSort`, `withSortQuery`, `compareGames`, `sortGames`, `resultSummary` — pure and framework-free |
| `src/lib/game-sort.test.ts` | parser, query writer, both directions, tie-breaks, unrated last, no mutation, status text |
| `src/lib/game-sort.catalog.test.ts` | the default sort reproduces the rendered order; the 3.0 and 5.0 ties break by title |
| `src/components/GameFilters.astro` | **Sort by** select after **Category**; the script moves the card elements and writes `?sort=` |
| `e2e-tests/sort.spec.ts` | default order, "Highest rated" with its status text, shared URL, sort + filter, Clear filters keeps the sort, back to title order |

Participant implementations will use other names (the rehearsal produced `game-sorting.ts`, `parseSortOption` and `toSortQuery`). What matters is the evidence: every new test was seen red before green (or was called out as passing at once and then strengthened or dropped), expected values are literals, and unit, lint, `typecheck:all` and E2E are green. The reference solution covers the whole spec; the exercise asks for the unit seam plus one E2E scenario.

Adapted `tdd`: supporting files `tests.md` and `mocking.md` present; the `codebase-design` pointer replaced; an **In this repository** section with the three seams and the commands.

## Module 5: review findings

The adapted `code-review` reviews the diff since `build-start` and launches two subagents in parallel. In the rehearsal:

- **Standards:** one judgement call. The new select used `name="sort"` instead of `name={SORT_QUERY_KEY}`, unlike the two existing selects.
- **Spec:** no findings.

A strong participant either fixes the finding (and argues whether a one-line consistency fix needs a failing test) or rejects it with a reason.

## Module 6: a good handoff

References files, test names and the commit by path; lists exact commands with counts; names the open review finding under *Remaining uncertainty*; suggests one concrete next step.

## Debrief rubric for modules 2–6

| Dimension | Weak | Strong |
| --- | --- | --- |
| Reuse | Installed the file and moved on | Read it first, found the dependency or assumption, adapted a few lines |
| Method | Implementation first, tests added after | Seams agreed, red before every green, "passed at once" called out |
| Isolation | One context for writing and reviewing | Explore, verify and both reviews in their own subagents |
| Proof | "Looks good" | Exact commands and counts, and each review finding fixed or rejected with a reason |

