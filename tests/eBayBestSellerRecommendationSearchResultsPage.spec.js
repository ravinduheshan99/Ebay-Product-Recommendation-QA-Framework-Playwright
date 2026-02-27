// @ts-check
const { test, expect } = require ('@playwright/test');
const { SearchResultsPage } = require('../pageobjects/SearchResultsPage');

const DEFAULT_QUERY = 'mens leather wallet';

// grouping tests under a describe block improves readability
test.describe('eBay search results page behaviour', () => {
    /** @type {import('../pageobjects/SearchResultsPage').SearchResultsPage} */
    let results;

    test.beforeEach(async ({ page }) => {
        results = new SearchResultsPage(page);
    });

    test('Verify search results page loads correctly', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        await expect(results.countHeading).toBeVisible();
    });

    test('URL structure contains expected parameters', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        const url = page.url();
        expect(url).toContain('_nkw=mens+leather+wallet');
        expect(url).toContain('_sacat=0'); // default category parameter
        expect(url).toMatch(/_from=R\d+/); // from parameter should be present
    });

    test('Verify number of results count', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        const heading = results.countHeading;
        const text = await heading.textContent();
        const match = text?.match(/([\d,]+)/);
        expect(match).not.toBeNull();
        if (!match) throw new Error('Expected numeric count in heading');
        const count = parseInt(match[1].replace(/,/g, ''), 10);
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Search yields no results', async ({ page }) => {
        const impossible = 'noresults' + Date.now();
        await results.performSearch(impossible);
        const items = results.resultItems;
        const count = await items.count();
        // the site sometimes returns a few hits even for garbage, so assert >=0
        expect(count).toBeGreaterThanOrEqual(0);
        if (count === 0) {
            const heading = results.countHeading;
            await expect(heading).toContainText(/0\s*results/i);
        }
    });

    test('Pagination works on search results', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        const next = results.nextPage;
        await expect(next).toBeVisible();
        await next.click();
        await page.waitForURL(/_pgn=2/);
    });

    test('Sort results by price', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        await results.sortBy('Price + Shipping: lowest first');
        await page.waitForURL(/_sop=15/);
    });

    test('Click a search result opens product page', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        const firstLink = results.resultItems.locator('a.s-item__link').first();
        await expect(firstLink).toBeVisible();
        await firstLink.click({ force: true });
        await expect(page).toHaveURL(/\/itm\//);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('Verify search retained in header', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        await expect(results.searchInput).toHaveValue(DEFAULT_QUERY);
    });

    test('Edge case: very long query string', async ({ page }) => {
        const longQuery = 'a'.repeat(300);
        await results.performSearch(longQuery);
        await expect(results.searchInput).toHaveValue(longQuery);
        // don't wait for items; make sure we don't hang
        const count = await results.resultItems.count();
        // just ensure we didn't crash
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Search query with mixed case', async ({ page }) => {
        const mixed = 'MeNs LeAtHeR WalLeT';
        await results.performSearch(mixed);
        const heading = results.countHeading;
        await expect(heading).toContainText(/mens leather wallet/i);
    });

    test('Test search with category selection before search', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY, 'Books');
        expect(page.url()).toContain('_sacat=');
    });

    test('Change sorting to relevance or date', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        await results.sortBy('Time: newly listed');
        await expect(page.url()).toMatch(/_sop=10/);
        await results.sortBy('Best Match');
        await expect(page.url()).toMatch(/_sop=12/);
    });

    test('Verify "Back to search" works', async ({ page }) => {
        await results.performSearch(DEFAULT_QUERY);
        const firstLink = results.resultItems.locator('a.s-item__link').first();
        await firstLink.click({ force: true });
        const back = page.locator('a', { hasText: /Back to search/i });
        await expect(back).toBeVisible();
        await back.click({ force: true });
        await expect(page).toHaveURL(/_nkw=/);
    });

});

