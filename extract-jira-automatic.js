const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== JIRA TEST CASE EXTRACTION - AUTOMATIC MODE ===\n');

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
    console.log('Opening: https://experityhealth.okta.com/app/UserHome\n');

    await page.goto('https://experityhealth.okta.com/app/UserHome', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('⏸️  WAITING 60 SECONDS FOR YOU TO:');
    console.log('   1. Log in to Okta');
    console.log('   2. Click on Jira icon');
    console.log('   3. Wait for Jira to load\n');

    // Wait 60 seconds for user to login and open Jira
    for (let i = 60; i > 0; i--) {
      process.stdout.write(`\r   Time remaining: ${i} seconds...`);
      await page.waitForTimeout(1000);
    }
    console.log('\n\n✅ Continuing...\n');

    // Step 2: Navigate to Zephyr Test Manager
    console.log('STEP 2: Navigating to Zephyr Test Manager...');
    await page.goto('https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCases', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(5000);
    console.log('Zephyr page loaded\n');

    console.log('⏸️  WAITING 30 SECONDS FOR YOU TO NAVIGATE TO:');
    console.log('   All Test Cases > Master Plan > Scheduling, Registration, Adding Visits\n');

    // Wait 30 seconds for user to navigate
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r   Time remaining: ${i} seconds...`);
      await page.waitForTimeout(1000);
    }
    console.log('\n\n✅ Starting extraction...\n');

    await page.waitForTimeout(2000);

    // Take screenshot of current state
    await page.screenshot({ path: 'zephyr-extraction-start.png', fullPage: true });
    console.log('📸 Screenshot saved: zephyr-extraction-start.png\n');

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log('📁 Created directory: AIM-TestCases\n');
    }

    // Find all test case links
    console.log('🔍 Searching for test cases...\n');
    await page.waitForTimeout(2000);

    // Look for test case keys in the table
    const testKeyLinks = await page.locator('a[href*="/testCase/"]').all();
    console.log(`Found ${testKeyLinks.length} test case links\n`);

    if (testKeyLinks.length === 0) {
      console.log('⚠️  No test cases found!');
      console.log('Please check zephyr-extraction-start.png to see page state\n');
      await page.waitForTimeout(10000);
      return;
    }

    // Extract test case info
    let testCases = [];
    console.log('📋 Extracting test case information...\n');

    for (let i = 0; i < testKeyLinks.length; i++) {
      try {
        const link = testKeyLinks[i];
        const key = await link.textContent();
        const href = await link.getAttribute('href');

        // Try to get the test name from the same row
        let testName = key;
        try {
          const row = link.locator('xpath=ancestor::tr[1]');
          const rowText = await row.textContent();
          testName = rowText.replace(/\t/g, ' ').trim();
        } catch (e) {
          // Use key if row not found
        }

        if (key && key.trim() && href) {
          testCases.push({
            key: key.trim(),
            name: testName,
            href: href
          });
          console.log(`  ${i + 1}. ${key.trim()}`);
        }
      } catch (e) {
        // Skip stale elements
      }
    }

    console.log(`\nTotal test cases found: ${testCases.length}\n`);

    // Filter AIM test cases
    const aimTestCases = testCases.filter(tc =>
      tc.key.includes('AIM') || tc.name.toLowerCase().includes('aim')
    );

    console.log(`🎯 AIM test cases to extract: ${aimTestCases.length}\n`);

    if (aimTestCases.length === 0) {
      console.log('⚠️  No AIM test cases found. Extracting all test cases instead...\n');
      // Use all test cases if no AIM found
      aimTestCases.push(...testCases);
    }

    // Process each test case
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < aimTestCases.length; i++) {
      const tc = aimTestCases[i];
      console.log(`\n[${ i + 1}/${aimTestCases.length}] ${tc.key}`);
      console.log('─'.repeat(70));

      try {
        // Navigate to test case
        const fullUrl = tc.href.startsWith('http')
          ? tc.href
          : `https://experityhealth.atlassian.net${tc.href}`;

        console.log(`  • Opening: ${fullUrl.substring(0, 80)}...`);
        await page.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await page.waitForTimeout(3000);

        // Look for Test Script tab
        console.log('  • Looking for Test Script...');

        const scriptSelectors = [
          'button:has-text("Test Script")',
          'a:has-text("Test Script")',
          '[aria-label="Test Script"]',
          'span:has-text("Test Script")'
        ];

        let clicked = false;
        for (const selector of scriptSelectors) {
          try {
            const tab = page.locator(selector).first();
            if (await tab.isVisible({ timeout: 2000 })) {
              await tab.click();
              await page.waitForTimeout(2000);
              console.log('  • Test Script tab clicked');
              clicked = true;
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }

        if (!clicked) {
          console.log('  • Test Script tab not found, extracting visible content');
        }

        // Extract content
        console.log('  • Extracting content...');

        // Get all text content from the main area
        const mainContent = await page.locator('main, [role="main"], .main-content, body').first().textContent();

        if (mainContent && mainContent.length > 50) {
          // Create filename
          let fileName = tc.name
            .replace(/[<>:"/\\|?*\r\n\t]/g, '-')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100);

          if (!fileName.includes(tc.key)) {
            fileName = `${tc.key} - ${fileName}`;
          }

          const filePath = path.join(outputDir, `${fileName}.txt`);

          const content = `Test Case Key: ${tc.key}\n` +
                        `Test Case Name: ${tc.name}\n` +
                        `URL: ${page.url()}\n` +
                        `Extracted: ${new Date().toLocaleString()}\n\n` +
                        `${'='.repeat(70)}\n` +
                        `CONTENT\n` +
                        `${'='.repeat(70)}\n\n` +
                        mainContent;

          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Saved: ${fileName.substring(0, 50)}...txt`);
          successCount++;
        } else {
          console.log('  ⚠️  No content found');
          errorCount++;
        }

        // Brief pause before next
        await page.waitForTimeout(1000);

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ EXTRACTION COMPLETE!\n');
    console.log(`   Success: ${successCount}/${aimTestCases.length}`);
    console.log(`   Errors:  ${errorCount}/${aimTestCases.length}`);
    console.log(`   Saved to: ${outputDir}\n`);
    console.log('='.repeat(70) + '\n');

    // Keep browser open for 10 seconds
    console.log('Browser will close in 10 seconds...\n');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    await page.screenshot({ path: 'zephyr-fatal-error.png', fullPage: true });
    await page.waitForTimeout(5000);
  } finally {
    await browser.close();
    console.log('\n✅ Done! Browser closed.\n');
  }
})();
