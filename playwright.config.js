const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60000,
  reporter: [
    ['html'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        'Test Environment': 'Development',
        'Application': 'PVM - Practice Velocity Management',
        'Base URL': process.env.PVM_URL || 'https://devpvpm.practicevelocity.com'
      }
    }]
  ],
  outputDir: path.join(__dirname, 'test-results'),
  use: {
    baseURL: 'https://devpvpm.practicevelocity.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },
  ],
});
