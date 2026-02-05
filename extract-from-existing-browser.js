const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== CONNECTING TO EXISTING BROWSER ===\n');

  // Connect to existing browser using CDP
  // First, you need to launch your browser with remote debugging
  // Chrome: chrome.exe --remote-debugging-port=9222
  // Or we can list existing browser processes

  try {
    console.log('Looking for running Chromium/Chrome browsers...\n');

    // Try to connect to common debugging ports
    const ports = [9222, 9223, 9224];
    let browser = null;

    for (const port of ports) {
      try {
        console.log(`Trying port ${port}...`);
        browser = await chromium.connectOverCDP(`http://localhost:${port}`);
        console.log(`✅ Connected to browser on port ${port}!\n`);
        break;
      } catch (e) {
        console.log(`  Port ${port} not available`);
      }
    }

    if (!browser) {
      console.log('\n❌ Could not connect to existing browser.');
      console.log('\nTo use this script, you need to:');
      console.log('1. Close all Chrome/Edge browsers');
      console.log('2. Start Chrome with: chrome.exe --remote-debugging-port=9222');
      console.log('3. Navigate to Zephyr and log in');
      console.log('4. Run this script again\n');
      return;
    }

    // Get all contexts and pages
    const contexts = browser.contexts();
    console.log(`Found ${contexts.length} browser contexts\n`);

    if (contexts.length === 0) {
      console.log('No pages found in browser');
      return;
    }

    // Use the first context
    const context = contexts[0];
    const pages = context.pages();
    console.log(`Found ${pages.length} open pages\n`);

    // Find the Zephyr page
    let zephyrPage = null;
    for (const page of pages) {
      const url = page.url();
      if (url.includes('atlassian.net') && url.includes('testCases')) {
        zephyrPage = page;
        console.log(`✅ Found Zephyr page: ${url.substring(0, 80)}...\n`);
        break;
      }
    }

    if (!zephyrPage) {
      console.log('Could not find Zephyr test cases page.');
      console.log('Please make sure Zephyr is open in the browser.\n');
      console.log('Open pages:');
      for (const page of pages) {
        console.log(`  - ${page.url()}`);
      }
      return;
    }

    const page = zephyrPage;

    // Now extract test cases
    console.log('Starting extraction...\n');

    // Create output directory
    const outputDir = path.join(__dirname, 'AIM-TestCases');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Find all test case key links
    await page.waitForTimeout(2000);
    const testKeyLinks = await page.locator('a[href*="/testCase/"]').all();
    console.log(`Found ${testKeyLinks.length} test case links\n`);

    if (testKeyLinks.length === 0) {
      console.log('No test cases found. Are you on the AIM section?');
      return;
    }

    // Extract test cases
    let testCases = [];
    for (let i = 0; i < testKeyLinks.length; i++) {
      try {
        const link = testKeyLinks[i];
        const key = (await link.textContent()).trim();
        const href = await link.getAttribute('href');

        testCases.push({ key, href });
        console.log(`  ${i + 1}. ${key}`);
      } catch (e) {
        // Skip
      }
    }

    console.log(`\nTotal: ${testCases.length} test cases\n`);
    console.log('─'.repeat(70) + '\n');

    // Process each test case
    let successCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      console.log(`[${i + 1}/${testCases.length}] ${tc.key}`);

      try {
        const fullUrl = tc.href.startsWith('http')
          ? tc.href
          : `https://experityhealth.atlassian.net${tc.href}`;

        await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Click Test Script tab
        const scriptTab = page.locator('button:has-text("Test Script"), a:has-text("Test Script")').first();
        if (await scriptTab.isVisible({ timeout: 3000 })) {
          await scriptTab.click();
          await page.waitForTimeout(2000);
        }

        // Extract content
        const content = await page.locator('main, body').first().textContent();

        if (content) {
          const fileName = `${tc.key}.txt`;
          const filePath = path.join(outputDir, fileName);

          fs.writeFileSync(filePath, `Test Case: ${tc.key}\n\n${content}`, 'utf-8');
          console.log(`  ✅ Saved`);
          successCount++;
        }

        await page.waitForTimeout(1000);

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Extraction complete: ${successCount}/${testCases.length}\n`);

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
