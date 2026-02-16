# Chat WebSocket Server (Backend Only)

**Servidor Socket.IO exclusivo para el sistema de chat de Cubicloud**

⚠️ **IMPORTANTE:** Este es un servidor **backend-only** sin interfaz gráfica. Solo maneja conexiones WebSocket.

## 🎯 Propósito

Este servidor proporciona comunicación en tiempo real via Socket.IO para el módulo de chat integrado en la aplicación Cubicloud (PHP/Zend Framework).

**La interfaz de usuario del chat está en:**
```
C:\laragon-6.0.0\www\cubicloud\module\Seguridad\view\seguridad\chat\index.phtml
```

## 🚀 Inicio Rápido

### Instalación

```bash
cd C:\wamp64\www\chat
npm install
```

### Desarrollo Local

```bash
# Opción 1: Node directo
node server.js

# Opción 2: npm
npm start

# Opción 3: PM2 (recomendado)
npm run pm2:start
```

### 🏭 Producción con PM2

#### Windows (Método Rápido)
```bash
# Doble clic en:
deploy.bat
# Luego selecciona opción 2 (Producción)
```

#### Manual
```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Iniciar en producción
npm run pm2:start:prod
# O directamente:
pm2 start ecosystem.config.js --env production

# 3. Guardar configuración para auto-inicio
pm2 save
pm2 startup

# 4. Ver estado
pm2 status

# 5. Ver logs
pm2 logs chat-server
```

#### Comandos PM2 Útiles
```bash
npm run pm2:status      # Ver estado
npm run pm2:logs        # Ver logs en vivo
npm run pm2:restart     # Reiniciar
npm run pm2:stop        # Detener
npm run pm2:monit       # Monitor en tiempo real
```

📖 **Guía completa de deployment:** Ver [DEPLOY.md](DEPLOY.md)

El servidor estará escuchando en: `http://localhost:7000`

### Verificar Estado

```bash
curl http://localhost:7000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "users": 0,
  "rooms": 0,
  "timestamp": "2026-02-13T..."
}
```

## 📁 Estructura del Proyecto

```
chat/
├── server.js           # Servidor Socket.IO (NO sirve archivos estáticos)
├── package.json        # Dependencias
├── ecosystem.config.js # Configuración PM2
└── public/             # (Sin uso - la vista está en Cubicloud)
```

## 🔌 Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado del servidor (usuarios, salas, timestamp) |

## 📡 Eventos Socket.IO

### Cliente → Servidor

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `user_join` | `{userId, name, role, room}` | Usuario se une al chat |
| `send_message` | `{userId, message, timestamp}` | Enviar mensaje |

### Servidor → Cliente

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `user_joined` | `{userId, name}` | Notifica nuevo usuario conectado |
| `receive_message` | `{userId, name, message, timestamp}` | Mensaje recibido |
| `user_left` | `{userId, name}` | Usuario desconectado |
| `user_count` | `{count}` | Actualización del conteo de usuarios |

## 🌐 Configuración CORS

El servidor acepta conexiones desde **cualquier origen**:

```javascript
cors: {
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────┐
│   Cubicloud PHP Application     │
│      (localhost/cubicloud)      │
│                                 │
│  ┌──────────────────────────┐   │
│  │  Chat UI (index.phtml)   │◄──┼── Usuario accede vía web
│  │  - Socket.IO Client      │   │
│  └────────────┬─────────────┘   │
└───────────────┼─────────────────┘
                │
                │ WebSocket Connection
                │ http://localhost:7000
                ▼
┌─────────────────────────────────┐
│   WebSocket Server (Node.js)    │
│    (C:\wamp64\www\chat)         │
│                                 │
│  ✅ Express                     │
│  ✅ Socket.IO                   │
│  ✅ Gestión de usuarios/salas   │
│  ✅ CORS habilitado             │
└─────────────────────────────────┘
```

## 🛠️ Mantenimiento

### Ver procesos en puerto 7000

```bash
netstat -ano | findstr :7000
```

### Detener servidor

```bash
# Encontrar PID del proceso
netstat -ano | findstr :7000

# Cerrar proceso (reemplaza <PID> con el número real)
taskkill /PID <PID> /F
```

### Reiniciar con código actualizado

```bash
# En la terminal donde corre el servidor, presiona Ctrl+C
# Luego ejecuta:
node server.js
```

### Opciones de Hosting:

- VPS (DigitalOcean, Vultr, Linode)
- Render.com (gratis)
- Railway.app
- Heroku

## 🔧 Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **Socket.IO** - WebSockets en tiempo real
- **PM2** - Process manager (producción)
