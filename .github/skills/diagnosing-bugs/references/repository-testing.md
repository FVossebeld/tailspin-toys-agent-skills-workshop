# Repository testing reference

Everything runs from the repository root with Node.js 22.13+. A command that exits non-zero is **red**; exit code 0 is **green**.

## Commands, fastest first

| Purpose | Command | Typical time |
| --- | --- | --- |
| Provided reproduction for the catalog rating-filter report | `npm run test:filter-bug` | ~2 s |
| Repeat any command and check it is deterministic | `node .github/skills/diagnosing-bugs/scripts/feedback-loop.mjs --runs 3 -- npm run test:filter-bug` | ~6 s |
| Same, as a shell script (Codespaces, Linux, macOS, Git Bash) | `bash .github/skills/diagnosing-bugs/scripts/reproduce-filter-bug.sh` | ~6 s |
| One Vitest file | `npx vitest run src/lib/<module>.test.ts` | ~2 s |
| One Vitest test by name | `npx vitest run src/lib/<module>.test.ts -t "<part of the test name>"` | ~2 s |
| All unit tests | `npm run test:unit` | ~3 s |
| Lint | `npm run lint` | ~10 s |
| Type check (`tsgo` + `astro check`) | `npm run typecheck:all` | ~20 s |
| One Playwright spec (builds and previews the site first) | `npx playwright test e2e-tests/<feature>.spec.ts` | ~45 s |
| All Playwright specs | `npm run test:e2e` | ~60 s |

## Where tests live

- Unit tests are co-located with the code as `<module>.test.ts` under `db/` and `src/lib/`.
- `src/lib/game-filters.catalog.test.ts` is the catalog-level reproduction. It seeds the real `db/games.csv` catalog into an in-memory database and filters it exactly as the home page does.
- End-to-end specs live in `e2e-tests/` (`home`, `games`, `filters`, `accessibility`).

## Conventions that matter for a regression test

- Follow `.github/instructions/unit-tests.instructions.md`: Arrange-Act-Assert, one behaviour per `it`, table-driven `it.each` for input/output matrices, explicit types.
- Data-access helpers take an injectable `db`. Use `createTestDatabase()` from `db/test-helpers.ts`; never mock the database.
- Pure helpers (`src/lib/*.ts` without a `db` argument) are tested directly with no database.
- Seeded star ratings are deterministic (`ratingFromTitle` in `db/transforms.ts`), so catalog-level assertions are stable.

## Gotchas

- Locally, Playwright reuses a server already listening on port 4321. Stop stale `astro dev` or `astro preview` processes before trusting an E2E result.
- If `db/games.csv` changes, delete `tailspin.db` and run `npm run db:setup`.
- Do not "fix" a red loop by editing its expectations. Change the expectation only when the requirement itself is wrong, and say so explicitly.
