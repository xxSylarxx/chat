#!/bin/bash

# Script de deployment para Linux/Mac

echo "========================================"
echo "  CHAT SERVER - PM2 DEPLOYMENT"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado"
    echo "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js version: $(node --version)"
echo ""

# Verificar/Instalar PM2
if ! command -v pm2 &> /dev/null; then
    echo "[INSTALANDO] PM2..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo "[ERROR] No se pudo instalar PM2"
        exit 1
    fi
fi

echo "[OK] PM2 version: $(pm2 --version)"
echo ""

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "[INSTALANDO] Dependencias..."
    npm install --production
    if [ $? -ne 0 ]; then
        echo "[ERROR] No se pudieron instalar las dependencias"
        exit 1
    fi
fi

echo "[OK] Dependencias instaladas"
echo ""

# Crear carpeta de logs
mkdir -p logs

echo ""
echo "========================================"
echo "  OPCIONES DE DEPLOYMENT"
echo "========================================"
echo ""
echo "1. Iniciar en modo DESARROLLO"
echo "2. Iniciar en modo PRODUCCIÓN"
echo "3. Ver estado"
echo "4. Ver logs"
echo "5. Reiniciar servidor"
echo "6. Detener servidor"
echo "7. Salir"
echo ""
read -p "Selecciona una opción (1-7): " option

case $option in
    1)
        echo ""
        echo "[INICIANDO] Servidor en modo DESARROLLO..."
        pm2 start ecosystem.config.js
        pm2 logs chat-server
        ;;
    2)
        echo ""
        echo "[INICIANDO] Servidor en modo PRODUCCIÓN..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        echo ""
        echo "[INFO] Configuración guardada. El servidor se reiniciará automáticamente."
        echo ""
        pm2 status
        ;;
    3)
        echo ""
        pm2 status
        ;;
    4)
        echo ""
        echo "[LOGS] Presiona Ctrl+C para salir"
        sleep 2
        pm2 logs chat-server
        ;;
    5)
        echo ""
        echo "[REINICIANDO] Servidor..."
        pm2 restart chat-server
        pm2 status
        ;;
    6)
        echo ""
        echo "[DETENIENDO] Servidor..."
        pm2 stop chat-server
        pm2 status
        ;;
    7)
        exit 0
        ;;
    *)
        echo "[ERROR] Opción inválida"
        exit 1
        ;;
esac
