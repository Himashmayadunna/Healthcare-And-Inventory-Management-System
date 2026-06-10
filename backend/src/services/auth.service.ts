import mssql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/db';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'medilex_jwt_secret_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
  /**
   * Log in a user and return user payload + JWT token.
   */
  static async login(username: string, password_plain: string) {
    const pool = getPool();
    const result = await pool.request()
      .input('username', mssql.VarChar, username)
      .query('SELECT * FROM dbo.Users WHERE username = @username');

    const user = result.recordset[0];
    if (!user) {
      throw new UnauthorizedError('Invalid username or password.');
    }

    const isMatch = await bcrypt.compare(password_plain, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid username or password.');
    }

    const payload: UserPayload = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Log this login event in RecentActivities
    await pool.request()
      .input('userId', mssql.Int, user.user_id)
      .input('action', mssql.VarChar, 'User Login')
      .input('description', mssql.VarChar, `User ${user.username} logged in successfully.`)
      .query('INSERT INTO dbo.RecentActivities (user_id, action, description) VALUES (@userId, @action, @description)');

    return {
      user: payload,
      token,
    };
  }

  /**
   * Fetch a user profile by ID.
   */
  static async getProfile(userId: number) {
    const pool = getPool();
    const result = await pool.request()
      .input('userId', mssql.Int, userId)
      .query('SELECT user_id, username, email, full_name, role, created_at FROM dbo.Users WHERE user_id = @userId');

    const user = result.recordset[0];
    if (!user) {
      throw new NotFoundError('User profile not found.');
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
