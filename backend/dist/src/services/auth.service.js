"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
const JWT_SECRET = process.env.JWT_SECRET || 'medilex_jwt_secret_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
class AuthService {
    /**
     * Log in a user and return user payload + JWT token.
     */
    static async login(username, password_plain) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('username', mssql_1.default.VarChar, username)
            .query('SELECT * FROM dbo.Users WHERE username = @username');
        const user = result.recordset[0];
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid username or password.');
        }
        const isMatch = await bcryptjs_1.default.compare(password_plain, user.password_hash);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError('Invalid username or password.');
        }
        const payload = {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Log this login event in RecentActivities
        await pool.request()
            .input('userId', mssql_1.default.Int, user.user_id)
            .input('action', mssql_1.default.VarChar, 'User Login')
            .input('description', mssql_1.default.VarChar, `User ${user.username} logged in successfully.`)
            .query('INSERT INTO dbo.RecentActivities (user_id, action, description) VALUES (@userId, @action, @description)');
        return {
            user: payload,
            token,
        };
    }
    /**
     * Fetch a user profile by ID.
     */
    static async getProfile(userId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('userId', mssql_1.default.Int, userId)
            .query('SELECT user_id, username, email, full_name, role, created_at FROM dbo.Users WHERE user_id = @userId');
        const user = result.recordset[0];
        if (!user) {
            throw new errors_1.NotFoundError('User profile not found.');
        }
        return {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            createdAt: user.created_at,
        };
    }
}
exports.AuthService = AuthService;
