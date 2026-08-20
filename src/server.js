import http from "http";
import app from "./app.js";
import config from "./config/index.js";
import { initializeDB } from "./config/initializeDB.js";
import { initializeSocket } from "./socket/socket.js";

const startServer = async () => {
  try {
    // Initialize DB and seed admin
    await initializeDB();

    // Create HTTP Server
    const httpServer = http.createServer(app);

    // Initialize Socket.io Real-Time Dispatch Engine
    initializeSocket(httpServer);

    httpServer.listen(config.port, () => {
      console.log(`🚀 MedHelp Server & Socket.IO running on port ${config.port} [${config.env}]`);
      console.log(`📖 API Documentation available at: http://localhost:${config.port}/api/docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
