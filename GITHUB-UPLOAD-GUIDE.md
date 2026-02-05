# Guía para Subir el Proyecto a GitHub

## ✅ Paso 1: Repositorio Git Inicializado

Ya completado:
- ✅ Repositorio Git inicializado
- ✅ Commit inicial creado
- ✅ 52 archivos listos para subir
- ✅ `.env` excluido (tus credenciales están seguras)

---

## 📝 Paso 2: Crear Repositorio en GitHub

### Opción A: Desde la Web (Recomendado)

1. **Ve a GitHub:**
   - Abre: https://github.com/julio-salazarqa

2. **Crear Nuevo Repositorio:**
   - Click en el botón verde "**New**" o el ícono "+" → "**New repository**"

3. **Configuración del Repositorio:**
   ```
   Repository name: pvm-automated-tests
   Description: Automated E2E tests for PVM with Playwright and Allure reporting

   ☐ Public (o ☑ Private si prefieres que sea privado)
   ☐ NO marques "Add a README file"
   ☐ NO marques "Add .gitignore"
   ☐ NO marques "Choose a license"
   ```

4. **Click "Create repository"**

### Opción B: Con GitHub CLI

Si tienes GitHub CLI instalado:
```bash
gh repo create pvm-automated-tests --public --source=. --remote=origin --push
```

---

## 🚀 Paso 3: Conectar y Subir al Repositorio

### A. Agregar el remote (conexión a GitHub)

```bash
git remote add origin https://github.com/julio-salazarqa/pvm-automated-tests.git
```

### B. Verificar el remote

```bash
git remote -v
```

Deberías ver:
```
origin  https://github.com/julio-salazarqa/pvm-automated-tests.git (fetch)
origin  https://github.com/julio-salazarqa/pvm-automated-tests.git (push)
```

### C. Subir el código a GitHub

```bash
git push -u origin master
```

O si tu rama principal es `main`:
```bash
git branch -M main
git push -u origin main
```

---

## 🔐 Autenticación en GitHub

Cuando hagas `git push`, GitHub te pedirá autenticación:

### Opción 1: Personal Access Token (Recomendado)

1. **Genera un Token:**
   - Ve a: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Nombre: `PVM Tests Upload`
   - Scopes: Marca ☑ `repo` (acceso completo al repositorio)
   - Click "Generate token"
   - **⚠️ COPIA EL TOKEN** (solo se muestra una vez)

2. **Usa el Token como Contraseña:**
   ```bash
   Username: julio-salazarqa
   Password: ghp_xxxxxxxxxxxxxxxxxxxx (tu token)
   ```

### Opción 2: GitHub CLI (Más Fácil)

```bash
gh auth login
```

Sigue las instrucciones en pantalla.

---

## 📊 Paso 4: Verificar que se Subió Correctamente

1. **Ve a tu repositorio:**
   ```
   https://github.com/julio-salazarqa/pvm-automated-tests
   ```

2. **Deberías ver:**
   - ✅ README.md con la información del proyecto
   - ✅ Carpeta `tests/` con tus tests
   - ✅ Carpeta `.github/workflows/` con CI/CD
   - ✅ Archivo `.env.example` (plantilla)
   - ❌ **NO** deberías ver `.env` (tus credenciales están seguras)

---

## 🎯 Paso 5: Configurar Allure Report en GitHub Pages (Opcional)

### A. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `gh-pages` (si existe) o `main`
5. Folder: `/docs` (si tienes) o `/(root)`
6. Click "Save"

### B. Generar y Subir Reporte Allure

```bash
# Generar reporte
npm test
npm run allure:report

# Crear rama gh-pages
git checkout -b gh-pages

# Copiar reporte
cp -r allure-report/* .

# Commit y push
git add .
git commit -m "Add Allure report"
git push origin gh-pages

# Volver a main
git checkout main
```

Tu reporte estará en:
```
https://julio-salazarqa.github.io/pvm-automated-tests/
```

---

## 🤖 Paso 6: Configurar CI/CD en GitHub

### A. Agregar Secrets

1. **Ve a tu repositorio en GitHub**
2. **Settings → Secrets and variables → Actions**
3. **Click "New repository secret"** (3 veces):

   **Secret 1:**
   ```
   Name: PVM_USERNAME
   Value: jsalazar@admin
   ```

   **Secret 2:**
   ```
   Name: PVM_PASSWORD
   Value: Tester.2025
   ```

   **Secret 3:**
   ```
   Name: PVM_URL
   Value: https://devpvpm.practicevelocity.com/
   ```

4. **Click "Add secret"** para cada uno

### B. Verificar GitHub Actions

1. Ve a la pestaña "**Actions**" en tu repositorio
2. Deberías ver el workflow "Playwright Tests"
3. Si hay un push, se ejecutará automáticamente
4. Click en el workflow para ver la ejecución

---

## 📋 Checklist Final

Antes de terminar, verifica:

- [ ] Repositorio creado en GitHub
- [ ] Código subido exitosamente (`git push`)
- [ ] README.md visible en la página principal
- [ ] `.env` NO aparece en el repositorio
- [ ] `.env.example` SÍ aparece en el repositorio
- [ ] GitHub Secrets configurados (PVM_USERNAME, PVM_PASSWORD, PVM_URL)
- [ ] GitHub Actions visible en la pestaña Actions
- [ ] Workflow ejecutándose (opcional, solo si hiciste push)

---

## 🎉 ¡Listo!

Tu proyecto está en GitHub:
```
https://github.com/julio-salazarqa/pvm-automated-tests
```

### Compartir con tu Equipo:

1. **Envía el link del repositorio**
2. **Instrucciones para ellos:**
   ```bash
   git clone https://github.com/julio-salazarqa/pvm-automated-tests.git
   cd pvm-automated-tests
   npm install
   cp .env.example .env
   # Editar .env con sus credenciales
   npm test
   ```

---

## 🔄 Comandos Útiles para Futuras Actualizaciones

### Hacer cambios y subirlos:
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Subir a GitHub
git push
```

### Bajar cambios del repositorio:
```bash
git pull
```

### Ver historial:
```bash
git log --oneline
```

---

## 🆘 Solución de Problemas

### "Permission denied" al hacer push
**Solución:** Usa un Personal Access Token en lugar de contraseña

### "Repository not found"
**Solución:** Verifica el remote:
```bash
git remote -v
git remote set-url origin https://github.com/julio-salazarqa/pvm-automated-tests.git
```

### "Failed to push some refs"
**Solución:** Primero haz pull:
```bash
git pull origin main --rebase
git push
```

### ".env file appears in repository"
**Solución:**
```bash
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

---

## 📚 Recursos Adicionales

- **GitHub Docs:** https://docs.github.com/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **GitHub CLI:** https://cli.github.com/

---

**¡Tu proyecto de testing profesional ahora está en GitHub! 🎊**
