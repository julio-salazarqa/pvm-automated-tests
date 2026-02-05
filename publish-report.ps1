# Script to publish Allure report to GitHub Pages

Write-Host "Running tests and generating Allure report..." -ForegroundColor Cyan

# Set Java environment
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

# Run tests
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed! Report will not be published." -ForegroundColor Red
    exit 1
}

# Generate Allure report
Write-Host "`nGenerating Allure report..." -ForegroundColor Cyan
npx allure generate allure-results --clean -o allure-report

# Save current branch
$currentBranch = git branch --show-current

# Switch to gh-pages
Write-Host "`nPublishing to GitHub Pages..." -ForegroundColor Cyan
git checkout gh-pages
git rm -rf .
Copy-Item -Path "allure-report\*" -Destination "." -Recurse
Remove-Item -Path "allure-report" -Recurse -Force
git add .
git commit -m "Update Allure report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin gh-pages

# Switch back to original branch
git checkout $currentBranch

Write-Host "`n✓ Report published successfully!" -ForegroundColor Green
Write-Host "View at: https://julio-salazarqa.github.io/pvm-automated-tests/" -ForegroundColor Yellow
