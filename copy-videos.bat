@echo off
REM Script para copiar videos de test-results a la carpeta videos

echo Copiando videos desde test-results...

REM Copia todos los archivos de video webm a la carpeta videos
for /r "test-results" %%F in (*.webm) do (
    copy "%%F" "videos\" > nul
    echo Copiado: %%~nF
)

echo.
echo Proceso completado. Los videos están en la carpeta 'videos\'
