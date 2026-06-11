import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const rawServer = process.env.DB_SERVER || "localhost";
const [serverHost] = rawServer.split(/\\+/); // extract host and ignore instance name to connect directly via port

const dbConfig: mssql.config = {
  server: serverHost,
  port: parseInt(process.env.DB_PORT || "1433", 10),
  database: process.env.DB_DATABASE || "MediLexDB",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: mssql.ConnectionPool | null = null;

/**
 * Connect to Microsoft SQL Server and return the connection pool.
 */
export const connectDB = async (): Promise<mssql.ConnectionPool> => {
  try {
    if (pool) {
      return pool;
    }
    pool = await mssql.connect(dbConfig);
    console.log('Successfully connected to Microsoft SQL Server database.');
    return pool;
  } catch (error) {
    console.error('Database connection failed: ', error);
    throw error;
  }
};

/**
 * Get the active connection pool instance.
 */
export const getPool = (): mssql.ConnectionPool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  return pool;
};
