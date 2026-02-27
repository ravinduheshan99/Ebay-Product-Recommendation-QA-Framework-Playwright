# Surge Global QA Assessment — Playwright Test Suite

This repository contains a Playwright-based automation suite created for the Surge Global QA assessment. It includes page objects and end-to-end tests for the eBay home (landing), search results, and main product pages.

Quick commands

```bash
# install dependencies
npm ci

# install Playwright browsers
npx playwright install

# run tests (headless)
npm test

# run tests headed
npm run test:headed

# run tests and generate HTML report
npm run test:report

# open last generated HTML report
npm run report:open
```

Notes
- Tests target live eBay pages and may be flaky due to network/site updates. Adjust selectors in `pageobjects/` if a selector stops matching.
- CI workflow is configured at `.github/workflows/playwright.yml` and uploads the generated `playwright-report` as an artifact.

If you want, I can now extend the test coverage (add negative scenarios, accessibility checks, or data-driven tests), or run the test suite in this environment.
