/**
 * ═══════════════════════════════════════════════════════════════
 * CHECKLIST DE CAMBIOS PARA PRODUCCIÓN
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  IMPORTANTE: Revisa y cambia estos valores antes de deployment
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📄 ARCHIVO: ecosystem.config.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  Línea ~23 en env_production:

  CAMBIAR:
    PUBLIC_IP: 'TU-IP-PRODUCCION'
  
  POR:
    PUBLIC_IP: '192.168.1.100'  // Tu IP real del servidor
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📄 ARCHIVO: server.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  Línea ~8 en la configuración de Socket.IO:

  CAMBIAR:
    cors: {
      origin: "*",  // ← PELIGROSO EN PRODUCCIÓN
    }
  
  POR:
    cors: {
      origin: [
        "http://tu-dominio.com",
        "https://tu-dominio.com",
        "http://150.239.0.18"  // Tu IP si no tienes dominio
      ],
    }
*/

/*
  Línea ~38 en middleware CORS:

  CAMBIAR:
    res.header("Access-Control-Allow-Origin", "*");
  
  POR:
    const allowedOrigins = [
      "http://tu-dominio.com",
      "https://tu-dominio.com",
      "http://150.239.0.18"
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
*/

/*
  Línea ~231 (opcional - para logs):

  CAMBIAR:
    console.log(`  - Red:      http://150.239.0.18:${PORT}`);
  
  POR:
    const IP = process.env.PUBLIC_IP || "150.239.0.18";
    console.log(`  - Red:      http://${IP}:${PORT}`);
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📄 ARCHIVO: ChatController.php (PHP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  En tu archivo de configuración PHP:
  config/autoload/local.php o config/autoload/global.php

  AGREGAR:
    <?php
    // Configuración del servidor Socket.IO
    define('SOCKET_URL', 'http://150.239.0.18:7000');
    
    // O si usas HTTPS:
    // define('SOCKET_URL', 'https://tu-dominio.com:7000');
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 FIREWALL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  Windows PowerShell (como Administrador):
    netsh advfirewall firewall add rule name="Chat Socket.IO" dir=in action=allow protocol=TCP localport=7000
  
  Linux (Ubuntu/Debian):
    sudo ufw allow 7000/tcp
  
  Linux (con iptables):
    sudo iptables -A INPUT -p tcp --dport 7000 -j ACCEPT
    sudo iptables-save
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VERIFICACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  1. Probar health endpoint:
     http://TU-IP:7000/health
  
  2. Debe responder:
     {"status":"ok","users":0,"rooms":0,"timestamp":"2026-02-13..."}
  
  3. Probar desde navegador en la app PHP:
     http://TU-DOMINIO/seguridad/chat
  
  4. Revisar logs de PM2:
     pm2 logs chat-server
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 OPCIONES AVANZADAS (Opcional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  HTTPS (SSL/TLS):
  
  Si tienes certificados SSL, modifica server.js:
  
    const https = require('https');
    const fs = require('fs');
    
    const server = https.createServer({
      key: fs.readFileSync('/path/to/privkey.pem'),
      cert: fs.readFileSync('/path/to/fullchain.pem')
    }, app);
    
  Luego en PHP:
    define('SOCKET_URL', 'https://tu-dominio.com:7000');
*/

/*
  CLUSTERING (Múltiples instancias):
  
  En ecosystem.config.js cambiar:
    instances: 1,           → instances: 'max',
    exec_mode: 'fork',      → exec_mode: 'cluster',
  
  Esto usará todos los cores del CPU.
  ⚠️ Requiere configuración adicional con Redis para sincronizar sesiones.
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * 🚀 DEPLOYMENT COMMANDS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Copiar archivos al servidor
 * 2. cd /ruta/a/chat
 * 3. npm install --production
 * 4. npm install -g pm2
 * 5. pm2 start ecosystem.config.js --env production
 * 6. pm2 save
 * 7. pm2 startup
 *
 * ✅ Ver estado: pm2 status
 * 📊 Ver logs: pm2 logs chat-server
 * 🔄 Reiniciar: pm2 restart chat-server
 *
 * ═══════════════════════════════════════════════════════════════
 */
