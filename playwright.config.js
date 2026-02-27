// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */

const config = ({
  testDir: './tests',
  //retries:1,
  timeout: 40 * 1000,
  expect: { timeout: 40 * 1000 },
  reporter: 'html',

  use: {
    browserName: 'chromium',
    headless: false,
    screenshot : 'only-on-failure',
    trace : 'on',
    video: 'retain-on-failure',
    ignoreHttpsErrors:true,
    permissions: ['geolocation']
  },
});

module.exports = config;

