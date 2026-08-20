import mysql from "mysql2";
import config from "./index.js";

// Create MySQL connection pool configuration
const poolConfig = config.database_url
  ? config.database_url
  : {
      host: config.db_host,
      user: config.db_user,
      password: config.db_password,
      database: config.db_name,
      port: Number(config.db_port),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: config.db_ssl ? { rejectUnauthorized: true } : undefined,
    };

const pool = mysql.createPool(poolConfig);

// Verify database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database successfully");
    connection.release();
  }
});

export default pool.promise();
