# CI/CD Setup Guide - Secure Credentials

## 🔒 Security Model

### How It Works:
1. **YOU** add credentials to CI/CD platform (one time, encrypted storage)
2. **Team members** can run tests but NEVER see the credentials
3. **CI/CD** injects credentials at runtime (as environment variables)
4. **Tests** read from environment variables (same code works locally and in CI/CD)

### What Team Members See:
❌ They DON'T see: `jsalazar@admin` or `Tester.2025`
✅ They DO see: `${{ secrets.PVM_USERNAME }}` (just a reference)

---

## GitHub Actions Setup

### Step 1: Add Secrets (Only You - One Time)
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add three secrets:
   - Name: `PVM_USERNAME` → Value: `jsalazar@admin`
   - Name: `PVM_PASSWORD` → Value: `Tester.2025`
   - Name: `PVM_URL` → Value: `https://devpvpm.practicevelocity.com/`

### Step 2: Commit the Workflow File
```bash
git add .github/workflows/playwright-tests.yml
git commit -m "Add Playwright CI/CD pipeline"
git push
```

### Step 3: Run Tests
- **Automatic**: Pushes to `main` or `develop` trigger tests
- **Manual**: Go to Actions → Playwright Tests → Run workflow

### Who Can See Credentials?
- ✅ **Repository admins** can add/edit secrets
- ❌ **Team members** can run tests but NOT see secrets
- ❌ **PR from forks** don't have access to secrets (security)

---

## Azure DevOps Setup

### Step 1: Add Variables (Only You - One Time)
1. Go to your Azure DevOps project
2. Click **Pipelines** → Select your pipeline → **Edit**
3. Click **Variables** → **New variable**
4. Add three variables:
   - Name: `PVM_USERNAME` → Value: `jsalazar@admin` → ✅ **Keep this value secret**
   - Name: `PVM_PASSWORD` → Value: `Tester.2025` → ✅ **Keep this value secret**
   - Name: `PVM_URL` → Value: `https://devpvpm.practicevelocity.com/`

### Step 2: Commit the Pipeline File
```bash
git add azure-pipelines.yml
git commit -m "Add Playwright CI/CD pipeline"
git push
```

### Step 3: Run Pipeline
- **Automatic**: Pushes to `main` or `develop` trigger pipeline
- **Manual**: Pipelines → Run pipeline

### Who Can See Credentials?
- ✅ **Pipeline administrators** can add/edit variables
- ❌ **Team members** can run pipeline but NOT see secret values
- 🔒 **Masked in logs**: Secrets show as `***` in pipeline output

---

## Jenkins Setup

### Step 1: Add Credentials (Only You - One Time)
1. Go to Jenkins dashboard
2. Click **Manage Jenkins** → **Manage Credentials**
3. Click **System** → **Global credentials** → **Add Credentials**
4. Select **Username with password**:
   - ID: `pvm-credentials-id`
   - Username: `jsalazar@admin`
   - Password: `Tester.2025`
   - Description: `PVM Test Environment Credentials`

### Step 2: Commit the Jenkinsfile
```bash
git add Jenkinsfile
git commit -m "Add Playwright Jenkins pipeline"
git push
```

### Step 3: Create Jenkins Job
1. New Item → Pipeline
2. Pipeline → Definition: Pipeline script from SCM
3. SCM: Git → Repository URL: your-repo-url
4. Script Path: `Jenkinsfile`
5. Save

### Who Can See Credentials?
- ✅ **Jenkins administrators** can add/edit credentials
- ❌ **Team members** can run jobs but NOT see credentials
- 🔒 **Masked in console**: Credentials show as `****` in build logs

---

## GitLab CI/CD Setup

If you're using GitLab, add this file:

**`.gitlab-ci.yml`:**
```yaml
image: mcr.microsoft.com/playwright:v1.40.0-focal

variables:
  PVM_URL: "https://devpvpm.practicevelocity.com/"

stages:
  - test

playwright-tests:
  stage: test
  script:
    - npm ci
    - npx playwright install
    - npm test
  variables:
    PVM_USERNAME: $PVM_USERNAME
    PVM_PASSWORD: $PVM_PASSWORD
  artifacts:
    when: always
    paths:
      - test-results/
      - playwright-report/
    expire_in: 1 week
```

**Add Secrets:**
1. Settings → CI/CD → Variables → Expand
2. Add variable: `PVM_USERNAME` → Value: `jsalazar@admin` → ✅ **Masked + Protected**
3. Add variable: `PVM_PASSWORD` → Value: `Tester.2025` → ✅ **Masked + Protected**

---

## Local Development vs CI/CD

### Local (Your Computer):
```bash
# Uses .env file (your credentials)
npm test
```

### CI/CD (Pipeline):
```bash
# Uses CI/CD secrets (injected at runtime)
npm test  # Same command!
```

**The code is the same!** It automatically detects:
- Local: Read from `.env` file
- CI/CD: Read from environment variables

---

## Testing the Setup

### Test Locally First:
```bash
npm test
# Should pass ✅
```

### Test in CI/CD:
1. Push code to repository
2. Check CI/CD pipeline runs
3. Verify tests pass
4. Check videos are uploaded as artifacts

---

## Security Best Practices

### ✅ DO:
- Store credentials in CI/CD secrets (encrypted)
- Use different credentials for test/prod environments
- Rotate credentials periodically
- Limit who can edit secrets (admins only)
- Review audit logs for secret access

### ❌ DON'T:
- Commit `.env` file to repository
- Share credentials in chat/email
- Use production credentials in test environment
- Log credentials in test output
- Give all team members admin access

---

## Troubleshooting

### Pipeline fails with "PVM_USERNAME not set"
**Solution:** Make sure secrets are added in CI/CD platform

### Tests fail with "Invalid credentials"
**Solution:** Check that secret values are correct (no extra spaces)

### Team member can't run pipeline
**Solution:** Give them "Build" permission (not "Admin")

### Want to update credentials
**Solution:** Only admins can edit secrets in CI/CD settings

---

## Summary

| Aspect | Local Dev | CI/CD Pipeline |
|--------|-----------|----------------|
| **Credentials stored in** | `.env` file | CI/CD secrets |
| **Who can see them** | Only you | Only admins |
| **Team members** | Use their own `.env` | Can run tests, can't see secrets |
| **Security level** | Medium 🟡 | High 🟢 |
| **Setup** | Copy `.env.example` | Admin adds secrets once |

**Result:** Your credentials are secure, and your team can run tests without seeing them! 🔒✅
