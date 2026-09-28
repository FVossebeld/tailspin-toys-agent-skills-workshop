# Architecture summary

Tailspin Toys is a single, fully prerendered Astro 7 site. There is no API server: pages query SQLite through Drizzle **at build time**, and the few interactive features run as small scoped browser scripts.

```text
db/games.csv ──seed──▶ SQLite (tailspin.db) ──Drizzle──▶ src/lib/games.ts ──▶ src/pages/*.astro ──build──▶ static HTML
                                                                                  │
                                           src/lib/*.ts pure helpers ◀───────────┴── component <script> (runs in the browser)
```

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Seed data | `db/games.csv`, `db/seed.ts`, `db/transforms.ts` | Parse the CSV and derive deterministic star ratings (3.0–5.0 in 0.1 steps) from each title. |
| Schema | `db/schema.ts`, `db/migrations/` | `games`, `categories`, `publishers`. `star_rating` is a SQLite `REAL`. |
| Data access | `src/lib/games.ts` | Typed queries with an injectable `db` argument, ordered by title or name. |
| Pure helpers | `src/lib/ratings.ts`, `src/lib/game-filters.ts` | Framework-free logic shared by build-time pages, browser scripts and tests. |
| UI | `src/components/`, `src/pages/` | `.astro` components rendered at build time. `GameCard.astro` exposes `data-star-rating` and `data-category-id` for client-side filtering. |
| Browser behaviour | `<script>` blocks in components | Bundled by Astro. They import the same pure helpers from `src/lib/`, so the browser and the tests apply identical rules. |

## Catalog filters (home page)

- Controls: **Minimum rating** (`Any rating`, `3★ & up`, `3.5★ & up`, `4★ & up`, `4.5★ & up`) and **Category**.
- A filtered view is shareable through the query string, for example `/?minRating=4&category=2`.
- The result count (`Showing N of 21 games`) is an ARIA live region.
- Catalog-level callers apply the same rules to `Game` objects.

## Useful facts when investigating

- The catalog has 21 games. Their ratings are stable across builds because they come from a hash of the title.
- `npm run db:setup` rebuilds the local database. Tests use an in-memory database instead.
