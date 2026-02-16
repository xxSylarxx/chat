# 🚀 Guía de Despliegue con PM2

## 📋 Requisitos Previos

- Node.js instalado en el servidor
- PM2 instalado globalmente: `npm install -g pm2`

## 🔧 Instalación en Servidor

### 1. Copiar archivos al servidor
```bash
# Subir la carpeta chat completa al servidor
# Ejemplo: /var/www/chat o C:\inetpub\chat
```

### 2. Instalar dependencias
```bash
cd /ruta/a/chat
npm install --production
```

### 3. Crear carpeta de logs
```bash
mkdir logs
```

## 🎯 Comandos PM2

### DESARROLLO (con variables de desarrollo)
```bash
npm run pm2:start
# O directamente:
pm2 start ecosystem.config.js
```

### PRODUCCIÓN (con variables de producción)
```bash
npm run pm2:start:prod
# O directamente:
pm2 start ecosystem.config.js --env production
```

### GESTIÓN DEL SERVIDOR

```bash
# Ver estado
npm run pm2:status
# O: pm2 status

# Ver logs en tiempo real
npm run pm2:logs
# O: pm2 logs chat-server

# Monitor en vivo
npm run pm2:monit
# O: pm2 monit

# Reiniciar
npm run pm2:restart
# O: pm2 restart chat-server

# Detener
npm run pm2:stop
# O: pm2 stop chat-server

# Eliminar del PM2
npm run pm2:delete
# O: pm2 delete chat-server
```

### CONFIGURAR INICIO AUTOMÁTICO

```bash
# Guardar configuración actual
pm2 save

# Configurar para iniciar al arrancar el sistema
pm2 startup
# Sigue las instrucciones que te muestre

# En Windows, puede requerir instalar pm2-windows-startup:
npm install -g pm2-windows-startup
pm2-startup install
```

## ⚙️ Configuración de Producción

### 1. **Editar ecosystem.config.js**

En la sección `env_production`, agrega tu IP o dominio:

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 7000,
  HOST: '0.0.0.0',
  PUBLIC_IP: '150.239.0.18' // ← Cambiar por tu IP real
}
```

### 2. **Configurar SOCKET_URL en PHP**

En tu archivo de configuración PHP (ej: `config/autoload/local.php`):

```php
// Para producción
define('SOCKET_URL', 'http://150.239.0.18:7000');

// O si usas HTTPS
define('SOCKET_URL', 'https://tu-dominio.com:7000');
```

### 3. **Abrir puerto 7000 en Firewall**

**Windows:**
```powershell
netsh advfirewall firewall add rule name="Chat Socket.IO" dir=in action=allow protocol=TCP localport=7000
```

**Linux:**
```bash
sudo ufw allow 7000/tcp
# O con iptables:
sudo iptables -A INPUT -p tcp --dport 7000 -j ACCEPT
```

### 4. **Configurar CORS en server.js (IMPORTANTE)**

Cambiar en `server.js` línea ~8:

```javascript
// ANTES (desarrollo):
origin: "*",

// DESPUÉS (producción - reemplazar con tu dominio):
origin: ["http://tu-dominio.com", "https://tu-dominio.com"],
```

## ✅ Verificar que Funciona

```bash
# Desde el servidor mismo
curl http://localhost:7000/health

# Desde cualquier navegador
http://TU-IP:7000/health
```

Deberías ver:
```json
{"status":"ok","users":0,"rooms":0,"timestamp":"..."}
```

## 📊 Monitoreo

```bash
# Ver uso de recursos
pm2 monit

# Ver logs solo errores
pm2 logs chat-server --err

# Ver logs solo output
pm2 logs chat-server --out

# Ver últimas 100 líneas
pm2 logs chat-server --lines 100

# Limpiar logs antiguos
pm2 flush
```

## 🔄 Actualizar en Producción

```bash
# 1. Detener el servidor
pm2 stop chat-server

# 2. Hacer pull de cambios o copiar archivos nuevos
git pull  # O copiar archivos manualmente

# 3. Reinstalar dependencias si cambiaron
npm install --production

# 4. Reiniciar
pm2 restart chat-server

# O hacer todo en un paso (reload sin downtime):
pm2 reload chat-server
```

## 🆘 Solución de Problemas

### El servidor no inicia:
```bash
# Ver logs de error
pm2 logs chat-server --err

# Ver información detallada
pm2 show chat-server

# Reiniciar completamente
pm2 delete chat-server
pm2 start ecosystem.config.js --env production
```

### Puerto 7000 ocupado:
```bash
# Ver qué está usando el puerto
# Windows:
netstat -ano | findstr :7000

# Linux:
lsof -i :7000

# Matar el proceso si es necesario
# Windows: taskkill /PID XXXX /F
# Linux: kill -9 XXXX
```

### No se conectan los clientes:
1. Verifica que el firewall permita el puerto 7000
2. Revisa los logs con `pm2 logs chat-server`
3. Prueba desde el servidor: `curl http://localhost:7000/health`
4. Verifica CORS en server.js (origin debe incluir tu dominio)

## 📝 Logs

Los logs se guardan en la carpeta `logs/`:
- `error.log` - Solo errores
- `output.log` - Output normal
- `combined.log` - Todo junto

```bash
# Ver logs directamente
tail -f logs/error.log
tail -f logs/output.log
```

## 🔒 Seguridad para Producción

- [ ] Cambiar `origin: "*"` por tu dominio real
- [ ] Configurar firewall correctamente
- [ ] Usar HTTPS si es posible
- [ ] Limitar rate limiting en producción
- [ ] Revisar logs regularmente
- [ ] Configurar backup de logs

---

**¿Necesitas ayuda?** Revisa los logs con `pm2 logs chat-server`
