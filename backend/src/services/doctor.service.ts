import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface DoctorInput {
  doctor_name: string;
  specialization: string;
  phone: string;
  email: string;
  consultation_fee: number;
  availability: string;
  user_id?: number | null;
}

export class DoctorService {
  /**
   * Get all doctor records.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM dbo.Doctors ORDER BY doctor_name ASC');
    return result.recordset;
  }

  /**
   * Get a doctor record by ID.
   */
  static async getById(doctorId: number) {
    const pool = getPool();
    const result = await pool.request()
      .input('doctorId', mssql.Int, doctorId)
      .query('SELECT * FROM dbo.Doctors WHERE doctor_id = @doctorId');

    const doctor = result.recordset[0];
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID ${doctorId} not found.`);
    }
    return doctor;
  }

  /**
   * Create a new doctor record.
   */
  static async create(input: DoctorInput) {
    const pool = getPool();
    const result = await pool.request()
      .input('doctorName', mssql.VarChar, input.doctor_name)
      .input('specialization', mssql.VarChar, input.specialization)
      .input('phone', mssql.VarChar, input.phone)
      .input('email', mssql.VarChar, input.email)
      .input('consultationFee', mssql.Decimal(10, 2), input.consultation_fee)
      .input('availability', mssql.VarChar, input.availability)
      .input('userId', mssql.Int, input.user_id || null)
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
  static async update(doctorId: number, input: DoctorInput) {
    const pool = getPool();
    
    // Check if doctor exists first
    await this.getById(doctorId);

    const result = await pool.request()
      .input('doctorId', mssql.Int, doctorId)
      .input('doctorName', mssql.VarChar, input.doctor_name)
      .input('specialization', mssql.VarChar, input.specialization)
      .input('phone', mssql.VarChar, input.phone)
      .input('email', mssql.VarChar, input.email)
      .input('consultationFee', mssql.Decimal(10, 2), input.consultation_fee)
      .input('availability', mssql.VarChar, input.availability)
      .input('userId', mssql.Int, input.user_id || null)
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
  static async delete(doctorId: number) {
    const pool = getPool();
    
    // Check if doctor exists first
    await this.getById(doctorId);

    await pool.request()
      .input('doctorId', mssql.Int, doctorId)
      .query('DELETE FROM dbo.Doctors WHERE doctor_id = @doctorId');

    return true;
  }
}
