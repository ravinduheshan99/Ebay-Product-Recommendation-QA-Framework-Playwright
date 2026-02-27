const { expect } = require ('@playwright/test');

class SearchResultsPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.searchInput = page.locator('input[placeholder="Search for anything"]');
        this.searchButton = page.locator('.gh-search-button__label');
        this.categoryDropdown = page.locator('select#gh-cat');
        // Product items use either s-card or s-item class depending on page variant
        this.resultItems = page.locator('li.s-card, li.s-item');
        this.countHeading = page.locator('h1.srp-controls__count-heading');
        this.nextPage = page.locator('a.pagination__next');
        // previous `select` disappeared; sort is now a fake menu button
        this.sortButton = page.locator('button.fake-menu-button__button');
        this.sortOptions = page.locator('ul.fake-menu__items li a');
    }

    async open() {
        await this.page.goto('https://www.ebay.com/');
    }

    async performSearch(query, categoryLabel) {
        await this.open();
        await this.dismissOverlay();
        await expect(this.searchInput).toBeVisible();
        if (categoryLabel) {
            await this.categoryDropdown.selectOption({ label: categoryLabel });
        }
        await this.searchInput.fill(query);
        // use force click in case of modal intercept
        await this.searchButton.click({ force: true });
        await this.page.waitForURL(/_nkw=/);
        await this.waitForResults();
    }

    async waitForResults() {
        // the page either shows result items or a heading indicating count/zero
        await this.page.waitForSelector('li.s-item, h1.srp-controls__count-heading', { timeout: 10000 });
    }

    async getResultCount() {
        await this.waitForResults();
        return await this.resultItems.count();
    }

    async getResultTitles() {
        await this.waitForResults();
        const count = await this.resultItems.count();
        const titles = [];
        for (let i = 0; i < count; i++) {
            const title = await this.resultItems.nth(i).locator('.s-card__title, .s-item__title').textContent().catch(() => null);
            titles.push(title?.trim());
        }
        return titles;
    }

    getFirstResultLink() {
        // Links inside result items use s-card__link or s-item__link depending on layout
        return this.resultItems.locator('a.s-card__link, a.s-item__link, a[href*="/itm/"]').first();
    }

    async getResultPrices() {
        await this.waitForResults();
        const count = await this.resultItems.count();
        const prices = [];
        for (let i = 0; i < count; i++) {
            const price = await this.resultItems.nth(i).locator('.s-card__price, .s-item__price').textContent().catch(() => null);
            prices.push(price?.trim());
        }
        return prices;
    }

    async dismissOverlay() {
        // try to close any modal or toast that may intercept clicks
        await this.page.keyboard.press('Escape').catch(() => {});
        // there are occasional lightbox dialogs we can remove via JS
        await this.page.evaluate(() => {
            const dlg = document.querySelector('div[role="dialog"]');
            if (dlg) dlg.remove();
        }).catch(() => {});
    }

    async sortBy(optionText) {
        if (await this.sortButton.count() === 0) {
            // no sort control available
            return;
        }
        await this.sortButton.click({ force: true });
        const item = this.sortOptions.filter({ hasText: optionText }).first();
        await item.click({ force: true });
        await this.page.waitForURL(/_sop=/);
    }
}

// Helper added: perform search (optional) and open the first result product page
SearchResultsPage.prototype.openFirstResult = async function(query) {
    if (query) {
        await this.performSearch(query);
    } else {
        await this.waitForResults();
    }

    await this.dismissOverlay();
    const first = this.getFirstResultLink();
    await expect(first).toBeVisible({ timeout: 10000 });
    await first.click({ force: true });
    await this.page.waitForURL(/\/itm\//, { timeout: 15000 });
};

module.exports = { SearchResultsPage };
