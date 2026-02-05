const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== JIRA TEST CASE EXTRACTION VIA OKTA SSO ===\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to Okta My Apps
    console.log('STEP 1: Opening Okta My Apps...');
    await page.goto('https://experityhealth.okta.com/app/UserHome', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('\n⏸️  PAUSED FOR OKTA LOGIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Please do the following:');
    console.log('1. Log in to Okta (My Apps) if prompted');
    console.log('2. Click on the Jira icon to open Jira');
    console.log('3. Wait for Jira to load completely');
    console.log('4. Once in Jira, come back here and press ENTER to continue...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait for user to press Enter
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log('\n✅ Continuing with Jira navigation...\n');
    await page.waitForTimeout(2000);

    // Step 2: Navigate to Zephyr Test Manager
    console.log('STEP 2: Navigating to Zephyr Test Manager...');
    await page.goto('https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCases', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(5000);
    console.log('Zephyr Test Manager loaded\n');

    console.log('⏸️  NAVIGATE TO TEST CASES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Please navigate to:');
    console.log('  All Test Cases > Master Plan > Scheduling, Registration, Adding Visits');
    console.log('\nMake sure you can see the 21 AIM test cases.');
    console.log('Once ready, press ENTER to start extraction...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait for user confirmation
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log('\n✅ Starting extraction...\n');
    await page.waitForTimeout(2000);

    // Take screenshot of current state
    await page.screenshot({ path: 'zephyr-ready-state.png', fullPage: true });
    console.log('📸 Screenshot saved: zephyr-ready-state.png\n');

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log('📁 Created directory: AIM-TestCases\n');
    }

    // Find all test case keys/links
    console.log('🔍 Analyzing page structure...\n');
    await page.waitForTimeout(2000);

    // Take another screenshot to analyze structure
    await page.screenshot({ path: 'zephyr-before-extraction.png', fullPage: true });

    // Try to find test case rows - Zephyr uses specific structure
    console.log('Looking for test case elements...\n');

    // Try multiple approaches to find test cases
    let testCaseElements = [];

    // Approach 1: Look for rows with "AIM" text
    const aimRows = await page.locator('tr:has-text("AIM")').all();
    console.log(`Found ${aimRows.length} rows containing "AIM"\n`);

    // Approach 2: Look for test case key links (format: XPM-T###)
    const testKeyLinks = await page.locator('a[href*="/testCase/"]').all();
    console.log(`Found ${testKeyLinks.length} test case links\n`);

    // Approach 3: Look for specific Zephyr table cells
    const tableCells = await page.locator('[data-column-key="key"] a, td.key a').all();
    console.log(`Found ${tableCells.length} test key cells\n`);

    // Use the approach that found most elements
    let selectedElements = testKeyLinks.length > 0 ? testKeyLinks : (tableCells.length > 0 ? tableCells : aimRows);

    if (selectedElements.length === 0) {
      console.log('⚠️  No test cases found. Please check:');
      console.log('   1. Are you on the correct page?');
      console.log('   2. Is the AIM section expanded/visible?');
      console.log('   3. Check zephyr-before-extraction.png for page state\n');
      return;
    }

    // Extract test case information
    let testCases = [];
    for (let i = 0; i < Math.min(selectedElements.length, 50); i++) {
      try {
        const element = selectedElements[i];
        const text = await element.textContent();
        const href = await element.getAttribute('href');

        if (text && text.trim()) {
          // Get the full row text to find the test name
          const parentRow = element.locator('xpath=ancestor::tr[1]');
          let testName = text.trim();

          try {
            const rowText = await parentRow.textContent();
            if (rowText.includes('AIM')) {
              testName = rowText.trim();
            }
          } catch (e) {
            // Use original text if row not found
          }

          testCases.push({
            key: text.trim(),
            name: testName,
            href: href,
            index: i
          });
        }
      } catch (e) {
        // Skip stale elements
      }
    }

    console.log(`📋 Found ${testCases.length} test cases\n`);

    // Filter only AIM test cases
    const aimTestCases = testCases.filter(tc =>
      tc.key.includes('AIM') || tc.name.includes('AIM')
    );

    console.log(`🎯 Filtered to ${aimTestCases.length} AIM test cases:\n`);
    aimTestCases.forEach((tc, idx) => {
      console.log(`  ${idx + 1}. ${tc.key} - ${tc.name.substring(0, 60)}...`);
    });
    console.log('');

    if (aimTestCases.length === 0) {
      console.log('⚠️  No AIM test cases found in the filtered results.');
      console.log('You may need to manually verify the page structure.\n');
      return;
    }

    // Process each test case
    let successCount = 0;
    for (let i = 0; i < aimTestCases.length; i++) {
      const tc = aimTestCases[i];
      console.log(`\n[${i + 1}/${aimTestCases.length}] Processing: ${tc.key}`);
      console.log('─'.repeat(70));

      try {
        // Click on the test case key to open details
        console.log('  • Opening test case...');

        // Navigate directly using href if available
        if (tc.href) {
          const fullUrl = tc.href.startsWith('http')
            ? tc.href
            : `https://experityhealth.atlassian.net${tc.href}`;
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } else {
          // Click the element
          await selectedElements[tc.index].click();
        }

        await page.waitForTimeout(3000);

        // Look for "Test Script" tab/button
        console.log('  • Looking for Test Script section...');

        // Try multiple selectors for Test Script tab
        const scriptSelectors = [
          'button:has-text("Test Script")',
          'a:has-text("Test Script")',
          '[data-test-id*="test-script"]',
          'div:has-text("Test Script")',
          'span:has-text("Test Script")'
        ];

        let scriptTabFound = false;
        for (const selector of scriptSelectors) {
          const scriptTab = page.locator(selector).first();
          if (await scriptTab.isVisible({ timeout: 2000 })) {
            console.log(`  • Clicking Test Script tab (${selector})...`);
            await scriptTab.click();
            await page.waitForTimeout(2000);
            scriptTabFound = true;
            break;
          }
        }

        if (!scriptTabFound) {
          console.log('  • Test Script tab not found, looking for script content directly...');
        }

        // Extract test steps
        console.log('  • Extracting test steps...');

        // Try to find steps in various formats
        const stepSelectors = [
          '[data-test-id*="step"]',
          '.test-step',
          'tr[data-test-id*="step"]',
          'table tbody tr',
          '[class*="step-row"]'
        ];

        let steps = [];
        for (const selector of stepSelectors) {
          const stepElements = await page.locator(selector).all();
          if (stepElements.length > 0) {
            console.log(`  • Found ${stepElements.length} steps using ${selector}`);
            for (const step of stepElements) {
              const stepText = await step.textContent();
              if (stepText && stepText.trim()) {
                steps.push(stepText.trim());
              }
            }
            break;
          }
        }

        // If no structured steps found, get all visible text
        if (steps.length === 0) {
          console.log('  • No structured steps found, extracting visible content...');
          const bodyText = await page.locator('body').textContent();
          steps = [bodyText];
        }

        if (steps.length > 0) {
          // Clean test case name for filename
          let fileName = tc.name
            .replace(/[<>:"/\\|?*]/g, '-')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 150);

          if (!fileName.startsWith('AIM')) {
            fileName = `${tc.key} - ${fileName}`;
          }

          const filePath = path.join(outputDir, `${fileName}.txt`);

          const content = `Test Case: ${tc.key}\n` +
                        `Name: ${tc.name}\n` +
                        `URL: ${page.url()}\n` +
                        `Extracted: ${new Date().toISOString()}\n\n` +
                        `${'='.repeat(70)}\n` +
                        `TEST SCRIPT STEPS\n` +
                        `${'='.repeat(70)}\n\n` +
                        steps.join('\n\n---\n\n');

          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Saved: ${fileName.substring(0, 60)}...txt`);
          successCount++;
        } else {
          console.log('  ⚠️  No content extracted');
        }

        // Go back to list
        console.log('  • Returning to list...');
        await page.goBack();
        await page.waitForTimeout(2000);

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        // Try to go back if stuck
        try {
          await page.goBack();
          await page.waitForTimeout(2000);
        } catch (e) {
          // If can't go back, reload the test case list
          await page.goto('https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCases', {
            waitUntil: 'domcontentloaded'
          });
          await page.waitForTimeout(3000);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ EXTRACTION COMPLETE!`);
    console.log(`   Successfully extracted: ${successCount}/${aimTestCases.length} test cases`);
    console.log(`   Files saved in: ${outputDir}\n`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'zephyr-error.png', fullPage: true });
  } finally {
    console.log('\nPress ENTER to close the browser and exit...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    await browser.close();
  }
})();
