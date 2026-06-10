"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class DoctorService {
    /**
     * Get all doctor records.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query('SELECT * FROM dbo.Doctors ORDER BY doctor_name ASC');
        return result.recordset;
    }
    /**
     * Get a doctor record by ID.
     */
    static async getById(doctorId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('doctorId', mssql_1.default.Int, doctorId)
            .query('SELECT * FROM dbo.Doctors WHERE doctor_id = @doctorId');
        const doctor = result.recordset[0];
        if (!doctor) {
            throw new errors_1.NotFoundError(`Doctor with ID ${doctorId} not found.`);
        }
        return doctor;
    }
    /**
     * Create a new doctor record.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('doctorName', mssql_1.default.VarChar, input.doctor_name)
            .input('specialization', mssql_1.default.VarChar, input.specialization)
            .input('phone', mssql_1.default.VarChar, input.phone)
            .input('email', mssql_1.default.VarChar, input.email)
            .input('consultationFee', mssql_1.default.Decimal(10, 2), input.consultation_fee)
            .input('availability', mssql_1.default.VarChar, input.availability)
            .input('userId', mssql_1.default.Int, input.user_id || null)
            .query(`
        INSERT INTO dbo.Doctors (doctor_name, specialization, phone, email, consultation_fee, availability, user_id)
        OUTPUT INSERTED.*
        VALUES (@doctorName, @specialization, @phone, @email, @consultationFee, @availability, @userId)
      `);
        return result.recordset[0];
    }
    /**
     * Update an existing doctor record.
     */
    static async update(doctorId, input) {
        const pool = (0, db_1.getPool)();
        // Check if doctor exists first
        await this.getById(doctorId);
        const result = await pool.request()
            .input('doctorId', mssql_1.default.Int, doctorId)
            .input('doctorName', mssql_1.default.VarChar, input.doctor_name)
            .input('specialization', mssql_1.default.VarChar, input.specialization)
            .input('phone', mssql_1.default.VarChar, input.phone)
            .input('email', mssql_1.default.VarChar, input.email)
            .input('consultationFee', mssql_1.default.Decimal(10, 2), input.consultation_fee)
            .input('availability', mssql_1.default.VarChar, input.availability)
            .input('userId', mssql_1.default.Int, input.user_id || null)
            .query(`
        UPDATE dbo.Doctors
        SET doctor_name = @doctorName,
            specialization = @specialization,
            phone = @phone,
            email = @email,
            consultation_fee = @consultationFee,
            availability = @availability,
            user_id = @userId,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE doctor_id = @doctorId
      `);
        return result.recordset[0];
    }
    /**
     * Delete a doctor record.
     */
    static async delete(doctorId) {
        const pool = (0, db_1.getPool)();
        // Check if doctor exists first
        await this.getById(doctorId);
        await pool.request()
            .input('doctorId', mssql_1.default.Int, doctorId)
            .query('DELETE FROM dbo.Doctors WHERE doctor_id = @doctorId');
        return true;
    }
}
exports.DoctorService = DoctorService;
