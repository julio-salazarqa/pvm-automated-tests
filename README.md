# PVM Automated Testing Suite

Automated end-to-end tests for Practice Velocity Management (PVM) using Playwright with Allure reporting.

📊 **[View Latest Test Report](https://julio-salazarqa.github.io/pvm-automated-tests/)** (Allure Report on GitHub Pages)

## Prerequisites

- Node.js 16+
- Java 17 (for Allure reports)

## Setup

### 1. Clone and install
```bash
git clone https://github.com/julio-salazarqa/pvm-automated-tests.git
cd pvm-automated-tests
npm install
npx playwright install
```

### 2. Configure credentials
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
PVM_USERNAME=your-username
PVM_PASSWORD=your-password
PVM_URL=https://devpvpm.practicevelocity.com/
```

**⚠️ Never commit `.env` file**

### 3. Install Java (for Allure reports)
```bash
# Windows
winget install --id EclipseAdoptium.Temurin.17.JRE

# macOS
brew install openjdk@17

# Linux
sudo apt install openjdk-17-jre
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=edge
```

## Viewing Reports

### Online Report (GitHub Pages)
📊 **[View Latest Test Report](https://julio-salazarqa.github.io/pvm-automated-tests/)**

### Local Reports
```bash
# Generate and open Allure report locally
npm run allure:serve

# Or generate static report
npm run allure:report
npm run allure:open
```

### Publish Updated Report to GitHub Pages
```bash
powershell -ExecutionPolicy Bypass -File publish-report.ps1
```
This script will run tests, generate the report, and publish it automatically.

## Test Cases

### 1. Enterprise Patient Registration (XPM-XXXX)
- Login to PVM
- Navigate to Appointments
- Search and register patient
- Verify no insurance panel
- Clean up (delete patient)

**Status:** ✅ Passing locally | ⏭️ Skipped in CI

### 2. Clockwise Patient Check-in and Registration (XPM-T3432)
- Create unique patient in Clockwise for next day
- Login to PM
- Navigate to LogBook with calendar date picker
- Find patient synced from Clockwise (~5 seconds)
- Complete registration: Add → Verify → Register
- Fill mandatory address fields (address, city, zip)
- Navigate through Patient Information → Billing pages
- Validate address fields are required

**Status:** ✅ Passing locally (~1.2 min) | ⏭️ Skipped in CI

**Note:** Both tests require access to external systems (PM and Clockwise) and are skipped in GitHub Actions CI. Run tests locally with valid credentials to see full results.

## CI/CD Setup (GitHub Actions)

Add these secrets in repository settings:
1. Go to Settings → Secrets → Actions
2. Add:
   - `PVM_USERNAME`
   - `PVM_PASSWORD`
   - `PVM_URL`

---

**Contact:** [@julio-salazarqa](https://github.com/julio-salazarqa)
