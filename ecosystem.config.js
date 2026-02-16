module.exports = {
  apps: [
    {
      name: "chat-server",
      script: "./server.js",

      // Instancias (1 = una sola instancia, 'max' = usar todos los cores CPU)
      instances: 1,
      exec_mode: "fork", // 'cluster' para múltiples instancias

      // Reinicio automático
      autorestart: true,
      watch: false, // Cambiar a true en desarrollo para auto-reload
      max_memory_restart: "500M",

      // Variables de entorno DESARROLLO
      env: {
        NODE_ENV: "development",
        PORT: 7000,
        HOST: "0.0.0.0",
      },

      // Variables de entorno PRODUCCIÓN
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        HOST: "0.0.0.0",
        ALLOWED_ORIGINS: "http://jeanpiaget.cubicol.pe,https://jeanpiaget.cubicol.pe",
        PUBLIC_IP: "jeanpiaget.cubicol.pe"  // Cambiar a dominio
      },

      // Logs
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      log_file: "./logs/combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Reintentos y delays
      restart_delay: 4000,
      min_uptime: "10s",
      max_restarts: 10,

      // Otros
      kill_timeout: 5000,
      listen_timeout: 3000,
    },
  ],
};
