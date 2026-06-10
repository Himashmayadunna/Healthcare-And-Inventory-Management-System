import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface PatientInput {
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: Date;
  blood_group?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
}

export class PatientService {
  /**
   * Get all patient records.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM dbo.Patients ORDER BY full_name ASC');
    return result.recordset;
  }

  /**
   * Get a patient record by ID.
   */
  static async getById(patientId: number) {
    const pool = getPool();
    const result = await pool.request()
      .input('patientId', mssql.Int, patientId)
      .query('SELECT * FROM dbo.Patients WHERE patient_id = @patientId');

    const patient = result.recordset[0];
    if (!patient) {
      throw new NotFoundError(`Patient with ID ${patientId} not found.`);
    }
    return patient;
  }

  /**
   * Create a new patient record.
   */
  static async create(input: PatientInput) {
    const pool = getPool();
    const result = await pool.request()
      .input('fullName', mssql.VarChar, input.full_name)
      .input('gender', mssql.VarChar, input.gender)
      .input('dob', mssql.Date, input.dob)
      .input('bloodGroup', mssql.VarChar, input.blood_group || null)
      .input('phone', mssql.VarChar, input.phone)
      .input('email', mssql.VarChar, input.email || null)
      .input('address', mssql.VarChar, input.address || null)
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
  static async update(patientId: number, input: PatientInput) {
    const pool = getPool();
    
    // Check if patient exists first
    await this.getById(patientId);

    const result = await pool.request()
      .input('patientId', mssql.Int, patientId)
      .input('fullName', mssql.VarChar, input.full_name)
      .input('gender', mssql.VarChar, input.gender)
      .input('dob', mssql.Date, input.dob)
      .input('bloodGroup', mssql.VarChar, input.blood_group || null)
      .input('phone', mssql.VarChar, input.phone)
      .input('email', mssql.VarChar, input.email || null)
      .input('address', mssql.VarChar, input.address || null)
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
  static async delete(patientId: number) {
    const pool = getPool();
    
    // Check if patient exists first
    await this.getById(patientId);

    await pool.request()
      .input('patientId', mssql.Int, patientId)
      .query('DELETE FROM dbo.Patients WHERE patient_id = @patientId');

    return true;
  }
}
