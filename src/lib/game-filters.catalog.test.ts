/**
 * Catalog-level reproduction for the minimum-rating filter.
 *
 * Seeds an in-memory database from the real `db/games.csv` catalog, then
 * filters it exactly as the home page does: query string -> parseGameFilters
 * -> applyGameFilters. Run it on its own with `npm run test:filter-bug`.
 *
 * Reported symptom: choosing "3★ & up" shows only 18 of the 21 games even
 * though no game is rated below 3.0, and "4★ & up" hides Repo Rampart.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { seedDatabase } from '../../db/seed';
import type { Database } from './db';
import type { Game } from '../types/game';
import { getAllGames } from './games';
import { applyGameFilters, parseGameFilters } from './game-filters';

describe('catalog filtering by minimum rating', () => {
    let catalog: Game[];

    beforeAll(async () => {
        const db: Database = await createTestDatabase();
        await seedDatabase(db);
        catalog = await getAllGames(db);
    });

    function titlesFor(query: string): string[] {
        return applyGameFilters(catalog, parseGameFilters(new URLSearchParams(query))).map((game) => game.title);
    }

    it('seeds the full 21-game catalog', () => {
        expect(catalog).toHaveLength(21);
    });

    it('shows every game rated 4 stars or higher for "4★ & up"', () => {
        expect(titlesFor('minRating=4')).toEqual([
            'Code Puzzle Chronicles',
            'Code Quest Odyssey',
            'Deployment Dynasty',
            "Digital Debugger's Dream",
            'Repo Rampart',
            'Repo Rulers',
            'Script Strike',
            'Syntax Smashdown',
        ]);
    });

    it('keeps the whole catalog for "3★ & up" because no game is rated below 3.0', () => {
        expect(titlesFor('minRating=3')).toHaveLength(catalog.length);
    });

    it('combines the category and rating filters', () => {
        const action = catalog.find((game) => game.category?.name === 'Action')?.category;
        expect(action).toBeDefined();
        expect(titlesFor(`minRating=4.5&category=${action?.id}`)).toEqual(['Script Strike', 'Syntax Smashdown']);
    });
});
