# Script to run tests, generate Allure report, and publish to GitHub Pages

Write-Host "Running tests..." -ForegroundColor Cyan

# Run tests
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Tests failed! Report will not be published." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ All tests passed!" -ForegroundColor Green

# Set Java environment
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

# Generate Allure report
Write-Host ""
Write-Host "Generating Allure report..." -ForegroundColor Cyan
npx allure generate allure-results --clean -o allure-report

# Save current branch
$currentBranch = git branch --show-current

# Copy report to temp location
Write-Host ""
Write-Host "Publishing to GitHub Pages..." -ForegroundColor Cyan
$tempDir = "$env:TEMP\allure-report-temp"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
Copy-Item -Path "allure-report" -Destination $tempDir -Recurse

# Switch to gh-pages
git checkout gh-pages
git rm -rf .
Copy-Item -Path "$tempDir\*" -Destination "." -Recurse
Remove-Item -Path $tempDir -Recurse -Force

# Commit and push
git add .
git commit -m "Update Allure report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin gh-pages

# Switch back to original branch
git checkout $currentBranch

Write-Host ""
Write-Host "✓ Report published successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "View at: https://julio-salazarqa.github.io/pvm-automated-tests/" -ForegroundColor Yellow
Write-Host "Note: GitHub Pages may take 1-2 minutes to update" -ForegroundColor Gray
