# Script to generate Allure report locally

Write-Host "Generating Allure report..." -ForegroundColor Cyan

# Set Java environment
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

# Generate report
npx allure generate allure-results --clean -o allure-report

Write-Host "`n✓ Report generated successfully!" -ForegroundColor Green
Write-Host "To view locally, run: npm run allure:open" -ForegroundColor Yellow
