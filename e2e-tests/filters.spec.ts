import { test, expect, type Page } from '@playwright/test';

/** Titles of the cards whose star rating is at or above the threshold, read from the rendered catalog. */
async function titlesRatedAtLeast(page: Page, minRating: number): Promise<string[]> {
  return page.getByTestId('game-card').evaluateAll(
    (cards, threshold) =>
      cards
        .filter((card) => Number((card as HTMLElement).dataset.starRating) >= threshold)
        .map((card) => (card as HTMLElement).dataset.gameTitle ?? ''),
    minRating,
  );
}

test.describe('Game filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('games-grid')).toBeVisible();
  });

  test('Filters - shows the full catalog before any filter is chosen', async ({ page }) => {
    const total = await page.getByTestId('game-card').count();
    await expect(page.getByTestId('filter-result-count')).toHaveText(`Showing ${total} of ${total} games`);
  });

  test('Filters - "4★ & up" shows exactly the games rated 4.0 or higher', async ({ page }) => {
    const expected = await titlesRatedAtLeast(page, 4);
    const total = await page.getByTestId('game-card').count();

    await test.step('Choose the 4★ & up filter', async () => {
      await page.getByLabel('Minimum rating').selectOption({ label: '4★ & up' });
    });

    await test.step('Verify every game rated 4.0 or higher is still visible', async () => {
      await expect(page.getByTestId('filter-result-count')).toHaveText(`Showing ${expected.length} of ${total} games`);
      await expect(page.getByTestId('game-card').filter({ visible: true })).toHaveCount(expected.length);
      for (const title of expected) {
        await expect(page.getByTestId('game-card').filter({ hasText: title })).toBeVisible();
      }
    });
  });

  test('Filters - category and rating filters combine', async ({ page }) => {
    await test.step('Choose Action and 4.5★ & up', async () => {
      await page.getByLabel('Category').selectOption({ label: 'Action' });
      await page.getByLabel('Minimum rating').selectOption({ label: '4.5★ & up' });
    });

    await test.step('Verify only highly rated Action games remain', async () => {
      const visibleCards = page.getByTestId('game-card').filter({ visible: true });
      await expect(visibleCards).toHaveCount(2);
      await expect(visibleCards.getByTestId('game-category')).toHaveText(['Action', 'Action']);
    });
  });

  test('Filters - a filtered view can be shared through the URL', async ({ page }) => {
    const expected = await titlesRatedAtLeast(page, 4.5);

    await test.step('Choose 4.5★ & up and check the URL', async () => {
      await page.getByLabel('Minimum rating').selectOption({ label: '4.5★ & up' });
      await expect(page).toHaveURL(/\?minRating=4\.5$/);
    });

    await test.step('Reload the shared URL and verify the filter is restored', async () => {
      await page.reload();
      await expect(page.getByLabel('Minimum rating')).toHaveValue('4.5');
      await expect(page.getByTestId('game-card').filter({ visible: true })).toHaveCount(expected.length);
    });
  });

  test('Filters - clear filters restores the full catalog', async ({ page }) => {
    const total = await page.getByTestId('game-card').count();

    await page.getByLabel('Minimum rating').selectOption({ label: '4.5★ & up' });
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page.getByLabel('Minimum rating')).toHaveValue('');
    await expect(page.getByTestId('filter-result-count')).toHaveText(`Showing ${total} of ${total} games`);
    await expect(page).toHaveURL(/\/$/);
  });
});
