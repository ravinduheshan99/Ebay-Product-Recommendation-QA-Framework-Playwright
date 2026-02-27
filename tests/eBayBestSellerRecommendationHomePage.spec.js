// @ts-check
import { test, expect } from '@playwright/test';
import { EbayHomePage } from '../pageobjects/EbayHomePage.js';

test('Verify successful navigation to the eBay home page and page title validation', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    await expect(page).toHaveTitle('Electronics, Cars, Fashion, Collectibles & More | eBay');
    console.log("eBay Home Page Title: " + await page.title());
});

test('Verify presence and visibility of the search input field on the eBay home page', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    const isSearchFieldVisible = await page.locator("input[placeholder ='Search for anything']").isVisible();
    await expect(isSearchFieldVisible).toBeTruthy();
    console.log("Placeholder value of search field: " + await page.locator("input[placeholder ='Search for anything']").textContent());
});

test('Verify valid product search functionality using auto-suggestion dropdown selection', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    const isSearchFieldVisible = await page.locator("input[placeholder ='Search for anything']").isVisible();
    await expect(isSearchFieldVisible).toBeTruthy();
    await page.locator("input[placeholder ='Search for anything']").pressSequentially("Mens Leather Wallet", { delay: 150 });
    const productOptions = await page.locator('.suggestion-text');
    await expect(productOptions.first()).toBeVisible();
    const productOptionsCount = await productOptions.count();

    for (let i = 0; i < productOptionsCount; i++) {
        const productName = await productOptions.nth(i).textContent();
        if (productName?.trim().toLowerCase() === "mens leather wallet") {
            await productOptions.nth(i).click();
            break;
        }
    }

    // Wait for search results titles
    const resultTitles = page.locator('div.s-card__title');
    await resultTitles.nth(2).waitFor();
    await expect(resultTitles.nth(2)).toBeVisible();

    // Validate first title contains "wallet" (case insensitive)
    await expect(resultTitles.nth(2)).toContainText(/wallet/i);

    console.log("Searched product results loaded successfully");

});

test('Verify valid product search functionality by submitting keyword using the search button', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    const isSearchFieldVisible = await page.locator("input[placeholder ='Search for anything']").isVisible();
    await expect(isSearchFieldVisible).toBeTruthy();
    await page.locator("input[placeholder ='Search for anything']").fill("Mens Leather Wallet");
    await page.locator(".gh-search-button__label").click()

    // Wait for search results titles
    const resultTitles = page.locator('div.s-card__title');
    await resultTitles.nth(2).waitFor();
    await expect(resultTitles.nth(2)).toBeVisible();

    // Validate first title contains "wallet" (case insensitive)
    await expect(resultTitles.nth(2)).toContainText(/wallet/i);

    console.log("Searched product results loaded successfully");

});

test('Verify behavior when submitting an empty search query', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    const isSearchFieldVisible = await page.locator("input[placeholder ='Search for anything']").isVisible();
    await expect(isSearchFieldVisible).toBeTruthy();
    await page.locator(".gh-search-button__label").click()

    const allCategoriesLabel = await page.getByRole('heading', { name: 'All Categories' });
    await allCategoriesLabel.waitFor();
    await expect(allCategoriesLabel).toBeVisible();
    await expect(allCategoriesLabel).toContainText("All Categories");
    console.log("All Categories page loaded successfully for and empty search");
});

test('Verify behavior when submitting search query with special characters', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    const isSearchFieldVisible = await page.locator("input[placeholder ='Search for anything']").isVisible();
    await expect(isSearchFieldVisible).toBeTruthy();
    await page.locator("input[placeholder ='Search for anything']").fill("!@#$%^*");
    await page.locator(".gh-search-button__label").click()

    const allCategoriesLabel = await page.getByRole('heading', { name: 'All Categories' });
    await allCategoriesLabel.waitFor();
    await expect(allCategoriesLabel).toBeVisible();
    await expect(allCategoriesLabel).toContainText("All Categories");
    console.log("All Categories page loaded successfully for a search query with special characters");
});


test('Verify default selected category in search dropdown is set to “All Categories”', async ({ page }) => {
    await page.goto("https://www.ebay.com/");
    const isSearchFieldVisible = await page.locator("input[placeholder ='Search for anything']").isVisible();
    await expect(isSearchFieldVisible).toBeTruthy();
    
    const categoryDropDownElements = await page.locator('.gh-search-categories option');
    expect(await categoryDropDownElements.first()).toHaveText("All Categories");

    console.log("Category Dropdown Contains All Categories as it's Default Category");
});

test('Verify Advanced Search link is visible and accessible on the home page', async ({ page }) => {
    const homePage = new EbayHomePage(page);
    await homePage.open();
    await page.keyboard.press('Escape').catch(() => {});
    const advancedLink = homePage.advancedLink;
    await expect(advancedLink).toBeVisible();
    await expect(advancedLink).toContainText(/Advanced/i);
    console.log("Advanced Search link is visible and accessible");
});

test('Verify Sign In and Register links are visible and accessible on the home page', async ({ page }) => {
    const homePage = new EbayHomePage(page);
    await homePage.open();
    await page.keyboard.press('Escape').catch(() => {});
    const signInLink = homePage.signInLink;
    const registerLink = homePage.registerLink;
    
    await expect(signInLink).toBeVisible({ timeout: 10000 });
    await expect(signInLink).toContainText(/sign ?in/i);
    
    await expect(registerLink).toBeVisible({ timeout: 10000 });
    await expect(registerLink).toContainText(/register/i);
    
    console.log("Sign In and Register links are visible and accessible");
});

test('Verify Electronics category link is visible and navigates to category page', async ({ page }) => {
    const homePage = new EbayHomePage(page);
    await homePage.open();
    
    // use page object helper which handles overlays and force clicking
    await homePage.clickElectronicsCategoryLink();
    
    // Wait for navigation to category page
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on electronics page
    const pageUrl = page.url();
    await expect(pageUrl).toContain('Electronics');
    
    console.log("Successfully navigated to Electronics category page");
});

test('Verify eBay logo is visible and navigates back to home page', async ({ page }) => {
    const homePage = new EbayHomePage(page);
    await homePage.open();
    
    const logo = page.locator('a.gh-logo');
    await expect(logo).toBeVisible();
    
    // Navigate to a different page first using page object helper
    await homePage.clickElectronicsCategoryLink();
    await page.waitForLoadState('domcontentloaded');
    
    // Now click logo to return to home
    const logoOnPage = homePage.logo;
    await expect(logoOnPage).toBeVisible();
    await logoOnPage.click({ force: true });
    
    // Verify we're back on home page
    await page.waitForLoadState('domcontentloaded');
    const expectedTitle = 'Electronics, Cars, Fashion, Collectibles & More | eBay';
    await expect(page).toHaveTitle(expectedTitle);
    
    console.log("eBay logo click successfully navigated back to home page");
});

