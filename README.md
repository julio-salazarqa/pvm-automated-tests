# PVM Automated Testing Suite

Automated end-to-end tests for Practice Velocity Management (PVM) application using Playwright with Allure reporting.

## 🚀 Features

- ✅ Cross-browser testing (Chromium, Firefox, WebKit, Edge)
- 📊 Beautiful Allure reports with video recordings
- 🔐 Secure credential management with environment variables
- ♻️ Cyclable tests with automatic cleanup
- 🎬 Video recording of test execution
- 📈 Historical trends and analytics
- 🤖 CI/CD ready (GitHub Actions, Azure DevOps, Jenkins)

## 📋 Prerequisites

- Node.js 16 or higher
- Java 17 (for Allure reports)
- Git

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/julio-salazarqa/pvm-automated-tests.git
cd pvm-automated-tests
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install Playwright browsers
```bash
npx playwright install
```

### 4. Install Java (for Allure)
**Windows (using winget):**
```bash
winget install --id EclipseAdoptium.Temurin.17.JRE
```

**macOS:**
```bash
brew install openjdk@17
```

**Linux:**
```bash
sudo apt install openjdk-17-jre
```

### 5. Configure credentials
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```
PVM_USERNAME=your-username
PVM_PASSWORD=your-password
PVM_URL=https://devpvpm.practicevelocity.com/
```

**⚠️ Important:** Never commit the `.env` file to the repository!

## 🧪 Running Tests

### Run all tests
```bash
npm test
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=edge
```

### Run specific test file
```bash
npx playwright test tests/enterprise-patient-registration.spec.js
```

## 📊 Viewing Allure Reports

### Generate and view report (one command)
```bash
npm run allure:serve
```

### Generate static report
```bash
npm run allure:report
npm run allure:open
```

### Clean old reports
```bash
npm run allure:clean
```

## 📁 Project Structure

```
.
├── tests/                              # Test files
│   └── enterprise-patient-registration.spec.js
├── .github/workflows/                  # GitHub Actions workflows
│   └── playwright-tests.yml
├── allure-results/                     # Allure test results (gitignored)
├── allure-report/                      # Generated reports (gitignored)
├── test-results/                       # Playwright results (gitignored)
├── .env                                # Your credentials (gitignored)
├── .env.example                        # Credentials template
├── playwright.config.js                # Playwright configuration
├── package.json                        # NPM dependencies
├── README.md                           # This file
└── Documentation/
    ├── CREDENTIALS.md                  # Credentials setup guide
    ├── CI-CD-SETUP.md                  # CI/CD configuration
    ├── ALLURE-REPORTING.md             # Allure reporting guide
    └── SECURITY-EXPLAINED.md           # Security model
```

## 🎯 Test Cases

### Enterprise Patient Registration (XPM-XXXX)
Tests the complete patient registration flow without insurance panel:
1. ✅ Login to PVM application
2. ✅ Navigate to Appointment section
3. ✅ Search for patient with enterprise search
4. ✅ Register new patient
5. ✅ Verify no insurance panel displayed
6. ✅ Verify Delete button present
7. ✅ Clean up (delete patient for cyclability)

**Status:** ✅ Passing on all browsers (Chromium, Firefox, WebKit, Edge)

## 🔐 Security

- ✅ Credentials stored in `.env` file (NOT committed to repository)
- ✅ `.env` is listed in `.gitignore`
- ✅ CI/CD uses encrypted secrets
- ✅ No hardcoded passwords in code
- ✅ Enterprise-grade security model

## 🤖 CI/CD Integration

The project includes workflows for:
- **GitHub Actions** (`.github/workflows/playwright-tests.yml`)
- **Azure DevOps** (`azure-pipelines.yml`)
- **Jenkins** (`Jenkinsfile`)

### Setup CI/CD Secrets

#### GitHub Actions:
1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `PVM_USERNAME`
   - `PVM_PASSWORD`
   - `PVM_URL`

#### Azure DevOps:
1. Pipeline → Edit → Variables
2. Add variables (mark as secret):
   - `PVM_USERNAME`
   - `PVM_PASSWORD`
   - `PVM_URL`

See [CI-CD-SETUP.md](./CI-CD-SETUP.md) for detailed instructions.

## 📚 Documentation

- [CREDENTIALS.md](./CREDENTIALS.md) - Credentials setup guide
- [CI-CD-SETUP.md](./CI-CD-SETUP.md) - CI/CD configuration
- [ALLURE-REPORTING.md](./ALLURE-REPORTING.md) - Allure reporting guide
- [SECURITY-EXPLAINED.md](./SECURITY-EXPLAINED.md) - Security model
- [QUICK-START-CICD.md](./QUICK-START-CICD.md) - 5-minute CI/CD setup
- [ALLURE-SETUP-WINDOWS.md](./ALLURE-SETUP-WINDOWS.md) - Java installation
- [INTEGRATION-TEST-REPORT.md](./INTEGRATION-TEST-REPORT.md) - Test verification

## 🎨 Allure Report Features

- 📊 Interactive dashboard with statistics
- 📈 Pass/fail rates and trends
- 🎬 Embedded video recordings
- 📷 Screenshots on failure
- 📉 Historical trends
- 🔍 Detailed test steps
- 🌍 Environment information
- 🔎 Search and filter capabilities

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all Playwright tests |
| `npm run test:allure` | Run tests and generate Allure report |
| `npm run allure:report` | Generate Allure HTML report |
| `npm run allure:open` | Open existing Allure report |
| `npm run allure:serve` | Serve Allure report (temporary server) |
| `npm run allure:clean` | Clean Allure results and reports |

## 🐛 Troubleshooting

### Tests fail with "PVM_USERNAME not set"
Make sure you created `.env` file from `.env.example` and added your credentials.

### Allure report doesn't generate
Verify Java is installed: `java -version`

### Browser not found
Install browsers: `npx playwright install`

### "JAVA_HOME not set" error
Restart terminal after installing Java, or set JAVA_HOME manually.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

Julio Salazar - [@julio-salazarqa](https://github.com/julio-salazarqa)

Project Link: [https://github.com/julio-salazarqa/pvm-automated-tests](https://github.com/julio-salazarqa/pvm-automated-tests)

## 📄 License

This project is for internal testing purposes.

## 🎉 Acknowledgments

- [Playwright](https://playwright.dev/) - Modern web testing framework
- [Allure](https://docs.qameta.io/allure/) - Beautiful test reporting
- [Practice Velocity](https://practicevelocity.com/) - Application under test
- [Eclipse Adoptium](https://adoptium.net/) - Java runtime

---

**Made with ❤️ by Julio Salazar**
