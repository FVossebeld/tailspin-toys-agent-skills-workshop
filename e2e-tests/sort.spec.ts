import { test, expect, type Page } from '@playwright/test';

interface CardData {
  title: string;
  rating: number | null;
}

/** Title and rating of every visible card, in on-screen order. */
async function visibleCards(page: Page): Promise<CardData[]> {
  return page.getByTestId('game-card').filter({ visible: true }).evaluateAll((cards) =>
    cards.map((card) => {
      const { gameTitle, starRating } = (card as HTMLElement).dataset;
      return { title: gameTitle ?? '', rating: starRating ? Number(starRating) : null };
    }),
  );
}

function byTitle(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

function isNonIncreasing(values: number[]): boolean {
  return values.every((value, i) => i === 0 || values[i - 1] >= value);
}

test.describe('Catalog sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('games-grid')).toBeVisible();
  });

  test('Sort - the catalog starts in title order', async ({ page }) => {
    await expect(page.getByLabel('Sort by')).toHaveValue('title-asc');
    const titles = (await visibleCards(page)).map((card) => card.title);
    expect(titles).toEqual([...titles].sort(byTitle));
  });

  test('Sort - "Highest rated" puts the best games first and says so', async ({ page }) => {
    const total = await page.getByTestId('game-card').count();

    await page.getByLabel('Sort by').selectOption({ label: 'Highest rated' });

    await expect(page.getByTestId('filter-result-count')).toHaveText(
      `Showing ${total} of ${total} games, sorted by highest rated`,
    );
    expect(isNonIncreasing((await visibleCards(page)).map((card) => card.rating ?? -1))).toBe(true);
  });

  test('Sort - a sorted view can be shared through the URL', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption({ label: 'Lowest rated' });
    await expect(page).toHaveURL(/\?sort=rating-asc$/);
    const before = await visibleCards(page);

    await page.reload();

    await expect(page.getByLabel('Sort by')).toHaveValue('rating-asc');
    expect(await visibleCards(page)).toEqual(before);
  });

  test('Sort - sorting and filtering combine, and clearing filters keeps the order', async ({ page }) => {
    await test.step('Filter to 4★ & up and sort by highest rated', async () => {
      await page.getByLabel('Minimum rating').selectOption({ label: '4★ & up' });
      await page.getByLabel('Sort by').selectOption({ label: 'Highest rated' });
      await expect(page).toHaveURL(/\?minRating=4&sort=rating-desc$/);

      const cards = await visibleCards(page);
      expect(cards.every((card) => (card.rating ?? 0) >= 4)).toBe(true);
      expect(isNonIncreasing(cards.map((card) => card.rating ?? -1))).toBe(true);
    });

    await test.step('Clear filters: every game returns, still sorted by rating', async () => {
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await expect(page.getByLabel('Sort by')).toHaveValue('rating-desc');
      await expect(page).toHaveURL(/\?sort=rating-desc$/);
      const total = await page.getByTestId('game-card').count();
      expect(await visibleCards(page)).toHaveLength(total);
    });
  });

  test('Sort - choosing "Title (A–Z)" again restores the original order', async ({ page }) => {
    const original = await visibleCards(page);

    await page.getByLabel('Sort by').selectOption({ label: 'Highest rated' });
    await page.getByLabel('Sort by').selectOption({ label: 'Title (A–Z)' });

    expect(await visibleCards(page)).toEqual(original);
    await expect(page).toHaveURL(/\/$/);
  });
});
