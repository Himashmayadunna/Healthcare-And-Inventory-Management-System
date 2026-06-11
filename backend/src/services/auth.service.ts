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
  static async login(usernameOrEmail: string, password_plain: string) {
    const pool = getPool();
    const result = await pool.request()
      .input('identifier', mssql.VarChar, usernameOrEmail)
      .query('SELECT * FROM dbo.Users WHERE username = @identifier OR email = @identifier');

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

  /**
   * Register a new user in the database.
   */
  static async register(username: string, password_plain: string, email: string, fullName: string, role: string) {
    const pool = getPool();
    
    // Check if user already exists
    const checkUser = await pool.request()
      .input('username', mssql.VarChar, username)
      .query('SELECT user_id FROM dbo.Users WHERE username = @username');
      
    if (checkUser.recordset[0]) {
      throw new Error('Username already taken.');
    }
    
    const passwordHash = await bcrypt.hash(password_plain, 10);
    
    const result = await pool.request()
      .input('username', mssql.VarChar, username)
      .input('passwordHash', mssql.VarChar, passwordHash)
      .input('email', mssql.VarChar, email)
      .input('fullName', mssql.VarChar, fullName)
      .input('role', mssql.VarChar, role)
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
        .input('userId', mssql.Int, newUser.user_id)
        .input('doctorName', mssql.VarChar, doctorName)
        .input('specialization', mssql.VarChar, 'General Medicine')
        .input('phone', mssql.VarChar, 'N/A')
        .input('email', mssql.VarChar, email)
        .input('consultationFee', mssql.Decimal(10, 2), 50.00)
        .input('availability', mssql.VarChar, 'Monday-Friday: 9:00 AM - 5:00 PM')
        .query(`
          INSERT INTO dbo.Doctors (doctor_name, specialization, phone, email, consultation_fee, availability, user_id)
          VALUES (@doctorName, @specialization, @phone, @email, @consultationFee, @availability, @userId)
        `);
    }

    // Log this registration event
    await pool.request()
      .input('userId', mssql.Int, newUser.user_id)
      .input('action', mssql.VarChar, 'User Registration')
      .input('description', mssql.VarChar, `New staff account created: ${newUser.username}`)
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

