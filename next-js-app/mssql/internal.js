import sql from "mssql";

const internalConfig = {
  user: process.env.INTERNAL_DB_USER, // DB username
  password: process.env.INTERNAL_DB_PASSWORD, // DB password
  server: process.env.INTERNAL_DB_SERVER, // DB server (e.g., localhost)
  database: process.env.INTERNAL_DB_NAME, // DB name
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Change to true if needed
  },
};

// Singleton pattern for database connection pool
let internalConnectionPool = null;

export async function openInternalDB() {
  if (!internalConnectionPool) {
    try {
      internalConnectionPool = await sql.connect(internalConfig);
    } catch (error) {
      console.error("Error opening database connection:", error);
      throw error;
    }
  } else if (!internalConnectionPool.connected) {
    try {
      await internalConnectionPool.connect();
    } catch (error) {
      console.error("Error opening database connection:", error);
      throw error;
    }
  }
  return internalConnectionPool;
}
