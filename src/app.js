import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import { swaggerServe, swaggerSetup } from "./config/swagger.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import trainerRoutes from "./routes/trainer.routes.js";
import courseRoutes from "./routes/course.routes.js";
import helpRoutes from "./routes/help.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const app = express();

// Security Headers (Configured to allow Swagger UI inline assets)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        config.cors_origin.includes(origin) ||
        config.env === "development"
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true,
  })
);

// Global Rate Limiting (200 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use(generalLimiter);

// Parse JSON Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "MedHelp Emergency First-Responder API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Interactive Swagger/OpenAPI Documentation
app.use("/api/docs", swaggerServe, swaggerSetup);

// Application API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/help", helpRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/certificates", certificateRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(globalErrorHandler);

export default app;
