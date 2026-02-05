# PVM Automated Testing Suite

Automated end-to-end tests for Practice Velocity Management (PVM) using Playwright with Allure reporting.

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

```bash
# Generate and open Allure report
npm run allure:serve

# Or generate static report
npm run allure:report
npm run allure:open
```

## Test Cases

### Enterprise Patient Registration
- Login to PVM
- Navigate to Appointments
- Search and register patient
- Verify no insurance panel
- Clean up (delete patient)

**Status:** ✅ Passing on all browsers

## CI/CD Setup (GitHub Actions)

Add these secrets in repository settings:
1. Go to Settings → Secrets → Actions
2. Add:
   - `PVM_USERNAME`
   - `PVM_PASSWORD`
   - `PVM_URL`

---

**Contact:** [@julio-salazarqa](https://github.com/julio-salazarqa)
