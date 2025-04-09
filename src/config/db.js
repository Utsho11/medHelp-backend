import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Create a MySQL connection pool
const pool = mysql.createPool(
  "mysql://root:OsTnovuTOmfLyhFqjeRnXhZODsoBSogw@trolley.proxy.rlwy.net:44557/railway"
  // {
  // host: process.env.DB_HOST || "localhost",
  // user: process.env.DB_USER || "root",
  // password: process.env.DB_PASSWORD || "",
  // database: process.env.DB_NAME || "railway",
  // port: process.env.DB_PORT || 3306,
  // connectionLimit: 10,

  // }
);

// Check database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release();
  }
});

export default pool.promise(); // Use promise-based queries
