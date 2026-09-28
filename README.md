# Tailspin Toys — Agent Skills & Subagents workshop

> **The model remains probabilistic. The skill makes the method more repeatable. The subagent keeps bounded work focused. The test proves the outcome.**

A hands-on workshop repository for GitHub Copilot. It is a fork of the [Tailspin Toys](https://github.com/github-samples/tailspin-toys) sample with one deliberately introduced defect, a prepared `diagnosing-bugs` skill, and a 90-minute exercise in six modules:

1. **Fix a bug with a method:** improve a skill, explore in a subagent, verify with a separate subagent.
2. **Import a skill from the internet:** install Matt Pocock's `grill-me` and make it work.
3. **Grill the feature, then write the spec:** design catalog sorting and adapt `to-spec` to this repository.
4. **Build it test-first:** import `tdd` with its supporting files and go red → green.
5. **Review in two independent contexts:** a `code-review` skill that runs two subagents in parallel.
6. **Hand off and ship:** `handoff`, commit, optional pull request.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/FVossebeld/tailspin-toys-agent-skills-workshop?quickstart=1)

## Start the exercise

1. Open a Codespace on `main` (button above) — or clone locally with Node.js 22.13+ and run `npm ci`.
2. Run the reproduction. It is **meant to fail**:

   ```bash
   npm run test:filter-bug
   ```

3. Follow [`workshop/EXERCISE.md`](workshop/EXERCISE.md).

The Codespace installs [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli) for you. Locally, install it with `npm install -g @github/copilot`, `winget install GitHub.Copilot` or `brew install --cask copilot-cli`, then run `copilot` from the repository root.

## Branches

| Branch | State | Used for |
| --- | --- | --- |
| `main` | Defect present, reproduction red, **incomplete** `diagnosing-bugs` skill (3 TODOs) | Exercise start (Module 1) |
| `demo-start` | Defect present, reproduction red, **completed** skill | Facilitator live demo |
| `checkpoint-feature` | Defect fixed, completed skill | Catch up at Module 2 |
| `checkpoint-build` | + imported and adapted `grill-me`, `grilling`, `to-spec`, `tdd`, and a reference spec | Catch up at Module 4 |
| `solution` | + catalog sorting with unit and E2E tests, adapted `code-review`, facilitator guide | Reference and fallback |

The tag `workshop-start` marks the original state of `main`. Please finish the exercise before opening `solution`.

## What the workshop adds

```text
.github/
├── agents/investigator.agent.md        # read-only custom agent (optional)
└── skills/
    ├── diagnosing-bugs/
    │   ├── SKILL.md                    # the method: red loop → hypotheses → fix → evidence
    │   ├── references/
    │   │   ├── architecture-summary.md
    │   │   └── repository-testing.md
    │   └── scripts/
    │       ├── feedback-loop.mjs       # runs a command N times: red/green, deterministic, fast?
    │       └── reproduce-filter-bug.sh
    └── handoff/SKILL.md
src/lib/game-filters.ts                 # catalog filters (contains the defect on main)
src/lib/game-filters.catalog.test.ts    # the provided reproduction (npm run test:filter-bug)
src/components/GameFilters.astro        # filter controls on the home page
e2e-tests/filters.spec.ts               # browser-level filter checks
workshop/EXERCISE.md                    # participant guide
```

