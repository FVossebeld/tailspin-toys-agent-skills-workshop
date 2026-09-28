/**
 * Pure helpers for ordering the game catalog.
 *
 * Used by the "Sort by" control on the home page (`GameFilters.astro`) and by
 * catalog-level callers that work with `Game` objects (`sortGames`).
 *
 * Decisions (see `docs/specs/catalog-sorting.md`):
 * - the default order is title A–Z, which matches the order the page renders;
 * - unrated games always sort last, in both rating directions;
 * - ties are broken by title A–Z so the order is deterministic.
 */

/** Sort orders offered in the UI. */
export type GameSort = 'title-asc' | 'rating-desc' | 'rating-asc';

/** The order used when the URL has no (or an unknown) `sort` value. */
export const DEFAULT_SORT: GameSort = 'title-asc';

/** Query-string key used to share a sorted view, e.g. `/?sort=rating-desc`. */
export const SORT_QUERY_KEY = 'sort';

/** Sort choices offered in the UI, in display order. */
export const SORT_OPTIONS: readonly { value: GameSort; label: string }[] = [
    { value: 'title-asc', label: 'Title (A–Z)' },
    { value: 'rating-desc', label: 'Highest rated' },
    { value: 'rating-asc', label: 'Lowest rated' },
];

/** The minimal shape needed to order a game. */
export interface SortableGame {
    title: string;
    starRating: number | null;
}

function isGameSort(value: string | null): value is GameSort {
    return SORT_OPTIONS.some((option) => option.value === value);
}

/** Read the sort order from URL query parameters, falling back to the default. */
export function parseGameSort(params: URLSearchParams): GameSort {
    const raw = params.get(SORT_QUERY_KEY);
    return isGameSort(raw) ? raw : DEFAULT_SORT;
}

/** Write the sort order into query parameters, omitting the default so plain URLs stay plain. */
export function withSortQuery(params: URLSearchParams, sort: GameSort): URLSearchParams {
    const next = new URLSearchParams(params);
    if (sort === DEFAULT_SORT) {
        next.delete(SORT_QUERY_KEY);
    } else {
        next.set(SORT_QUERY_KEY, sort);
    }
    return next;
}

function compareTitles(a: string, b: string): number {
    return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

/** Comparator for `Array.prototype.sort`. */
export function compareGames(a: SortableGame, b: SortableGame, sort: GameSort): number {
    if (sort !== 'title-asc' && a.starRating !== b.starRating) {
        if (a.starRating === null) {
            return 1;
        }
        if (b.starRating === null) {
            return -1;
        }
        return sort === 'rating-desc' ? b.starRating - a.starRating : a.starRating - b.starRating;
    }
    return compareTitles(a.title, b.title);
}

/** Return a sorted copy; the input array is not modified. */
export function sortGames<T extends SortableGame>(games: readonly T[], sort: GameSort): T[] {
    return [...games].sort((a, b) => compareGames(a, b, sort));
}

/** Label for a sort order, e.g. `Highest rated`. */
export function sortLabel(sort: GameSort): string {
    return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? SORT_OPTIONS[0].label;
}

/**
 * Text for the result-count status line, e.g.
 * `Showing 21 of 21 games` or `Showing 18 of 21 games, sorted by highest rated`.
 */
export function resultSummary(visible: number, total: number, sort: GameSort): string {
    const base = `Showing ${visible} of ${total} games`;
    return sort === DEFAULT_SORT ? base : `${base}, sorted by ${sortLabel(sort).toLowerCase()}`;
}
