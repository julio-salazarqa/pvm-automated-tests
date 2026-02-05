const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== STARTING JIRA TEST CASE EXTRACTION ===');

  // Launch browser with existing user data to use logged-in session
  const browser = await chromium.launch({
    headless: false // Run in headed mode to see what's happening
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the Jira Test Manager page
    console.log('1. Navigating to Jira Test Manager...');
    await page.goto('https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCases', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Take screenshot to see current state
    await page.screenshot({ path: 'jira-initial-state.png' });
    console.log('2. Initial page loaded, screenshot saved');

    // Check if we're logged in or need authentication
    const pageContent = await page.content();
    if (pageContent.includes('login') || pageContent.includes('Log in') || pageContent.includes('sign in')) {
      console.log('ERROR: Not logged in. Please log in to Jira first.');
      await browser.close();
      return;
    }

    console.log('3. Logged in successfully, looking for test cases...');

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Try to navigate to Master Plan section
    console.log('4. Looking for Master Plan section...');

    // Look for "Master Plan" text or link
    const masterPlanLink = page.locator('text=Master Plan').first();
    if (await masterPlanLink.isVisible({ timeout: 10000 })) {
      console.log('5. Clicking Master Plan...');
      await masterPlanLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'jira-master-plan.png' });
    }

    // Look for Scheduling, Registration, Adding Visits section
    console.log('6. Looking for Scheduling, Registration, Adding Visits section...');
    const schedulingSection = page.locator('text=Scheduling, Registration, Adding Visits').first();
    if (await schedulingSection.isVisible({ timeout: 10000 })) {
      console.log('7. Clicking Scheduling section...');
      await schedulingSection.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'jira-scheduling-section.png' });
    }

    // Look for AIM test cases
    console.log('8. Looking for AIM test cases...');
    await page.waitForTimeout(2000);

    // Try to find all test case rows with "AIM" in them
    const aimTestCases = await page.locator('tr:has-text("AIM")').all();
    console.log(`9. Found ${aimTestCases.length} AIM test cases`);

    if (aimTestCases.length === 0) {
      console.log('No AIM test cases found. Taking debug screenshot...');
      await page.screenshot({ path: 'jira-debug-no-testcases.png' });

      // Print page content to help debug
      const bodyText = await page.locator('body').innerText();
      console.log('Page content preview:', bodyText.substring(0, 500));
    }

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log('10. Created AIM-TestCases directory');
    }

    console.log('11. Starting to extract test cases...');

    // For now, just take a screenshot and wait for manual inspection
    await page.screenshot({ path: 'jira-current-view.png', fullPage: true });
    console.log('12. Full page screenshot saved for analysis');

    console.log('\n=== PAUSED FOR MANUAL INSPECTION ===');
    console.log('Please check the screenshots to verify the page state.');
    console.log('Press Ctrl+C to stop when done.');

    // Keep browser open for manual inspection
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error occurred:', error.message);
    await page.screenshot({ path: 'jira-error-state.png' });
  } finally {
    console.log('\n=== CLOSING BROWSER ===');
    await browser.close();
  }
})();
