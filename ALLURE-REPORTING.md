# Allure Reporting Guide

## 🎯 What is Allure?

Allure is a flexible, lightweight test report framework that provides:
- 📊 Beautiful, interactive HTML reports
- 📈 Detailed test execution statistics
- 🎬 Screenshots and video attachments
- 📝 Step-by-step test execution details
- 📉 Historical trends and analytics
- 🔍 Filters and search capabilities

---

## 🚀 Quick Start

### Generate and View Report (One Command):
```bash
npm run allure:serve
```
This will:
1. Run all tests
2. Generate Allure report
3. Open it in your browser automatically

---

## 📋 Available Commands

### 1. Run Tests and Generate Report
```bash
npm run test:allure
```
- Runs all Playwright tests
- Generates Allure report
- Creates `allure-report/` folder

### 2. View Existing Report
```bash
npm run allure:open
```
- Opens the last generated report in browser
- No tests are run

### 3. Generate Report from Results
```bash
npm run allure:report
```
- Generates HTML report from `allure-results/`
- Useful after running `npm test`

### 4. Serve Report (Temporary Server)
```bash
npm run allure:serve
```
- Starts temporary web server
- Opens report in browser
- Best for quick viewing

### 5. Clean Reports
```bash
npm run allure:clean
```
- Removes `allure-results/` and `allure-report/`
- Clears all report data

---

## 📊 Understanding the Report

### Main Dashboard
When you open an Allure report, you'll see:

#### 1. Overview Section
- **Total Tests:** Number of tests executed
- **Passed:** ✅ Green - Successful tests
- **Failed:** ❌ Red - Failed tests
- **Broken:** 🟡 Yellow - Tests with errors
- **Skipped:** ⚪ Gray - Skipped tests

#### 2. Categories
- **Product Defects:** Application bugs
- **Test Defects:** Test code issues
- **System Defects:** Infrastructure problems

#### 3. Suites
- View tests organized by test suites
- Click on any suite to see detailed tests

#### 4. Graphs
- **Status Chart:** Pass/Fail distribution
- **Severity Chart:** Tests by severity level
- **Duration Chart:** Test execution times

#### 5. Timeline
- Visual timeline of test execution
- See which tests ran in parallel
- Identify bottlenecks

#### 6. Behaviors
- Tests grouped by features
- BDD-style view (Given/When/Then)

---

## 🎨 Report Features

### Test Details Page
Click on any test to see:

1. **Execution Status**
   - Pass/Fail status
   - Execution time
   - Retry information

2. **Test Steps**
   - Detailed step-by-step execution
   - Screenshots at each step
   - Console logs

3. **Attachments**
   - 📹 Videos (if test failed or video: 'on')
   - 📷 Screenshots
   - 📄 Logs and traces

4. **Environment Info**
   - Test Environment: Development
   - Application: PVM
   - Base URL: Your PVM URL

5. **History**
   - Previous executions
   - Trend over time

---

## 🎬 Video and Screenshot Integration

### Automatic Attachments
Allure automatically includes:
- ✅ Videos for all tests (configured with `video: 'on'`)
- ✅ Screenshots on failure
- ✅ Browser traces on failure

### Viewing Media
1. Open test details
2. Scroll to "Attachments" section
3. Click on video/screenshot to view

---

## 📈 Historical Trends

### Setup History Tracking
1. Keep previous reports:
   ```bash
   # Instead of cleaning, copy history
   cp -r allure-report/history allure-results/history
   npm test
   npm run allure:report
   ```

2. View trends:
   - Click "Trend" tab in report
   - See pass/fail rates over time
   - Identify flaky tests

---

## 🔧 Advanced Configuration

### Custom Environment Info
Edit `playwright.config.js`:
```javascript
environmentInfo: {
  'Test Environment': 'Development',
  'Application': 'PVM',
  'Browser': 'Chrome',
  'OS': 'Windows',
  'Tester': 'Your Name'
}
```

### Add Test Metadata
In your test file:
```javascript
test('My test', async ({ page }) => {
  // Add description
  await test.info().attach('Description', {
    body: 'This test verifies patient registration'
  });

  // Add severity
  await test.info().attach('Severity', {
    body: 'critical'
  });
});
```

---

## 📊 Example Workflow

### Daily Testing Workflow:
```bash
# Morning: Run all tests
npm test

# View results
npm run allure:serve

# Analyze failures, fix issues

# Afternoon: Re-run tests
npm test

# Generate final report
npm run allure:report
npm run allure:open
```

### CI/CD Workflow:
```bash
# In CI/CD pipeline:
npm test
npm run allure:report

# Publish allure-report/ folder as artifact
# Team can download and view the report
```

---

## 🎯 What You'll See for Your Test

### Enterprise Patient Registration Test
The report will show:

1. **Test Name:** Register new patient without insurance panel - XPM-XXXX

