const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Lista de test cases de AIM (los que tienes en el screenshot)
const aimTestCases = [
  'XPM-T4436',
  'XPM-T4201',
  'XPM-T4469',
  'XPM-T4471',
  'XPM-T4467',
  'XPM-T4468',
  'XPM-T4617',
  'XPM-T4621',
  'XPM-T4693',
  'XPM-T4694',
  'XPM-T4691',
  'XPM-T4620',
  'XPM-T4616',
  'XPM-T4694',
  'XPM-T4621',
  'XPM-T4617',
  'XPM-T4615',
  'XPM-T4618',
  'XPM-T4619',
  'XPM-T4622',
  'XPM-T4623'
];

(async () => {
  console.log('=== EXTRACTING AIM TEST CASES FROM EDGE ===\n');

  try {
    // Connect to Edge with debugging
    console.log('Connecting to Edge on port 9222...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ Connected!\n');

    const contexts = browser.contexts();
    const context = contexts[0];
    const pages = context.pages();

    // Find Zephyr page or use first page
    let page = pages.find(p => p.url().includes('atlassian.net')) || pages[0];
    console.log(`Using page: ${page.url().substring(0, 80)}...\n`);

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log('📁 Created: AIM-TestCases\n');
    }

    console.log(`Processing ${aimTestCases.length} test cases...\n`);
    console.log('─'.repeat(70) + '\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < aimTestCases.length; i++) {
      const testKey = aimTestCases[i];
      console.log(`[${i + 1}/${aimTestCases.length}] ${testKey}`);

      try {
        // Navigate to test case
        const url = `https://experityhealth.atlassian.net/projects/XPM?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCase/${testKey}`;

        console.log('  • Opening test case...');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(4000);

        // Look for Test Script tab and click it
        console.log('  • Looking for Test Script tab...');

        const scriptTabSelectors = [
          'button:has-text("Test Script")',
          'a:has-text("Test Script")',
          '[role="tab"]:has-text("Test Script")',
          'div[role="tab"]:has-text("Test Script")',
          'span:has-text("Test Script")',
          'button:text("Test Script")',
          'div:text("Test Script")'
        ];

        let clicked = false;
        for (const selector of scriptTabSelectors) {
          try {
            const tab = page.locator(selector).first();
            if (await tab.isVisible({ timeout: 2000 })) {
              console.log(`  • Found Test Script tab, clicking...`);
              await tab.click();
              await page.waitForTimeout(3000);
              clicked = true;
              break;
            }
          } catch (e) {
            // Try next
          }
        }

        if (!clicked) {
          console.log('  • Test Script tab not found, extracting visible content');
        }

        // Take screenshot for debugging
        await page.screenshot({ path: `debug-${testKey}.png` });

        // Extract test script content
        console.log('  • Extracting content...');

        // Try to find test steps in various ways
        let testSteps = '';

        // Method 1: Look for test script table/container
        const scriptContainer = page.locator('[data-testid*="test-script"], [class*="test-script"], [id*="test-script"]').first();
        if (await scriptContainer.isVisible({ timeout: 2000 })) {
          testSteps = await scriptContainer.textContent();
        }

        // Method 2: Look for table rows with steps
        if (!testSteps || testSteps.length < 50) {
          const stepsTable = page.locator('table').first();
          if (await stepsTable.isVisible({ timeout: 2000 })) {
            const rows = await stepsTable.locator('tr').all();
            let stepsArray = [];
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
              const rowText = await rows[rowIdx].textContent();
              if (rowText && rowText.trim()) {
                stepsArray.push(`Step ${rowIdx + 1}:\n${rowText.trim()}`);
              }
            }
            testSteps = stepsArray.join('\n\n' + '─'.repeat(60) + '\n\n');
          }
        }

        // Method 3: Get all visible content from main area
        if (!testSteps || testSteps.length < 50) {
          const mainContent = await page.locator('main, [role="main"], body').first().textContent();
          testSteps = mainContent;
        }

        // Get test case name from page
        let testName = testKey;
        try {
          const nameElement = page.locator('[data-testid*="name"], h1, h2').first();
          if (await nameElement.isVisible({ timeout: 1000 })) {
            testName = await nameElement.textContent();
          }
        } catch (e) {
          // Use key if name not found
        }

        if (testSteps && testSteps.trim().length > 30) {
          // Create filename
          let fileName = testName
            .replace(/[<>:"/\\|?*\r\n\t]/g, '-')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 120);

          if (!fileName.includes(testKey)) {
            fileName = `${testKey} - ${fileName}`;
          }

          const filePath = path.join(outputDir, `${fileName}.txt`);

          const fileContent = `Test Case: ${testKey}\n` +
                            `Name: ${testName}\n` +
                            `URL: ${url}\n` +
                            `Extracted: ${new Date().toLocaleString()}\n\n` +
                            `${'='.repeat(70)}\n` +
                            `TEST SCRIPT\n` +
                            `${'='.repeat(70)}\n\n` +
                            testSteps.trim();

          fs.writeFileSync(filePath, fileContent, 'utf-8');
          console.log(`  ✅ Saved: ${testKey}.txt`);
          successCount++;
        } else {
          console.log(`  ⚠️  No content found (check debug-${testKey}.png)`);
          errorCount++;
        }

        await page.waitForTimeout(1500);

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errorCount++;
      }

      console.log('');
    }

    console.log('='.repeat(70));
    console.log('\n✅ EXTRACTION COMPLETE!\n');
    console.log(`   Success: ${successCount}/${aimTestCases.length}`);
    console.log(`   Errors:  ${errorCount}/${aimTestCases.length}`);
    console.log(`   Location: ${outputDir}\n`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  }
})();
