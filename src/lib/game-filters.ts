/**
 * Pure helpers for filtering the game catalog.
 *
 * The same rules are used in two places:
 * - the browser filter controls on the home page (`GameFilters.astro`), and
 * - catalog-level callers that work with `Game` objects (`applyGameFilters`).
 *
 * Kept framework-free and side-effect-free so the logic is unit-testable
 * without the Astro runtime (see `game-filters.test.ts`).
 */
import { clampRating } from './ratings';
import type { Game } from '../types/game';

/** Active catalog filters. `null` means "do not filter on this field". */
export interface GameFilters {
    /** Minimum star rating. Games rated at or above this value are kept. */
    minRating: number | null;
    /** Category id to match. */
    categoryId: number | null;
}

/** The minimal shape needed to decide whether a game matches the filters. */
export interface FilterableGame {
    starRating: number | null;
    categoryId: number | null;
}

/** Filters that match every game. */
export const NO_FILTERS: GameFilters = { minRating: null, categoryId: null };

/** Minimum-rating choices offered in the UI ("3★ & up", "3.5★ & up", ...). */
export const MIN_RATING_OPTIONS: readonly number[] = [3, 3.5, 4, 4.5];

/** Query-string keys used to share a filtered view, e.g. `/?minRating=4&category=2`. */
export const FILTER_QUERY_KEYS = {
    minRating: 'minRating',
    categoryId: 'category',
} as const;

function parseNumber(raw: string | null): number | null {
    if (raw === null || raw.trim() === '') {
        return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
}

/**
 * Snap a requested threshold into the 0–5 range and onto the half-star
 * steps offered in the UI, so `?minRating=4.2` behaves like "4★ & up".
 */
export function normalizeRatingThreshold(value: number): number {
    return Math.floor(clampRating(value) * 2) / 2;
}

/** Read filters from URL query parameters such as `?minRating=4&category=2`. */
export function parseGameFilters(params: URLSearchParams): GameFilters {
    const minRating = parseNumber(params.get(FILTER_QUERY_KEYS.minRating));
    const categoryId = parseNumber(params.get(FILTER_QUERY_KEYS.categoryId));

    return {
        minRating: minRating === null || minRating <= 0 ? null : normalizeRatingThreshold(minRating),
        categoryId: categoryId !== null && Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null,
    };
}

/** Serialize filters back into query parameters (omitting inactive filters). */
export function toFilterQuery(filters: GameFilters): URLSearchParams {
    const params = new URLSearchParams();
    if (filters.minRating !== null) {
        params.set(FILTER_QUERY_KEYS.minRating, String(filters.minRating));
    }
    if (filters.categoryId !== null) {
        params.set(FILTER_QUERY_KEYS.categoryId, String(filters.categoryId));
    }
    return params;
}

/**
 * Whether a rating satisfies the minimum-rating filter.
 *
 * Unrated games never satisfy an active minimum-rating filter.
 */
export function meetsMinimumRating(rating: number | null, minRating: number | null): boolean {
    if (minRating === null) {
        return true;
    }
    if (rating === null) {
        return false;
    }
    return rating > minRating;
}

/** Whether a game matches every active filter. */
export function matchesGameFilters(game: FilterableGame, filters: GameFilters): boolean {
    if (filters.categoryId !== null && game.categoryId !== filters.categoryId) {
        return false;
    }
    return meetsMinimumRating(game.starRating, filters.minRating);
}

/** Apply filters to catalog games, preserving their existing order. */
export function applyGameFilters(games: Game[], filters: GameFilters): Game[] {
    return games.filter((game) =>
        matchesGameFilters({ starRating: game.starRating, categoryId: game.category?.id ?? null }, filters),
    );
}

/** Human-readable label for a minimum-rating option, e.g. `4★ & up`. */
export function minRatingLabel(minRating: number): string {
    return `${minRating}★ & up`;
}
