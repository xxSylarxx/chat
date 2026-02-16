const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configurar CORS según el entorno
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://150.239.0.27", "https://150.239.0.27"]
  : "*";

console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
console.log(`🔒 CORS Origins permitidos: ${JSON.stringify(allowedOrigins)}`);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: false,
  },
  allowEIO3: true,
  transports: ["polling", "websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Almacenar usuarios conectados
const users = new Map();
const rooms = new Map();

// Middleware para LOGGING de todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("  Headers:", {
    origin: req.headers.origin,
    referer: req.headers.referer,
    "user-agent": req.headers["user-agent"]?.substring(0, 50),
  });
  next();
});

// Middleware para CORS en Express (MUY IMPORTANTE)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // En producción, verificar origen permitido
  if (isProduction && Array.isArray(allowedOrigins)) {
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
  } else {
    // En desarrollo, permitir todo
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "false");

  // Permitir preflight requests
  if (req.method === "OPTIONS") {
    console.log("  ✅ Respondiendo a OPTIONS (preflight)");
    return res.status(200).end();
  }

  next();
});

// Endpoint de salud
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    users: users.size,
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Registro de usuario con datos
  socket.on("user_join", (userData) => {
    const user = {
      id: socket.id,
      userId: userData.userId || socket.id,
      name: userData.name || "Usuario",
      role: userData.role || "user",
      room: userData.room || "general",
      connectedAt: new Date().toISOString(),
    };

    users.set(socket.id, user);
    socket.join(user.room);

    // Actualizar lista de salas
    if (!rooms.has(user.room)) {
      rooms.set(user.room, new Set());
    }
    rooms.get(user.room).add(socket.id);

    console.log(`${user.name} se unió a la sala: ${user.room}`);

    // Notificar a todos en la sala
    io.to(user.room).emit("user_connected", {
      userId: user.userId,
      name: user.name,
      message: `${user.name} se ha conectado`,
      timestamp: new Date().toISOString(),
    });

    // Enviar lista actualizada de usuarios en la sala
    const roomUsers = Array.from(rooms.get(user.room) || [])
      .map((id) => users.get(id))
      .filter((u) => u);

    io.to(user.room).emit("user_list", {
      count: roomUsers.length,
      users: roomUsers,
    });
  });

  // Recibir mensaje de chat
  socket.on("chat_message", (data) => {
    const user = users.get(socket.id);

    if (!user) {
      console.log("Usuario no registrado intentando enviar mensaje");
      return;
    }

    const message = {
      id: Date.now() + Math.random(),
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      message: typeof data === "string" ? data : data.message,
      room: user.room,
      timestamp: new Date().toISOString(),
      type: "user",
    };

    console.log(`Mensaje de ${user.name} en ${user.room}:`, message.message);

    // Enviar a todos en la sala
    io.to(user.room).emit("chat_message", message);
  });

  // Usuario escribiendo...
  socket.on("typing", (isTyping) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.room).emit("user_typing", {
        userId: user.userId,
        name: user.name,
        isTyping,
      });
    }
  });

  // Cambiar de sala
  socket.on("change_room", (newRoom) => {
    const user = users.get(socket.id);
    if (user) {
      const oldRoom = user.room;

      // Salir de la sala anterior
      socket.leave(oldRoom);
      if (rooms.has(oldRoom)) {
        rooms.get(oldRoom).delete(socket.id);
      }

      // Unirse a nueva sala
      user.room = newRoom;
      socket.join(newRoom);

      if (!rooms.has(newRoom)) {
        rooms.set(newRoom, new Set());
      }
      rooms.get(newRoom).add(socket.id);

      // Notificar cambio
      socket.to(oldRoom).emit("user_left", {
        name: user.name,
        message: `${user.name} salió de la sala`,
      });

      io.to(newRoom).emit("user_connected", {
        name: user.name,
        message: `${user.name} se unió a la sala`,
      });

      // Actualizar listas
      updateRoomUserList(oldRoom);
      updateRoomUserList(newRoom);
    }
  });

  // Desconexión
  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (user) {
      console.log(`Usuario desconectado: ${user.name}`);

      // Remover de la sala
      if (rooms.has(user.room)) {
        rooms.get(user.room).delete(socket.id);
      }

      // Notificar a la sala
      io.to(user.room).emit("user_disconnected", {
        userId: user.userId,
        name: user.name,
        message: `${user.name} se ha desconectado`,
        timestamp: new Date().toISOString(),
      });

      // Actualizar lista de usuarios
      updateRoomUserList(user.room);

      // Remover usuario
      users.delete(socket.id);
    } else {
      console.log("Usuario desconectado:", socket.id);
    }
  });
});

// Función helper para actualizar lista de usuarios de una sala
function updateRoomUserList(roomName) {
  const roomUsers = Array.from(rooms.get(roomName) || [])
    .map((id) => users.get(id))
    .filter((u) => u);

  io.to(roomName).emit("user_list", {
    count: roomUsers.length,
    users: roomUsers,
  });
}


const PORT = process.env.PORT || 7000;
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_IP = process.env.PUBLIC_IP || "localhost";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en:`);
  console.log(`  - Local:    http://localhost:${PORT}`);
  console.log(`  - Red:      http://${PUBLIC_IP}:${PORT}`);
  console.log(`  - Health:   http://${PUBLIC_IP}:${PORT}/health`);
  console.log(`\n📊 Monitoreo:`);
  console.log(`  - PM2:      pm2 status`);
  console.log(`  - Logs:     pm2 logs chat-server`);
});


