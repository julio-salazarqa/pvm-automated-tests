const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== JIRA TEST CASE EXTRACTION - INTERACTIVE MODE ===\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to Jira
    console.log('STEP 1: Opening Jira Test Manager...');
    await page.goto('https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCases', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('\n⏸️  PAUSED FOR MANUAL LOGIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Please do the following:');
    console.log('1. Log in to Jira if prompted');
    console.log('2. Navigate to: All Test Cases > Master Plan > Scheduling, Registration, Adding Visits');
    console.log('3. Make sure you can see the AIM test cases (21 items)');
    console.log('4. Once ready, come back here and press ENTER to continue...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait for user to press Enter
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log('\n✅ Continuing with extraction...\n');
    await page.waitForTimeout(2000);

    // Take screenshot of current state
    await page.screenshot({ path: 'jira-ready-state.png', fullPage: true });
    console.log('📸 Screenshot saved: jira-ready-state.png\n');

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log('📁 Created directory: AIM-TestCases\n');
    }

    // Find all test case rows
    console.log('🔍 Looking for AIM test cases in the table...\n');
    await page.waitForTimeout(2000);

    // Try multiple selectors to find test case links
    const testCaseLinks = await page.locator('a[href*="testCase"]').all();
    console.log(`Found ${testCaseLinks.length} potential test case links\n`);

    if (testCaseLinks.length === 0) {
      console.log('⚠️  No test case links found. Please verify you are on the correct page.');
      console.log('Taking debug screenshot...');
      await page.screenshot({ path: 'jira-debug-no-links.png', fullPage: true });
      return;
    }

    // Extract test case keys and names
    let testCases = [];
    for (let i = 0; i < Math.min(testCaseLinks.length, 30); i++) {
      try {
        const link = testCaseLinks[i];
        const text = await link.textContent();
        const href = await link.getAttribute('href');

        if (text && text.trim() && href) {
          testCases.push({ text: text.trim(), href, index: i });
        }
      } catch (e) {
        // Skip if element is stale
      }
    }

    console.log(`📋 Found ${testCases.length} test cases to process\n`);
    console.log('Test cases found:');
    testCases.forEach((tc, idx) => {
      console.log(`  ${idx + 1}. ${tc.text}`);
    });
    console.log('');

    // Filter only AIM test cases
    const aimTestCases = testCases.filter(tc => tc.text.includes('AIM'));
    console.log(`🎯 Filtered to ${aimTestCases.length} AIM test cases\n`);

    if (aimTestCases.length === 0) {
      console.log('⚠️  No AIM test cases found. The page might not be filtered correctly.');
      console.log('Please make sure you are viewing the AIM section.');
      return;
    }

    // Process each test case
    let successCount = 0;
    for (let i = 0; i < aimTestCases.length; i++) {
      const tc = aimTestCases[i];
      console.log(`\n[${i + 1}/${aimTestCases.length}] Processing: ${tc.text}`);
      console.log('─'.repeat(60));

      try {
        // Click on the test case
        console.log('  • Clicking test case link...');
        const linkSelector = `a[href="${tc.href}"]`;
        await page.locator(linkSelector).first().click();
        await page.waitForTimeout(3000);

        // Look for "Test Script" tab
        console.log('  • Looking for Test Script tab...');
        const testScriptTab = page.locator('text=Test Script, [data-test-id*="script"], button:has-text("Test Script")').first();

        if (await testScriptTab.isVisible({ timeout: 5000 })) {
          console.log('  • Clicking Test Script tab...');
          await testScriptTab.click();
          await page.waitForTimeout(2000);

          // Extract test script steps
          console.log('  • Extracting test steps...');
          const stepsContent = await page.locator('[data-test-id*="step"], .test-step, .step-content, table tr').allInnerTexts();

          if (stepsContent.length > 0) {
            // Clean the test case name for filename
            let fileName = tc.text
              .replace(/[<>:"/\\|?*]/g, '-') // Remove invalid filename characters
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 100); // Limit length

            const filePath = path.join(outputDir, `${fileName}.txt`);
            const content = `Test Case: ${tc.text}\n\n` +
                          `URL: ${page.url()}\n\n` +
                          `Test Script Steps:\n` +
                          `${'='.repeat(60)}\n\n` +
                          stepsContent.join('\n\n');

            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`  ✅ Saved: ${fileName}.txt`);
            successCount++;
          } else {
            console.log('  ⚠️  No test steps found');
          }
        } else {
          console.log('  ⚠️  Test Script tab not found');
        }

        // Go back to test case list
        console.log('  • Navigating back...');
        await page.goBack();
        await page.waitForTimeout(2000);

      } catch (error) {
        console.log(`  ❌ Error processing test case: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Extraction complete!`);
    console.log(`   Successfully extracted: ${successCount}/${aimTestCases.length} test cases`);
    console.log(`   Files saved in: ${outputDir}\n`);

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    await page.screenshot({ path: 'jira-error.png', fullPage: true });
  } finally {
    console.log('Press ENTER to close the browser...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    await browser.close();
  }
})();