2. **Test Steps:**
   - Step 1: Login with credentials
   - Step 2: Navigate to Appointment
   - Step 3: Fill patient search form
   - Step 4: Click Verify
   - Step 5: Select/Register patient
   - Step 6: Verify no insurance panel
   - Step 7: Click Delete button
   - Step 8: Accept confirmation dialog
   - Step 9: Patient deleted successfully

3. **Attachments:**
   - 📹 Video of entire test execution
   - 📷 Screenshot (if test fails)
   - 📝 Console logs

4. **Browsers:**
   - Chromium: ✅ Passed
   - Firefox: ✅ Passed
   - WebKit: ✅ Passed
   - Edge: ✅ Passed

---

## 🐛 Debugging Failed Tests

### When a Test Fails:
1. Open Allure report
2. Click on failed test (red)
3. View:
   - **Error Message:** What went wrong
   - **Stack Trace:** Where it failed
   - **Screenshot:** Visual state when it failed
   - **Video:** Full execution replay
   - **Console Logs:** Browser console output

### Quick Debugging:
```bash
# Run specific test
npx playwright test tests/enterprise-patient-registration.spec.js --project=chromium

# View report
npm run allure:serve
```

---

## 📱 Sharing Reports

### Method 1: HTML Report (Recommended)
```bash
# Generate report
npm run allure:report

# Share entire allure-report/ folder
# Recipient: Open allure-report/index.html in browser
```

### Method 2: CI/CD Artifacts
```bash
# In CI/CD, upload allure-report/ as artifact
# Team downloads and opens locally
```

### Method 3: Allure Server (Advanced)
```bash
# Deploy to Allure Server
# Access via URL (requires Allure Server setup)
```

---

## 🎨 Report Customization

### Custom Logo
Add to `playwright.config.js`:
```javascript
['allure-playwright', {
  detail: true,
  outputFolder: 'allure-results',
  logo: './path/to/logo.png'
}]
```

### Custom Categories
Create `allure-results/categories.json`:
```json
[
  {
    "name": "Login Issues",
    "matchedStatuses": ["failed"],
    "messageRegex": ".*login.*"
  },
  {
    "name": "Timeout Issues",
    "matchedStatuses": ["broken"],
    "messageRegex": ".*timeout.*"
  }
]
```

---

## 🔍 Filters and Search

### Available Filters:
- **Status:** Passed, Failed, Broken, Skipped
- **Severity:** Blocker, Critical, Normal, Minor, Trivial
- **Feature:** Group by feature name
- **Browser:** Filter by browser type

### Search:
- Use search bar at top
- Search by test name
- Search by error message

---

## 📊 Sample Report Structure

```
allure-report/
├── index.html          # Main report page
├── app.js              # Report functionality
├── styles.css          # Report styling
├── data/               # Test data
│   ├── test-cases/     # Individual test results
│   ├── attachments/    # Videos, screenshots
│   └── suites.json     # Test suites data
└── history/            # Historical data
```

---

## ⚡ Performance Tips

### Faster Report Generation:
```bash
# Generate without cleaning (faster)
allure generate allure-results -o allure-report

# Or use serve for quick view (no files generated)
npm run allure:serve
```

### Reduce Report Size:
1. Don't include videos for passed tests:
   ```javascript
   video: 'retain-on-failure'  // Instead of 'on'
   ```

2. Clean old results regularly:
   ```bash
   npm run allure:clean
   ```

---

## 🆘 Troubleshooting

### Report Not Generating
```bash
# Check if allure-results exist
ls allure-results

# If empty, run tests first
npm test

# Then generate report
npm run allure:report
```

### "Allure command not found"
```bash
# Install globally
npm install -g allure-commandline

# Or use npx
npx allure serve allure-results
```

### Empty Report
```bash
# Make sure tests ran
npm test

# Check for results
ls allure-results/*.json

# Generate report
npm run allure:report
```

---

## 🎯 Best Practices

1. ✅ **Clean before major runs:**
   ```bash
   npm run allure:clean && npm test
   ```

2. ✅ **Keep history for trends:**
   ```bash
   cp -r allure-report/history allure-results/history
   ```

3. ✅ **Use meaningful test names:**
   ```javascript
   test('User can register new patient - XPM-1234', ...)
   ```

4. ✅ **Add screenshots at key points:**
   ```javascript
   await page.screenshot({ path: 'step-1.png' });
   ```

5. ✅ **Document failures:**
   - Add comments in test code
   - Use descriptive error messages

---

## 📚 Resources

- **Allure Documentation:** https://docs.qameta.io/allure/
- **Allure Playwright:** https://www.npmjs.com/package/allure-playwright
- **Report Examples:** https://demo.qameta.io/allure/

---

## 🎊 Summary

**Allure gives you:**
- 📊 Beautiful, professional test reports
- 🎬 Video playback of test execution
- 📈 Historical trends and analytics
- 🔍 Easy debugging with screenshots and logs
- 👥 Easy sharing with stakeholders
- 📱 Mobile-friendly viewing

**Simple workflow:**
```bash
npm test                # Run tests
npm run allure:serve   # View report
```

**Enjoy your beautiful test reports! 🎉📊**
