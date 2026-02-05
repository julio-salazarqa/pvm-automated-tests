# Quick Start - CI/CD Setup (5 Minutes)

## 🎯 Goal
Your team can run tests in CI/CD **without seeing your credentials**.

---

## 📋 Step-by-Step

### For GitHub Actions (Most Common)

#### 1️⃣ Add Secrets (2 minutes - Only You)
1. Go to: `https://github.com/YOUR-USERNAME/YOUR-REPO/settings/secrets/actions`
2. Click "New repository secret" (3 times):
   - **Secret 1:**
     - Name: `PVM_USERNAME`
     - Value: `jsalazar@admin`
   - **Secret 2:**
     - Name: `PVM_PASSWORD`
     - Value: `Tester.2025`
   - **Secret 3:**
     - Name: `PVM_URL`
     - Value: `https://devpvpm.practicevelocity.com/`
3. Click "Add secret" for each

#### 2️⃣ Commit Workflow File (1 minute)
```bash
git add .github/workflows/playwright-tests.yml
git commit -m "Add CI/CD pipeline"
git push
```

#### 3️⃣ Watch It Run (2 minutes)
1. Go to: `https://github.com/YOUR-USERNAME/YOUR-REPO/actions`
2. You'll see "Playwright Tests" running
3. Wait for ✅ green checkmark

#### 4️⃣ Test Team Access
1. Ask a team member to go to Actions tab
2. They click "Playwright Tests" → "Run workflow"
3. ✅ Tests run successfully
4. ❌ They CANNOT see your credentials

**Done! 🎉**

---

### For Azure DevOps

#### 1️⃣ Add Variables (2 minutes - Only You)
1. Pipelines → Edit → Variables
2. Add 3 variables (click "Keep this value secret" ✅):
   - `PVM_USERNAME` = `jsalazar@admin`
   - `PVM_PASSWORD` = `Tester.2025`
   - `PVM_URL` = `https://devpvpm.practicevelocity.com/`

#### 2️⃣ Commit Pipeline File (1 minute)
```bash
git add azure-pipelines.yml
git commit -m "Add CI/CD pipeline"
git push
```

#### 3️⃣ Run Pipeline
Pipelines → Run → ✅ Success

**Done! 🎉**

---

### For Jenkins

#### 1️⃣ Add Credentials (2 minutes - Only You)
1. Manage Jenkins → Credentials → System → Global
2. Add Credentials:
   - Kind: "Username with password"
   - ID: `pvm-credentials-id`
   - Username: `jsalazar@admin`
   - Password: `Tester.2025`

#### 2️⃣ Commit Jenkinsfile (1 minute)
```bash
git add Jenkinsfile
git commit -m "Add Jenkins pipeline"
git push
```

#### 3️⃣ Create Job
New Item → Pipeline → From SCM → Save

**Done! 🎉**

---

## ✅ Verification

### Test that it works:
```bash
# In CI/CD logs, you should see:
✓ Test PASSED: Registration completed successfully
✓ Insurance panel is NOT visible (as expected)
✓ Delete button is present and visible
✓ Patient deleted successfully

# You should NOT see:
✗ jsalazar@admin
✗ Tester.2025
```

---

## 🔒 Security Check

Can team members see credentials?
- [ ] In code? → ❌ No (only `process.env.PVM_USERNAME`)
- [ ] In .env file? → ❌ No (not in repository)
- [ ] In CI/CD logs? → ❌ No (masked as `***`)
- [ ] In CI/CD secrets? → ❌ No (only admins)
- [ ] Can they run tests? → ✅ Yes! (credentials injected)

**Perfect! All checks passed! 🎯**

---

## 📚 Need More Details?

- **Full guide:** See `CI-CD-SETUP.md`
- **Security explanation:** See `SECURITY-EXPLAINED.md`
- **Credentials setup:** See `CREDENTIALS.md`

---

## 🆘 Troubleshooting

**Pipeline fails with "PVM_USERNAME not set"**
→ Make sure you added all 3 secrets in Step 1

**Tests fail with login error**
→ Double-check secret values (no extra spaces)

**Team member can't trigger pipeline**
→ Give them "Write" or "Contributor" access (not full Admin)

---

## 🎊 Success Criteria

✅ Pipeline runs automatically on push
✅ Tests pass in CI/CD
✅ Videos uploaded as artifacts
✅ Team can run tests
✅ Team CANNOT see your credentials

**You're all set! Your credentials are secure! 🔐**
