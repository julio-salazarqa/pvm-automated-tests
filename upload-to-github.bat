@echo off
echo ========================================
echo   Subir Proyecto a GitHub
echo ========================================
echo.

echo PASO 1: Verificando estado de Git...
git status
echo.

echo PASO 2: Configurando remote de GitHub...
echo.
echo Por favor, ve a GitHub y crea un nuevo repositorio:
echo   https://github.com/new
echo.
echo Nombre del repositorio: pvm-automated-tests
echo Description: Automated E2E tests for PVM with Playwright and Allure reporting
echo Privacidad: Private (recomendado)
echo.
echo NO marques: README, .gitignore, o License
echo.
pause

echo.
echo Agregando remote...
git remote add origin https://github.com/julio-salazarqa/pvm-automated-tests.git
if %errorlevel% neq 0 (
    echo Remote ya existe, actualizando...
    git remote set-url origin https://github.com/julio-salazarqa/pvm-automated-tests.git
)

echo.
echo PASO 3: Verificando remote...
git remote -v
echo.

echo PASO 4: Renombrando rama a 'main'...
git branch -M main
echo.

echo PASO 5: Subiendo código a GitHub...
echo.
echo IMPORTANTE: GitHub te pedirá autenticación:
echo   Username: julio-salazarqa
echo   Password: [Usa tu Personal Access Token]
echo.
echo Si no tienes un token, generalo aquí:
echo   https://github.com/settings/tokens
echo   Scope requerido: repo (full control)
echo.
pause

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   EXITO! Proyecto subido a GitHub
    echo ========================================
    echo.
    echo Tu repositorio esta en:
    echo   https://github.com/julio-salazarqa/pvm-automated-tests
    echo.
    echo SIGUIENTE PASO: Configurar CI/CD Secrets
    echo   1. Ve a tu repositorio en GitHub
    echo   2. Settings - Secrets and variables - Actions
    echo   3. Agrega estos secrets:
    echo      - PVM_USERNAME: jsalazar@admin
    echo      - PVM_PASSWORD: Tester.2025
    echo      - PVM_URL: https://devpvpm.practicevelocity.com/
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir el código
    echo Verifica tu autenticación de GitHub
    echo.
)

pause
