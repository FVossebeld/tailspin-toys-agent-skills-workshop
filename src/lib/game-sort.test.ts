import { describe, it, expect } from 'vitest';
import {
    DEFAULT_SORT,
    SORT_OPTIONS,
    compareGames,
    parseGameSort,
    resultSummary,
    sortGames,
    sortLabel,
    withSortQuery,
    type GameSort,
    type SortableGame,
} from './game-sort';

function titles(games: SortableGame[]): string[] {
    return games.map((game) => game.title);
}

const games: SortableGame[] = [
    { title: 'Bravo', starRating: 4 },
    { title: 'alpha', starRating: 3.5 },
    { title: 'Delta', starRating: null },
    { title: 'Charlie', starRating: 4 },
    { title: 'Echo', starRating: 5 },
];

describe('parseGameSort', () => {
    it('defaults to title A–Z when the query string has no sort', () => {
        expect(parseGameSort(new URLSearchParams(''))).toBe('title-asc');
    });

    it.each(['title-asc', 'rating-desc', 'rating-asc'])('accepts %s', (value: string) => {
        expect(parseGameSort(new URLSearchParams({ sort: value }))).toBe(value);
    });

    it.each(['', 'rating', 'RATING-DESC', 'price-asc'])('falls back to the default for %j', (value: string) => {
        expect(parseGameSort(new URLSearchParams({ sort: value }))).toBe(DEFAULT_SORT);
    });
});

describe('withSortQuery', () => {
    it('adds a non-default sort next to existing filters', () => {
        const params = withSortQuery(new URLSearchParams('minRating=4'), 'rating-desc');
        expect(params.toString()).toBe('minRating=4&sort=rating-desc');
    });

    it('omits the default sort so a plain URL stays plain', () => {
        const params = withSortQuery(new URLSearchParams('minRating=4&sort=rating-asc'), 'title-asc');
        expect(params.toString()).toBe('minRating=4');
    });

    it('does not modify the parameters it was given', () => {
        const original = new URLSearchParams('category=2');
        withSortQuery(original, 'rating-desc');
        expect(original.toString()).toBe('category=2');
    });
});

describe('sortGames', () => {
    it('orders by title A–Z, ignoring case, for the default sort', () => {
        expect(titles(sortGames(games, 'title-asc'))).toEqual(['alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
    });

    it('puts the highest rated first and breaks ties by title', () => {
        expect(titles(sortGames(games, 'rating-desc'))).toEqual(['Echo', 'Bravo', 'Charlie', 'alpha', 'Delta']);
    });

    it('puts the lowest rated first and breaks ties by title', () => {
        expect(titles(sortGames(games, 'rating-asc'))).toEqual(['alpha', 'Bravo', 'Charlie', 'Echo', 'Delta']);
    });

    it.each(['rating-desc', 'rating-asc'] as GameSort[])('keeps unrated games last for %s', (sort: GameSort) => {
        expect(sortGames(games, sort).at(-1)?.title).toBe('Delta');
    });

    it('returns a copy and leaves the input order untouched', () => {
        const before = titles(games);
        sortGames(games, 'rating-desc');
        expect(titles(games)).toEqual(before);
    });

    it('orders two unrated games by title', () => {
        const zulu: SortableGame = { title: 'Zulu', starRating: null };
        const yankee: SortableGame = { title: 'Yankee', starRating: null };
        expect(compareGames(zulu, yankee, 'rating-desc')).toBeGreaterThan(0);
    });
});

describe('sortLabel and resultSummary', () => {
    it('offers the three agreed sort options in display order', () => {
        expect(SORT_OPTIONS.map((option) => option.label)).toEqual(['Title (A–Z)', 'Highest rated', 'Lowest rated']);
        expect(sortLabel('rating-asc')).toBe('Lowest rated');
    });

    it('keeps the original status text for the default sort', () => {
        expect(resultSummary(21, 21, 'title-asc')).toBe('Showing 21 of 21 games');
    });

    it('adds the order to the status text for a non-default sort', () => {
        expect(resultSummary(8, 21, 'rating-desc')).toBe('Showing 8 of 21 games, sorted by highest rated');
    });
});
