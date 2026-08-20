import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  app_url: process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`,
  database_url: process.env.DATABASE_URL,
  db_host: process.env.DB_HOST || "localhost",
  db_port: process.env.DB_PORT || 3306,
  db_user: process.env.DB_USER || "root",
  db_password: process.env.DB_PASSWORD || "",
  db_name: process.env.DB_NAME || "medhelp_db",
  db_ssl: process.env.DB_SSL === "true",
  admin_email: process.env.ADMIN_EMAIL || "admin@medhelp.com",
  admin_password: process.env.ADMIN_PASSWORD || "Admin@123456",
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || "medhelp_secret_jwt_key_default",
  access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN || "7d",
  gemini_api_key: process.env.GEMINI_API_KEY || "",
  email_host: process.env.EMAIL_HOST || "smtp.gmail.com",
  email_port: Number(process.env.EMAIL_PORT) || 587,
  email_user: process.env.EMAIL_USER || "",
  email_pass: process.env.EMAIL_PASS || "",
  cors_origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://medhelp-2a762.web.app",
      ],
};
