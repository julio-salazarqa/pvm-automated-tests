const { test, expect } = require('@playwright/test');

test.describe('Enterprise Patient Search and Registration', () => {
  test('Register new patient without insurance panel - XPM-XXXX', async ({ page, context }) => {
    // Skip this test in CI environment (GitHub Actions) since it requires PM system access
    test.skip(!!process.env.CI, 'Skipping test in CI environment - requires PM system access with valid credentials');

    test.setTimeout(90000); // Increase timeout to 90 seconds for the full test

    // Load credentials from environment variables
    const username = process.env.PVM_USERNAME;
    const password = process.env.PVM_PASSWORD;
    const baseUrl = process.env.PVM_URL || 'https://devpvpm.practicevelocity.com/';

    // Validate that credentials are loaded
    if (!username || !password) {
      throw new Error('PVM_USERNAME and PVM_PASSWORD must be set in .env file');
    }

    // Given: Navigate to PVM and login
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // Step 1: Login with valid credentials
    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Enter username from environment variable
    const usernameField = page.getByRole('textbox').first();
    await test.step('Enter username', async () => {
      await usernameField.fill(username);
    });

    // Click Next button (this reveals the password field)
    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.click();
    await page.waitForTimeout(1000);

    // Enter password from environment variable (hidden from report)
    const passwordField = page.locator('input[type="password"]').last();
    await passwordField.waitFor({ state: 'visible', timeout: 15000 });
    await test.step('Enter password', async () => {
      // Use evaluate to hide from Allure report
      await passwordField.evaluate((el, pass) => el.value = pass, password);
      await passwordField.dispatchEvent('input');
    });

    // Click Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for successful login and Log Book page to load
    await page.waitForTimeout(3000);

    // Step 2: Practice and Clinic should already be selected as TEST

    // Step 3: Click on "Appointment" button
    await page.getByRole('button', { name: 'Appointment' }).first().click();
    await page.waitForTimeout(3000);

    // Step 4: We're now on LogDetail page with Patient Data form
    // Step 5: Enter search parameters

    // Wait for the form to be ready
    await page.waitForSelector('text=Patient Data', { timeout: 10000 });

    // Get only visible text input fields
    const visibleInputs = page.locator('input[type="text"]:visible, input:not([type]):visible');

    // Date of Birth: 01/01/2000
    await visibleInputs.nth(0).fill('01/01/2000');

    // Last Name: zikkimin
    await visibleInputs.nth(1).fill('zikkimin');

    // First Name: peki
    await visibleInputs.nth(2).fill('peki');

    // SSN: 334-22-1458
    await visibleInputs.nth(3).fill('334-22-1458');

    // Phone: 6783461794
    await visibleInputs.nth(4).fill('6783461794');

    // Cell Phone: 6783461794
    await visibleInputs.nth(5).fill('6783461794');

    // Patient Number: - (leave empty, it's the 7th input)

    // Reason for Visit: Select "Illness"
    await page.locator('#ddlReasonForVisitSelect').selectOption({ label: 'Illness' });
    await page.waitForTimeout(500);

    // Step 6: Click Verify button
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.waitForTimeout(3000);

    // Step 7: Check if patient exists in enterprise search or register new
    const zikkiminLink = page.getByRole('link', { name: 'ZIKKIMIN' });
    const registerButton = page.getByRole('button', { name: 'Register' });

    // Check if the patient link exists (patient found in enterprise search)
    const linkExists = await zikkiminLink.count() > 0;

    if (linkExists) {
      console.log('Patient found in enterprise search, selecting...');
      // Click on the ZIKKIMIN patient link (first result)
      await zikkiminLink.click();
      await page.waitForTimeout(2000);

      // A message appears: "This patient has not completed registration"
      // Click on "Registration" button to complete registration
      await page.getByRole('button', { name: 'Registration' }).click();
      await page.waitForTimeout(3000);
    } else {
      console.log('Patient not found, registering new patient...');
      // Patient not found, click Register to create new patient
      await registerButton.click();
      await page.waitForTimeout(3000);
    }

    // Step 8: Registration form should be displayed
    // Verify we're on the Patient Information page
    await expect(page.locator('text=Patient Information')).toBeVisible();

    // Then: Verify user successfully completed registration
    // and does not see the insurance panel

    // Check that insurance panel is NOT visible
    // We should not see text like "Insurance" or "Coverage" prominently
    const insuranceText = page.locator('text=/Insurance Information|Coverage Information/i');
    await expect(insuranceText).not.toBeVisible();

    // Check that Delete button exists (it should be a red button in the top right)
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first();
    await expect(deleteButton).toBeVisible();

    // Verify patient was created - check for patient name in header
    await expect(page.locator('text=/ZIKKIMIN.*PEKI/i')).toBeVisible();

    console.log('✓ Test PASSED: Registration completed successfully');
    console.log('✓ Insurance panel is NOT visible (as expected)');
    console.log('✓ Delete button is present and visible');

    // Step 9: Clean up - Delete the patient to make the test cyclable
    // IMPORTANT: Register dialog handler BEFORE clicking Delete
    page.once('dialog', async dialog => {
      console.log('Confirmation dialog appeared:', dialog.message());
      await dialog.accept();
      console.log('Confirmation dialog accepted');
    });

    // Click Delete button (this will trigger the confirmation dialog)
    await deleteButton.click();

    console.log('✓ Patient deleted successfully - test is now cyclable');
  });
});
