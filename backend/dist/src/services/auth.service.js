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
    static async login(usernameOrEmail, password_plain) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('identifier', mssql_1.default.VarChar, usernameOrEmail)
            .query('SELECT * FROM dbo.Users WHERE username = @identifier OR email = @identifier');
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
    /**
     * Register a new user in the database.
     */
    static async register(username, password_plain, email, fullName, role) {
        const pool = (0, db_1.getPool)();
        // Check if user already exists
        const checkUser = await pool.request()
            .input('username', mssql_1.default.VarChar, username)
            .query('SELECT user_id FROM dbo.Users WHERE username = @username');
        if (checkUser.recordset[0]) {
            throw new Error('Username already taken.');
        }
        const passwordHash = await bcryptjs_1.default.hash(password_plain, 10);
        const result = await pool.request()
            .input('username', mssql_1.default.VarChar, username)
            .input('passwordHash', mssql_1.default.VarChar, passwordHash)
            .input('email', mssql_1.default.VarChar, email)
            .input('fullName', mssql_1.default.VarChar, fullName)
            .input('role', mssql_1.default.VarChar, role)
            .query(`
        INSERT INTO dbo.Users (username, password_hash, email, full_name, role)
        OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.role
        VALUES (@username, @passwordHash, @email, @fullName, @role)
      `);
        const newUser = result.recordset[0];
        // If the role is Doctor, also insert into dbo.Doctors!
        if (role === 'Doctor') {
            let doctorName = fullName;
            if (!doctorName.toLowerCase().startsWith('dr.')) {
                doctorName = 'Dr. ' + doctorName;
            }
            await pool.request()
                .input('userId', mssql_1.default.Int, newUser.user_id)
                .input('doctorName', mssql_1.default.VarChar, doctorName)
                .input('specialization', mssql_1.default.VarChar, 'General Medicine')
                .input('phone', mssql_1.default.VarChar, 'N/A')
                .input('email', mssql_1.default.VarChar, email)
                .input('consultationFee', mssql_1.default.Decimal(10, 2), 50.00)
                .input('availability', mssql_1.default.VarChar, 'Monday-Friday: 9:00 AM - 5:00 PM')
                .query(`
          INSERT INTO dbo.Doctors (doctor_name, specialization, phone, email, consultation_fee, availability, user_id)
          VALUES (@doctorName, @specialization, @phone, @email, @consultationFee, @availability, @userId)
        `);
        }
        // Log this registration event
        await pool.request()
            .input('userId', mssql_1.default.Int, newUser.user_id)
            .input('action', mssql_1.default.VarChar, 'User Registration')
            .input('description', mssql_1.default.VarChar, `New staff account created: ${newUser.username}`)
            .query('INSERT INTO dbo.RecentActivities (user_id, action, description) VALUES (@userId, @action, @description)');
        return {
            userId: newUser.user_id,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.full_name,
            role: newUser.role,
        };
    }
}
exports.AuthService = AuthService;
