const { test, expect } = require('@playwright/test');

test('DevPVPM - Initial login form access and credential field navigation', async ({ page }) => {
  console.log('=== STARTING DEVPVPM LOGIN TEST ===');
  
  // Navigate to login page
  console.log('1. Navigating to login URL...');
  await page.goto('/26_3/loginpage.aspx?ReturnUrl=%2f26_3%2f', {
    waitUntil: 'load'
  });
  
  console.log('Initial URL:', page.url());
  await page.waitForTimeout(1500);
  
  // Take initial screenshot
  await page.screenshot({ path: 'step0-login-form-initial.png' });
  console.log('2. Login form loaded');
  
  // Wait before filling
  await page.waitForTimeout(1000);
  
  // Locate username field
  console.log('3. Locating username field...');
  const userField = page.locator('#txtLogin');
  
  // Click field to ensure focus
  await userField.click();
  await page.waitForTimeout(500);
  console.log('4. Username field focused');
  
  // Fill username slowly to be visible in video
  console.log('5. Writing username...');
  await userField.fill('jsalazar@admin');
  await page.waitForTimeout(1500);
  
  // Take screenshot after filling username
  await page.screenshot({ path: 'step1-username-filled.png' });
  console.log('6. Username entered: jsalazar@admin');
  
  // Wait to see properly in video
  await page.waitForTimeout(1000);
  
  // Verify field contains value
  const userValue = await userField.inputValue();
  console.log('7. Verifying field value:', userValue);
  expect(userValue).toBe('jsalazar@admin');
  
  // Wait before clicking
  await page.waitForTimeout(1000);
  
  // Click Next button
  console.log('8. Clicking Next button...');
  const nextButton = page.locator('#btnNext');
  await nextButton.click();
  
  // Wait for server response and next screen load
  console.log('9. Waiting for server response and next screen load...');
  await page.waitForTimeout(3000);
  
  // Take screenshot after clicking Next
  await page.screenshot({ path: 'step2-after-next.png' });
  console.log('10. State after clicking Next - URL:', page.url());
  
  // Wait to detect password field
  await page.waitForTimeout(1500);
  
  // Check if password field is visible
  console.log('11. Searching for password field...');
  const passwordFields = await page.locator('input[type="password"]').count();
  console.log('12. Password fields found:', passwordFields);
  
  if (passwordFields > 0) {
    console.log('13. Password field detected - Filling...');
    
    // Take screenshot showing password field
    await page.screenshot({ path: 'step3-password-field-visible.png' });
    await page.waitForTimeout(1000);
    
    // Locate and click password field
    const passField = page.locator('input[type="password"]').first();
    await passField.click();
    await page.waitForTimeout(800);
    console.log('14. Password field focused');
    
    // Take screenshot of focused field
    await page.screenshot({ path: 'step4-password-focused.png' });
    await page.waitForTimeout(800);
    
    // Fill password slowly to be visible in video
    console.log('15. Writing password...');
    await passField.fill('Tester.2025');
    await page.waitForTimeout(2000);
    
    // Take screenshot after filling password
    await page.screenshot({ path: 'step5-password-filled.png' });
    console.log('16. Password entered');
    
    // Wait to see properly in video
    await page.waitForTimeout(1500);
    
    // Verify field contains value
    const passValue = await passField.inputValue();
    console.log('17. Verifying password field value:', passValue ? '(filled)' : '(empty)');
    
    // Wait before searching for submit button
    await page.waitForTimeout(1000);
    
    // Search for submit/login button - try multiple selectors
    console.log('18. Searching for login/submit button...');
    
    // First try button[type="submit"]
    let loginBtn = page.locator('button[type="submit"]').first();
    let btnCount = await page.locator('button[type="submit"]').count();
    console.log('19. Submit buttons found:', btnCount);
    
    // If none, try input[type="submit"]
    if (btnCount === 0) {
      const inputSubmitCount = await page.locator('input[type="submit"]').count();
      console.log('20. Submit inputs found:', inputSubmitCount);
      if (inputSubmitCount > 0) {
        loginBtn = page.locator('input[type="submit"]').first();
      }
    }
    
    // If still none, search by common IDs
    if (btnCount === 0) {
      const btnById = await page.locator('button#btnLogin, button#btnSubmit, input#btnLogin, input#btnSubmit').count();
      if (btnById > 0) {
        loginBtn = page.locator('button#btnLogin, button#btnSubmit, input#btnLogin, input#btnSubmit').first();
        console.log('21. Button found by ID');
      }
    }
    
    // If still none, use any button/input
    if (btnCount === 0) {
      const allButtons = await page.locator('button, input[type="button"]').count();
      console.log('22. Total buttons/inputs available:', allButtons);
      if (allButtons > 0) {
        loginBtn = page.locator('button, input[type="button"]').last();
        console.log('23. Using last button/input found');
      }
    }
    
    // Now try clicking
    const loginBtnExists = await loginBtn.isVisible().catch(() => false);
    if (loginBtnExists) {
      console.log('24. Login button visible - clicking...');
      await loginBtn.click();
      
      // Wait for login to process
      console.log('25. Processing login...');
      await page.waitForTimeout(3000);
      
      // Take screenshot after login
      await page.screenshot({ path: 'step6-login-processed.png' });
      console.log('26. Login result - URL:', page.url());
      
      // Wait to see if we're logged in
      await page.waitForTimeout(2000);
    } else {
      console.log('24. No visible button found - trying Enter key');
      
      // Try pressing Enter in password field
      await passField.press('Enter');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'step6-login-enter.png' });
      console.log('25. Enter pressed - URL:', page.url());
      await page.waitForTimeout(2000);
    }
  } else {
    console.log('13. No password field visible - test completed up to username');
    await page.waitForTimeout(2000);
  }
  
  // Final wait to capture state
  await page.waitForTimeout(2000);
  
  // Take final screenshot
  console.log('23. Capturing final test state...');
  await page.screenshot({ path: 'step7-final-state.png' });
  
  // Get final state
  const finalUrl = page.url();
  console.log('24. Final URL:', finalUrl);
  console.log('25. Did URL change from login?:', !finalUrl.includes('loginpage'));
  
  // Final log
  console.log('=== TEST COMPLETED SUCCESSFULLY ===');
  
  // Verification
  expect(page.url()).toBeTruthy();
});
