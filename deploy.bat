@echo off
echo ========================================
echo   CHAT SERVER - PM2 DEPLOYMENT
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo Descarga e instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Verificar si PM2 está instalado
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INSTALANDO] PM2...
    npm install -g pm2
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] No se pudo instalar PM2
        pause
        exit /b 1
    )
)

echo [OK] PM2 version:
pm2 --version
echo.

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [INSTALANDO] Dependencias...
    npm install --production
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo [OK] Dependencias instaladas
echo.

REM Crear carpeta de logs si no existe
if not exist "logs" (
    echo [CREANDO] Carpeta de logs...
    mkdir logs
)

echo.
echo ========================================
echo   OPCIONES DE DEPLOYMENT
echo ========================================
echo.
echo 1. Iniciar en modo DESARROLLO
echo 2. Iniciar en modo PRODUCCION
echo 3. Ver estado
echo 4. Ver logs
echo 5. Reiniciar servidor
echo 6. Detener servidor
echo 7. Salir
echo.
set /p option="Selecciona una opcion (1-7): "

if "%option%"=="1" (
    echo.
    echo [INICIANDO] Servidor en modo DESARROLLO...
    pm2 start ecosystem.config.js
    pm2 logs chat-server
)

if "%option%"=="2" (
    echo.
    echo [INICIANDO] Servidor en modo PRODUCCION...
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo.
    echo [INFO] Configuracion guardada. El servidor se reiniciara automaticamente.
    echo.
    pm2 status
    pause
)

if "%option%"=="3" (
    echo.
    pm2 status
    pause
)

if "%option%"=="4" (
    echo.
    echo [LOGS] Presiona Ctrl+C para salir de los logs
    timeout /t 2 >nul
    pm2 logs chat-server
)

if "%option%"=="5" (
    echo.
    echo [REINICIANDO] Servidor...
    pm2 restart chat-server
    pm2 status
    pause
)

if "%option%"=="6" (
    echo.
    echo [DETENIENDO] Servidor...
    pm2 stop chat-server
    pm2 status
    pause
)

if "%option%"=="7" (
    exit /b 0
)

echo.
pause
