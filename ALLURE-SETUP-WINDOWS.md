# Allure Setup for Windows

## ⚠️ Java Required

Allure requires Java to generate reports. You have two options:

---

## Option 1: Install Java (Recommended)

### Step 1: Download Java
1. Go to: https://www.java.com/en/download/
2. Click "Download Java"
3. Run the installer
4. Follow installation wizard

### Step 2: Verify Installation
```bash
java -version
```
You should see something like:
```
java version "1.8.0_xxx"
Java(TM) SE Runtime Environment...
```

### Step 3: Generate Allure Report
```bash
npm run allure:report
npm run allure:open
```

---

## Option 2: Install Java via Chocolatey (Faster)

If you have Chocolatey installed:
```bash
choco install openjdk11
```

Then:
```bash
npm run allure:serve
```

---

## Option 3: Use Scoop (Alternative Package Manager)

### Install Scoop (if not installed):
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Install Java:
```bash
scoop bucket add java
scoop install openjdk
```

### Verify:
```bash
java -version
```

---

## Option 4: Portable Java (No Installation)

### Download:
1. Go to: https://adoptium.net/
2. Download "JRE" (Java Runtime Environment)
3. Extract to: `C:\Java\`

### Set JAVA_HOME:
```powershell
setx JAVA_HOME "C:\Java\jdk-17.0.xxx"
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

### Restart Terminal and Test:
```bash
java -version
npm run allure:serve
```

---

## 🎯 Quick Test After Java Installation

```bash
# Clean previous results
npm run allure:clean

# Run tests
npm test

# Generate and view report
npm run allure:serve
```

---

## ✅ Verification Checklist

After installing Java:
- [ ] `java -version` works
- [ ] `npm run allure:report` generates report
- [ ] `npm run allure:open` opens in browser
- [ ] Report shows test results
- [ ] Videos are attached

---

## 🆘 Troubleshooting

### "Java not found" error
**Solution:** Restart terminal after installing Java

### "JAVA_HOME not set" error
**Solution:**
```bash
# Windows Command Prompt
setx JAVA_HOME "C:\Program Files\Java\jdk-xx.x.x"

# Or check where Java is installed
where java
```

### Allure command not working
**Solution:**
```bash
# Reinstall allure-commandline
npm install -g allure-commandline
```

---

## 🎊 Once Java is Installed

You'll be able to use all Allure commands:

```bash
npm run allure:serve      # View report (temporary)
npm run allure:report     # Generate HTML report
npm run allure:open       # Open existing report
npm run allure:clean      # Clean old reports
```

---

## 📱 Alternative: View Without Allure (HTML Report)

If you don't want to install Java, Playwright still generates an HTML report:

```bash
# Run tests
npm test

# View HTML report (no Java needed)
npx playwright show-report

# Or manually open
start playwright-report/index.html
```

---

## 🔗 Resources

- **Java Download:** https://www.java.com/en/download/
- **Adoptium (OpenJDK):** https://adoptium.net/
- **Chocolatey:** https://chocolatey.org/
- **Scoop:** https://scoop.sh/

---

## 💡 Recommendation

**Install Java once** → Enjoy beautiful Allure reports forever! 🎉

The installation takes 2-3 minutes and gives you professional test reports.
