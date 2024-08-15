import sql from "mssql";

// Database configuration
const externalConfig = {
  user: process.env.DB_USER, // DB username
  password: process.env.DB_PASSWORD, // DB password
  server: process.env.DB_SERVER, // DB server (e.g., localhost)
  database: process.env.DB_NAME, // DB name
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Change to true if needed
  },
};

// Singleton pattern for database connection pool
let externalConnectionPool = null;

export async function openExternalDB() {
  if (!externalConnectionPool) {
    try {
      externalConnectionPool = await sql.connect(externalConfig);
    } catch (error) {
      console.error("Error opening database connection:", error);
      throw error;
    }
  } else if (!externalConnectionPool.connected) {
    try {
      await externalConnectionPool.connect();
    } catch (error) {
      console.error("Error opening database connection:", error);
      throw error;
    }
  }
  return externalConnectionPool;
}
