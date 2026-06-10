"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = exports.connectDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'MediLexDB',
    port: parseInt(process.env.DB_PORT || '1433', 10),
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
let pool = null;
/**
 * Connect to Microsoft SQL Server and return the connection pool.
 */
const connectDB = async () => {
    try {
        if (pool) {
            return pool;
        }
        pool = await mssql_1.default.connect(dbConfig);
        console.log('Successfully connected to Microsoft SQL Server database.');
        return pool;
    }
    catch (error) {
        console.error('Database connection failed: ', error);
        throw error;
    }
};
exports.connectDB = connectDB;
/**
 * Get the active connection pool instance.
 */
const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectDB first.');
    }
    return pool;
};
exports.getPool = getPool;
