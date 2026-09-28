/**
 * Catalog-level checks for sorting, using the real `db/games.csv` catalog.
 *
 * Complements `game-sort.test.ts`: proves the default sort reproduces the
 * order the page already renders, so choosing "Title (A–Z)" after another
 * sort puts every card back where it started.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { seedDatabase } from '../../db/seed';
import type { Database } from './db';
import type { Game } from '../types/game';
import { getAllGames } from './games';
import { applyGameFilters, parseGameFilters } from './game-filters';
import { sortGames } from './game-sort';

describe('catalog sorting', () => {
    let catalog: Game[];

    beforeAll(async () => {
        const db: Database = await createTestDatabase();
        await seedDatabase(db);
        catalog = await getAllGames(db);
    });

    it('reproduces the rendered catalog order for the default sort', () => {
        expect(sortGames(catalog, 'title-asc').map((game) => game.id)).toEqual(catalog.map((game) => game.id));
    });

    it('lists the three 3.0-rated games first, in title order, for "Lowest rated"', () => {
        expect(sortGames(catalog, 'rating-asc').slice(0, 4).map((game) => game.title)).toEqual([
            'Bug Buster Brainteaser',
            'Refactor Realms',
            'Terminal Turbulence',
            'Server Siege',
        ]);
    });

    it('breaks the 5.0 tie at the top by title for "Highest rated"', () => {
        expect(sortGames(catalog, 'rating-desc').slice(0, 2).map((game) => game.title)).toEqual([
            'Deployment Dynasty',
            'Script Strike',
        ]);
    });

    it('sorts only the games that survive the filters', () => {
        const filtered = applyGameFilters(catalog, parseGameFilters(new URLSearchParams('minRating=4.5')));
        const sorted = sortGames(filtered, 'rating-desc');
        expect(sorted).toHaveLength(filtered.length);
        expect(sorted.every((game) => (game.starRating ?? 0) >= 4.5)).toBe(true);
    });
});
