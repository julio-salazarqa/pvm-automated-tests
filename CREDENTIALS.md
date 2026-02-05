# Configuración de Credenciales

## Seguridad de Credenciales

Las credenciales **NO** están hardcodeadas en el código del test. Se almacenan de forma segura en un archivo `.env` que está excluido del control de versiones.

## Configuración Inicial

1. **Copiar el archivo de plantilla:**
   ```bash
   copy .env.example .env
   ```

2. **Editar el archivo `.env` con tus credenciales:**
   ```
   PVM_USERNAME=tu-usuario-aqui
   PVM_PASSWORD=tu-password-aqui
   PVM_URL=https://devpvpm.practicevelocity.com/
   ```

3. **Guardar el archivo**

## Archivo .gitignore

El archivo `.env` está incluido en `.gitignore` para evitar que se suba al repositorio:

```
# Environment variables (contains sensitive credentials)
.env
```

## Estructura de Archivos

```
Test/
├── .env                    # TUS credenciales (NO se sube a git)
├── .env.example           # Plantilla sin credenciales reales
├── .gitignore             # Excluye .env del repositorio
├── tests/
│   └── enterprise-patient-registration.spec.js
└── playwright.config.js   # Carga las variables de entorno
```

## Cómo Funciona

1. El archivo `playwright.config.js` carga las variables de entorno usando `dotenv`
2. El test lee las credenciales de `process.env.PVM_USERNAME` y `process.env.PVM_PASSWORD`
3. Si las credenciales no están configuradas, el test falla con un error descriptivo

## Validación

El test valida automáticamente que las credenciales estén configuradas:

```javascript
if (!username || !password) {
  throw new Error('PVM_USERNAME and PVM_PASSWORD must be set in .env file');
}
```

## Seguridad

✅ Las credenciales están en un archivo local (`.env`)
✅ El archivo `.env` está en `.gitignore`
✅ Solo el archivo `.env.example` (sin credenciales) se sube al repositorio
✅ Cada desarrollador tiene su propio archivo `.env` con sus credenciales
✅ Las credenciales nunca aparecen en el código fuente

## Compartir con el Equipo

Si necesitas compartir el proyecto:
1. Comparte el código (sin el archivo `.env`)
2. Instruye a los usuarios que copien `.env.example` a `.env`
3. Cada usuario configura sus propias credenciales en su archivo `.env` local
