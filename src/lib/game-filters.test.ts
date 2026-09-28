import { describe, it, expect } from 'vitest';
import type { Game } from '../types/game';
import {
    NO_FILTERS,
    applyGameFilters,
    matchesGameFilters,
    meetsMinimumRating,
    minRatingLabel,
    normalizeRatingThreshold,
    parseGameFilters,
    toFilterQuery,
    type GameFilters,
} from './game-filters';

function makeGame(id: number, title: string, starRating: number | null, categoryId: number | null): Game {
    return {
        id,
        title,
        description: `${title} description`,
        starRating,
        category: categoryId === null ? null : { id: categoryId, name: `Category ${categoryId}` },
        publisher: { id: 1, name: 'Pub One' },
    };
}

describe('normalizeRatingThreshold', () => {
    it.each([
        [4, 4],
        [4.2, 4],
        [4.7, 4.5],
        [3.5, 3.5],
        [9, 5],
        [-1, 0],
    ])('snaps %d onto the half-star steps as %d', (input: number, expected: number) => {
        expect(normalizeRatingThreshold(input)).toBe(expected);
    });
});

describe('parseGameFilters', () => {
    it('returns no active filters for an empty query string', () => {
        expect(parseGameFilters(new URLSearchParams(''))).toEqual(NO_FILTERS);
    });

    it('parses the minimum rating and category from the query string', () => {
        expect(parseGameFilters(new URLSearchParams('minRating=4&category=2'))).toEqual({
            minRating: 4,
            categoryId: 2,
        });
    });

    it('normalizes the minimum rating onto half-star steps', () => {
        expect(parseGameFilters(new URLSearchParams('minRating=3.7')).minRating).toBe(3.5);
    });

    it.each(['', '   ', 'abc', '0', '-2'])('ignores an unusable minimum rating %j', (raw: string) => {
        expect(parseGameFilters(new URLSearchParams({ minRating: raw })).minRating).toBeNull();
    });

    it.each(['', 'abc', '1.5', '0', '-3'])('ignores an unusable category id %j', (raw: string) => {
        expect(parseGameFilters(new URLSearchParams({ category: raw })).categoryId).toBeNull();
    });
});

describe('toFilterQuery', () => {
    it('omits inactive filters', () => {
        expect(toFilterQuery(NO_FILTERS).toString()).toBe('');
    });

    it('round-trips through parseGameFilters', () => {
        const filters: GameFilters = { minRating: 4.5, categoryId: 3 };
        expect(parseGameFilters(toFilterQuery(filters))).toEqual(filters);
    });
});

describe('meetsMinimumRating', () => {
    it('keeps every game when no minimum rating is set', () => {
        expect(meetsMinimumRating(3.2, null)).toBe(true);
        expect(meetsMinimumRating(null, null)).toBe(true);
    });

    it.each([
        [4.8, 4],
        [4.1, 4],
        [5, 4.5],
    ])('keeps a game rated %d when the minimum is %d', (rating: number, minRating: number) => {
        expect(meetsMinimumRating(rating, minRating)).toBe(true);
    });

    it.each([
        [3.9, 4],
        [3.4, 3.5],
        [4.4, 4.5],
    ])('drops a game rated %d when the minimum is %d', (rating: number, minRating: number) => {
        expect(meetsMinimumRating(rating, minRating)).toBe(false);
    });

    it('drops unrated games when a minimum rating is set', () => {
        expect(meetsMinimumRating(null, 3)).toBe(false);
    });
});

describe('matchesGameFilters', () => {
    it('requires the category to match when a category filter is set', () => {
        const filters: GameFilters = { minRating: null, categoryId: 2 };
        expect(matchesGameFilters({ starRating: 4.6, categoryId: 2 }, filters)).toBe(true);
        expect(matchesGameFilters({ starRating: 4.6, categoryId: 1 }, filters)).toBe(false);
        expect(matchesGameFilters({ starRating: 4.6, categoryId: null }, filters)).toBe(false);
    });

    it('requires both the category and the minimum rating when combined', () => {
        const filters: GameFilters = { minRating: 4, categoryId: 2 };
        expect(matchesGameFilters({ starRating: 4.6, categoryId: 2 }, filters)).toBe(true);
        expect(matchesGameFilters({ starRating: 3.6, categoryId: 2 }, filters)).toBe(false);
        expect(matchesGameFilters({ starRating: 4.6, categoryId: 1 }, filters)).toBe(false);
    });
});

describe('applyGameFilters', () => {
    const games: Game[] = [
        makeGame(1, 'Alpha', 4.6, 1),
        makeGame(2, 'Bravo', 3.2, 1),
        makeGame(3, 'Charlie', 4.9, 2),
        makeGame(4, 'Delta', null, 2),
    ];

    it('returns every game when no filters are active', () => {
        expect(applyGameFilters(games, NO_FILTERS)).toHaveLength(4);
    });

    it('preserves the incoming order of the matching games', () => {
        const result = applyGameFilters(games, { minRating: 4.5, categoryId: null });
        expect(result.map((game) => game.title)).toEqual(['Alpha', 'Charlie']);
    });

    it('filters on the category of each game', () => {
        const result = applyGameFilters(games, { minRating: null, categoryId: 2 });
        expect(result.map((game) => game.title)).toEqual(['Charlie', 'Delta']);
    });
});

describe('minRatingLabel', () => {
    it('describes the threshold as inclusive', () => {
        expect(minRatingLabel(4)).toBe('4★ & up');
    });
});
