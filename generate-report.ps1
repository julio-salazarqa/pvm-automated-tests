$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
Set-Location "C:\Users\julio.salazar\Test"
npx allure generate allure-results --clean -o allure-report
