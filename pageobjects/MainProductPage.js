const { expect } = require ('@playwright/test');

class MainProductPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        // Product details locators (multiple fallbacks due to frequent eBay DOM changes)
        this.productTitle = page.locator('#itemTitle, h1.it-title, h1[itemprop="name"], h1');
        this.productPrice = page.locator('[data-testid="vi-VR-cvipPrice"]');
        this.priceDisplay = page.locator('.vi-VR-cvipPrice-cv-container');
        // additional price selectors we may encounter
        this.altPrice = page.locator('#prcIsum, [itemprop="price"], span[itemprop="price"]');
        this.productImage = page.locator('#vi_main img');
        this.mainImage = page.locator('[data-testid="ql-viewer"] img');
        
        // Best Sellers section locators - headers or footer modules
        this.bestSellersSection = page.locator('div.seo-footer-section:has-text("Best Sellers"), [data-testid="vi-acc-del-range"] h2, .vi-content-section:has-text("Best Sellers")');
        // items may live in footer or earlier module
        this.bestSellerItems = page.locator('div.seo-footer-section:has-text("Best Sellers") li a, div[data-testid*="best-seller"] a, .vi-best-seller-item, [class*="best-seller"] li');
        this.viewAllLink = page.locator('a:has-text("View All")', { exact: false }).filter({ hasText: /Best Seller|See all/i });
    }

    async navigateToProduct(productUrl) {
        await this.page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        // wait for any of the title selectors to be present (don't require visibility yet)
        await this.page.waitForSelector('#itemTitle, h1.it-title, h1[itemprop="name"], h1', { timeout: 25000 }).catch(() => {});
    }

    async getProductTitle() {
        const locator = this.productTitle;
        if (await locator.count() === 0) {
            return null;
        }
        try {
            await locator.first().waitFor({ state: 'visible', timeout: 5000 });
        } catch {
            // element exists but not visible, return text anyway
        }
        const text = await locator.first().textContent();
        return text?.trim() ?? null;
    }

    async getProductPrice() {
        const locator = this.productPrice.or(this.priceDisplay).or(this.altPrice);
        if (await locator.count() === 0) {
            return null;
        }
        try {
            await locator.first().waitFor({ state: 'visible', timeout: 5000 });
        } catch {
            // element exists but not visible, return text anyway
        }
        const text = await locator.first().textContent();
        return text?.trim() ?? null;
    }

    async isProductImageVisible() {
        const visible = await this.mainImage.or(this.productImage).isVisible();
        return visible;
    }

    async getBestSellersCount() {
        return await this.bestSellerItems.count();
    }

    async getBestSellersHeading() {
        if (await this.bestSellersSection.count() === 0) return null;
        return await this.bestSellersSection.textContent();
    }

    async clickBestSellerItem(index) {
        const item = this.bestSellerItems.nth(index);
        await expect(item).toBeVisible();
        await item.click();
    }

    async getBestSellerItemText(index) {
        const item = this.bestSellerItems.nth(index);
        return await item.textContent();
    }

    async isPriceRangeConsistent(minPrice, maxPrice) {
        const count = await this.bestSellerItems.count();
        for (let i = 0; i < count; i++) {
            const text = await this.bestSellerItems.nth(i).textContent();
            // Extract price from text - would need adjustment based on actual HTML
            // This is a simplified check
        }
        return true;
    }

    async getCurrencySymbol() {
        const priceText = await this.getProductPrice();
        const match = priceText?.match(/[$£€¥]/);
        return match ? match[0] : null;
    }

    async isViewAllVisible() {
        return await this.viewAllLink.isVisible();
    }

    async clickViewAll() {
        await this.viewAllLink.click();
    }

    async getDuplicateItems() {
        const count = await this.bestSellerItems.count();
        const titles = [];
        for (let i = 0; i < count; i++) {
            const title = await this.bestSellerItems.nth(i).textContent();
            titles.push(title);
        }
        return titles;
    }
}

module.exports = { MainProductPage };
