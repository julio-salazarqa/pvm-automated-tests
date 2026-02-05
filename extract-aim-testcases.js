const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== EXTRACTING AIM TEST CASES ===\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();

  try {
    // Navigate to Okta first
    console.log('STEP 1: Opening Okta My Apps for SSO login...');
    await page.goto('https://experityhealth.okta.com/app/UserHome', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('\n⏸️  WAITING 45 SECONDS:');
    console.log('   1. Log in to Okta');
    console.log('   2. Click Jira icon');
    console.log('   3. Wait for Jira to load\n');

    for (let i = 45; i > 0; i--) {
      process.stdout.write(`\r   Time remaining: ${i} seconds...`);
      await page.waitForTimeout(1000);
    }
    console.log('\n');

    // Navigate directly to the AIM test cases URL
    console.log('STEP 2: Navigating to AIM test cases section...');
    const aimUrl = 'https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCases';

    await page.goto(aimUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    console.log('⏸️  WAITING 30 SECONDS:');
    console.log('   Navigate to: Master Test Plan > Scheduling, Registration, Adding Visits > AIM\n');

    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r   Time remaining: ${i} seconds...`);
      await page.waitForTimeout(1000);
    }
    console.log('\n');

    // Take screenshot
    await page.screenshot({ path: 'extraction-start.png', fullPage: true });
    console.log('📸 Screenshot: extraction-start.png\n');

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    console.log('📁 Directory: AIM-TestCases\n');

    // Find all test case key links (XPM-T####)
    console.log('🔍 Finding AIM test case keys...\n');
    await page.waitForTimeout(2000);

    // Look for links with XPM-T pattern in the Key column
    const testKeyLinks = await page.locator('a[href*="/testCase/XPM-T"]').all();
    console.log(`Found ${testKeyLinks.length} test case key links\n`);

    if (testKeyLinks.length === 0) {
      console.log('⚠️  No test cases found. Check extraction-start.png\n');
      await page.waitForTimeout(10000);
      return;
    }

    // Extract test case keys and names from the table
    let testCases = [];
    console.log('📋 Extracting test case information...\n');

    for (let i = 0; i < testKeyLinks.length; i++) {
      try {
        const link = testKeyLinks[i];
        const key = (await link.textContent()).trim();
        const href = await link.getAttribute('href');

        // Get the test name from the Name column (same row)
        let testName = key;
        try {
          const row = link.locator('xpath=ancestor::tr[1]');
          const nameCell = row.locator('td[data-column-key="name"], td:nth-child(4)');
          const nameCellText = await nameCell.textContent();
          if (nameCellText) {
            testName = nameCellText.trim();
          }
        } catch (e) {
          // Use key if name not found
        }

        testCases.push({
          key: key,
          name: testName,
          href: href,
          index: i
        });

        console.log(`  ${i + 1}. ${key}`);
      } catch (e) {
        console.log(`  ${i + 1}. Error reading test case`);
      }
    }

    console.log(`\nTotal: ${testCases.length} test cases\n`);
    console.log('─'.repeat(70) + '\n');

    // Process each test case
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      console.log(`[${i + 1}/${testCases.length}] ${tc.key}`);
      console.log('─'.repeat(70));

      try {
        // Navigate to test case detail
        const fullUrl = tc.href.startsWith('http')
          ? tc.href
          : `https://experityhealth.atlassian.net${tc.href}`;

        console.log(`  • Opening test case...`);
        await page.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await page.waitForTimeout(3000);

        // Look for Test Script tab
        console.log('  • Looking for Test Script tab...');

        const scriptTabSelectors = [
          'button:has-text("Test Script")',
          'a:has-text("Test Script")',
          '[role="tab"]:has-text("Test Script")',
          'div[role="tab"]:has-text("Test Script")',
          'span:has-text("Test Script")'
        ];

        let scriptClicked = false;
        for (const selector of scriptTabSelectors) {
          try {
            const tab = page.locator(selector).first();
            if (await tab.isVisible({ timeout: 2000 })) {
              await tab.click();
              await page.waitForTimeout(2500);
              console.log('  • Test Script tab clicked');
              scriptClicked = true;
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }

        if (!scriptClicked) {
          console.log('  • Test Script tab not visible, extracting available content');
        }

        // Extract test script content
        console.log('  • Extracting test steps...');

        // Try to find the test steps table/content
        let stepsText = '';

        // Look for table with steps
        const stepsTable = page.locator('table[data-test-id*="test-script"], table.test-steps, div[data-test-id*="test-script"]').first();

        if (await stepsTable.isVisible({ timeout: 3000 })) {
          const rows = await stepsTable.locator('tr').all();
          console.log(`  • Found ${rows.length} step rows`);

          for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            try {
              const rowText = await rows[rowIdx].textContent();
              if (rowText && rowText.trim()) {
                stepsText += `\nStep ${rowIdx + 1}:\n${rowText.trim()}\n${'─'.repeat(60)}`;
              }
            } catch (e) {
              // Skip invalid rows
            }
          }
        }

        // If no structured steps found, get all visible content
        if (!stepsText || stepsText.length < 50) {
          console.log('  • No structured steps, extracting page content');
          const mainContent = await page.locator('main, [role="main"], body').first().textContent();
          stepsText = mainContent;
        }

        if (stepsText && stepsText.trim().length > 30) {
          // Create filename
          let fileName = tc.name
            .replace(/[<>:"/\\|?*\r\n\t]/g, '-')
            .replace(/\s+/g, ' ')
            .replace(/\|/g, '-')
            .trim();

          // Limit filename length
          if (fileName.length > 150) {
            fileName = fileName.substring(0, 150);
          }

          // Ensure it starts with the key
          if (!fileName.startsWith(tc.key)) {
            fileName = `${tc.key} - ${fileName}`;
          }

          const filePath = path.join(outputDir, `${fileName}.txt`);

          const fileContent = `Test Case: ${tc.key}\n` +
                            `Name: ${tc.name}\n` +
                            `URL: ${page.url()}\n` +
                            `Extracted: ${new Date().toLocaleString()}\n\n` +
                            `${'='.repeat(70)}\n` +
                            `TEST SCRIPT\n` +
                            `${'='.repeat(70)}\n\n` +
                            stepsText.trim();

          fs.writeFileSync(filePath, fileContent, 'utf-8');
          console.log(`  ✅ Saved: ${tc.key}.txt`);
          successCount++;
        } else {
          console.log('  ⚠️  No content extracted');
          errorCount++;
        }

        // Brief pause before next
        await page.waitForTimeout(1500);

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errorCount++;
        await page.screenshot({ path: `error-${tc.key}.png` });
      }

      console.log('');
    }

    console.log('='.repeat(70));
    console.log('\n✅ EXTRACTION COMPLETE!\n');
    console.log(`   Success: ${successCount}/${testCases.length}`);
    console.log(`   Errors:  ${errorCount}/${testCases.length}`);
    console.log(`   Location: ${outputDir}\n`);
    console.log('='.repeat(70) + '\n');

    console.log('Browser will remain open for 15 seconds for review...\n');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'fatal-error.png', fullPage: true });
    await page.waitForTimeout(5000);
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed. Check AIM-TestCases folder for results.\n');
  }
})();