The imported skills come from [mattpocock/skills](https://github.com/mattpocock/skills), pinned to one commit so that every participant gets the same files. See `workshop/THIRD-PARTY-NOTICES.md` on the checkpoint branches.

CI (`.github/workflows/run-tests.yml`) runs on pull requests to `main` and on pushes to `solution`. It does not run on pushes to `main`, because `main` is red on purpose.

## Credits

- Application: [github-samples/tailspin-toys](https://github.com/github-samples/tailspin-toys) (MIT).
- Skills: adapted from Matt Pocock's [skills](https://github.com/mattpocock/skills) (MIT): `diagnosing-bugs` and `handoff` here, plus `grill-me`, `grilling`, `to-spec`, `tdd` and `code-review` in the exercise.
- Concepts: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills), [Copilot CLI context management](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/context-management), [Agent Skills specification](https://agentskills.io/specification).

---

# About the Tailspin Toys app

Tailspin Toys is a crowdfunding platform for games with a developer theme. The project is a website for a fictional game crowd-funding company, built as a single [Astro](https://astro.build/) site (fully prerendered/static output) styled with [Tailwind CSS](https://tailwindcss.com/). Its data lives in a local SQLite database accessed through [Drizzle ORM](https://orm.drizzle.team/) and Node.js's built-in SQLite driver; pages query the database directly in frontmatter at build time, so there is no separate backend service.

## Architecture

- **Astro 7** — pages, layouts, components, and routing. `output: 'static'`, so the whole site is prerendered to HTML at build time.
- **Drizzle ORM + Node SQLite** — the data layer. The schema lives in `db/schema.ts`; data is seeded from `db/games.csv`. Migrations are managed with `drizzle-kit`.
- **Tailwind CSS v4** — styling via utility classes (dark theme).
- **Vitest** — unit tests for the data layer and pure transforms.
- **Playwright** — end-to-end tests run against the built static site.

The database is migrated and seeded automatically before `dev`/`build` (via the `predev`/`prebuild` npm scripts) and is written to the gitignored `tailspin.db` file.

The home page lets visitors filter the catalog by **minimum rating** and **category**. Filtering runs in the browser with the pure helpers in `src/lib/game-filters.ts`, and a filtered view can be shared through the query string (for example `/?minRating=4`).

## Getting started

Install dependencies once with Node.js 22.13 or later:

```bash
npm ci
npx playwright install chromium   # only needed to run the E2E tests
```

## Launch the site

```bash
npm run dev
```

`predev` migrates and seeds the local database first. Then navigate to the [website](http://localhost:4321) to see the site!

To preview a production build instead:

```bash
npm run build      # prebuild migrates + seeds, then builds the static site
npm run preview
```

## Database

The SQLite database is built from `db/games.csv` — there is no live data to migrate.

```bash
npm run db:generate   # generate a migration after editing db/schema.ts
npm run db:migrate    # apply migrations
npm run db:seed       # seed from games.csv (idempotent)
npm run db:setup      # migrate + seed (run automatically by predev/prebuild)
npm run db:export     # write the seeded catalog to db/catalog.json
```

> [!NOTE]
> Seeding is idempotent — it skips games that already exist (matched by title) rather than reconciling changed rows. CI always starts from a clean database, so it reflects `games.csv` exactly. Locally, if you edit or remove rows in `games.csv`, delete `tailspin.db` and re-run `npm run db:setup` to fully regenerate.

## Running tests

```bash
npm run test:filter-bug   # the workshop reproduction only (Vitest)
npm run test:unit         # all Vitest unit tests (transforms + data-access + filter helpers)
npm run test:e2e          # Playwright E2E tests (builds + previews the static site first)
```

## Linting

```bash
npm run lint
```

## Type checking

The project runs on **TypeScript 7** (the native Go compiler, `tsgo`) for type checking, adopted side-by-side via the [`@typescript/native-preview`](https://www.npmjs.com/package/@typescript/native-preview) package. The classic `typescript` package is intentionally kept at v6 so ESLint + `typescript-eslint` and `astro check` keep working unchanged.

```bash
npm run typecheck        # tsgo (TS 7) type-checks the pure TypeScript (db/, src/lib/, src/types/, configs, tests)
npm run typecheck:astro  # astro sync + astro check type-check .astro files (on the classic TypeScript package)
npm run typecheck:all    # both of the above
```

## License

This project is licensed under the terms of the MIT open source license. Please refer to the [LICENSE](./LICENSE) for the full terms.

## Disclaimer

This app is not intended for use in a production environment, nor is it built as an example of what a production app should look like. The defect on `main` is intentional.
