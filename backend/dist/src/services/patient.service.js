"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class PatientService {
    /**
     * Get all patient records.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query('SELECT * FROM dbo.Patients ORDER BY full_name ASC');
        return result.recordset;
    }
    /**
     * Get a patient record by ID.
     */
    static async getById(patientId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('patientId', mssql_1.default.Int, patientId)
            .query('SELECT * FROM dbo.Patients WHERE patient_id = @patientId');
        const patient = result.recordset[0];
        if (!patient) {
            throw new errors_1.NotFoundError(`Patient with ID ${patientId} not found.`);
        }
        return patient;
    }
    /**
     * Create a new patient record.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('fullName', mssql_1.default.VarChar, input.full_name)
            .input('gender', mssql_1.default.VarChar, input.gender)
            .input('dob', mssql_1.default.Date, input.dob)
            .input('bloodGroup', mssql_1.default.VarChar, input.blood_group || null)
            .input('phone', mssql_1.default.VarChar, input.phone)
            .input('email', mssql_1.default.VarChar, input.email || null)
            .input('address', mssql_1.default.VarChar, input.address || null)
            .query(`
        INSERT INTO dbo.Patients (full_name, gender, dob, blood_group, phone, email, address)
        OUTPUT INSERTED.*
        VALUES (@fullName, @gender, @dob, @bloodGroup, @phone, @email, @address)
      `);
        return result.recordset[0];
    }
    /**
     * Update an existing patient record.
     */
    static async update(patientId, input) {
        const pool = (0, db_1.getPool)();
        // Check if patient exists first
        await this.getById(patientId);
        const result = await pool.request()
            .input('patientId', mssql_1.default.Int, patientId)
            .input('fullName', mssql_1.default.VarChar, input.full_name)
            .input('gender', mssql_1.default.VarChar, input.gender)
            .input('dob', mssql_1.default.Date, input.dob)
            .input('bloodGroup', mssql_1.default.VarChar, input.blood_group || null)
            .input('phone', mssql_1.default.VarChar, input.phone)
            .input('email', mssql_1.default.VarChar, input.email || null)
            .input('address', mssql_1.default.VarChar, input.address || null)
            .query(`
        UPDATE dbo.Patients
        SET full_name = @fullName,
            gender = @gender,
            dob = @dob,
            blood_group = @bloodGroup,
            phone = @phone,
            email = @email,
            address = @address,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE patient_id = @patientId
      `);
        return result.recordset[0];
    }
    /**
     * Delete a patient record by ID.
     */
    static async delete(patientId) {
        const pool = (0, db_1.getPool)();
        // Check if patient exists first
        await this.getById(patientId);
        await pool.request()
            .input('patientId', mssql_1.default.Int, patientId)
            .query('DELETE FROM dbo.Patients WHERE patient_id = @patientId');
        return true;
    }
}
exports.PatientService = PatientService;
