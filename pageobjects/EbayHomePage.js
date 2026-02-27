const { expect } = require ('@playwright/test');

class EbayHomePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        
        // Header and navigation
        this.logo = page.locator('.gh-logo');
        this.pageTitle = page.locator('title');
        
        // Search elements
        this.searchInput = page.locator('input[placeholder="Search for anything"]');
        this.searchButton = page.locator('.gh-search-button__label');
        this.advancedLink = page.locator('a.gh-search-button__advanced-link');
        this.categoryDropdown = page.locator('select.gh-search-categories, select#gh-cat');
        
        // Navigation links
        this.signInLink = page.locator('a[href*="signin.ebay.com"]');
        this.registerLink = page.locator('a[href*="signup.ebay.com"]');
        this.dealsLink = page.locator('a[href*="/deals"]');
        this.sellLink = page.locator('a[href*="export.ebay.com"]');
        
        // Category navigation
        this.electronicsCategory = page.locator('a:has-text("Electronics")').first();
        this.motorsCategory = page.locator('a:has-text("Motors")').first();
        this.fashionCategory = page.locator('a:has-text("Fashion")').first();
        this.collectiblesCategory = page.locator('a:has-text("Collectibles")').first();
        this.sportsCategory = page.locator('a:has-text("Sports")').first();
        this.healthBeautyCategory = page.locator('a:has-text("Health & Beauty")').first();
        this.homeGardenCategory = page.locator('a:has-text("Home & Garden")').first();
        
        // Help button
        this.helpButton = page.locator('button[aria-label*="Help"]');
        
        // Footer elements
        this.footer = page.locator('footer.gh-footer, footer.gf-big-links');
        this.scrollToTopButton = page.locator('button.gh-btt-button');
        
        // Autocomplete results
        this.autocompleteResults = page.locator('#ebay-autocomplete li, .suggestion-text');
    }

    async open() {
        await this.page.goto('https://www.ebay.com/');
        await this.page.waitForLoadState('domcontentloaded');
        await this.dismissOverlay();
    }

    async getPageTitle() {
        return await this.page.title();
    }

    async isSearchInputVisible() {
        return await this.searchInput.isVisible();
    }

    async isSearchButtonVisible() {
        return await this.searchButton.isVisible();
    }

    async performSearch(query) {
        await expect(this.searchInput).toBeVisible();
        await this.searchInput.fill(query);
        await this.searchButton.click();
        await this.page.waitForURL(/_nkw=/);
    }

    async performSearchWithAutosuggest(query, suggestion) {
        await expect(this.searchInput).toBeVisible();
        await this.searchInput.pressSequentially(query, { delay: 50 });
        
        // Wait for autocomplete dropdown
        const autocompleteDropdown = this.page.locator('ul#ebay-autocomplete');
        await expect(autocompleteDropdown).toBeVisible({ timeout: 5000 });
        
        // Select matching suggestion
        const suggestions = this.page.locator('.suggestion-text, #ebay-autocomplete li');
        const count = await suggestions.count();
        
        for (let i = 0; i < count; i++) {
            const text = await suggestions.nth(i).textContent();
            if (text?.trim().toLowerCase().includes(suggestion.toLowerCase())) {
                await suggestions.nth(i).click();
                await this.page.waitForURL(/_nkw=/);
                break;
            }
        }
    }

    async clickAdvancedSearch() {
        await expect(this.advancedLink).toBeVisible();
        await this.advancedLink.click();
    }

    async selectCategory(categoryLabel) {
        await expect(this.categoryDropdown).toBeVisible();
        await this.categoryDropdown.selectOption({ label: categoryLabel });
    }

    async getDefaultCategory() {
        const firstOption = this.categoryDropdown.locator('option').first();
        return await firstOption.textContent();
    }

    async clickSignIn() {
        await expect(this.signInLink).toBeVisible();
        await this.signInLink.click();
    }

    async clickRegister() {
        await expect(this.registerLink).toBeVisible();
        await this.registerLink.click();
    }

    async isSignInLinkVisible() {
        return await this.signInLink.isVisible();
    }

    async isRegisterLinkVisible() {
        return await this.registerLink.isVisible();
    }

    async clickHelpButton() {
        return await this.helpButton.isVisible();
    }

    async clickElectronicsCategoryLink() {
        await this.dismissOverlay();
        await this.electronicsCategory.scrollIntoViewIfNeeded();
        await this.electronicsCategory.click({ force: true });
    }

    async clickMotorsCategoryLink() {
        await expect(this.motorsCategory).toBeVisible();
        await this.motorsCategory.click();
    }

    async clickFashionCategoryLink() {
        await expect(this.fashionCategory).toBeVisible();
        await this.fashionCategory.click();
    }

    async clickCollectiblesCategoryLink() {
        await expect(this.collectiblesCategory).toBeVisible();
        await this.collectiblesCategory.click();
    }

    async clickDealsLink() {
        const dealsLink = this.page.locator('a[_sp*="3601"]').filter({ hasText: /deals/i }).first();
        await expect(dealsLink).toBeVisible();
        await dealsLink.click();
    }

    async isLogoVisible() {
        return await this.logo.isVisible();
    }

    async clickLogo() {
        await expect(this.logo).toBeVisible();
        await this.logo.click();
    }

    async isFooterVisible() {
        return await this.footer.isVisible();
    }

    async isScrollToTopButtonVisible() {
        return await this.scrollToTopButton.isVisible();
    }

    async scrollToTop() {
        if (await this.scrollToTopButton.isVisible()) {
            await this.scrollToTopButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    async searchAndValidateResults(query) {
        await this.dismissOverlay();
        await this.performSearch(query);
        const resultTitles = this.page.locator('div.s-card__title, div.s-item__title');
        await expect(resultTitles.first()).toBeVisible({ timeout: 10000 });
        const count = await resultTitles.count();
        return count > 0;
    }
}

module.exports = { EbayHomePage };
