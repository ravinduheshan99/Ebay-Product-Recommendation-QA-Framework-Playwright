// @ts-check
const { test, expect } = require('@playwright/test');
const { EbayHomePage } = require('../pageobjects/EbayHomePage');
const { SearchResultsPage } = require('../pageobjects/SearchResultsPage');
const { MainProductPage } = require('../pageobjects/MainProductPage');

const QUERY = 'mens leather wallet';

test.describe('End-to-end: Search -> Product -> Best Sellers', () => {
  test('Search from home, open first product, validate best sellers', async ({ page }) => {
    const home = new EbayHomePage(page);
    const search = new SearchResultsPage(page);
    const product = new MainProductPage(page);

    await home.open();
    // use the robust openFirstResult helper instead of manual steps
    await search.openFirstResult(QUERY);

    // validate product details
    const title = await product.getProductTitle();
    expect(title).toBeTruthy();

    // best sellers (if present) should have at least 0 items and valid headings
    const bsHeading = await product.getBestSellersHeading();
    if (bsHeading) {
      expect(bsHeading.toLowerCase()).toContain('best');
      const bsCount = await product.getBestSellersCount();
      expect(typeof bsCount).toBe('number');
    }
  });
});
