import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface AppointmentInput {
  patient_id: number;
  doctor_id: number;
  appointment_date: Date;
  appointment_time: string; // HH:MM:SS format
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string | null;
}

export class AppointmentService {
  /**
   * Get all appointments with Patient and Doctor info.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        CONVERT(VARCHAR(10), a.appointment_date, 120) AS appointment_date,
        CONVERT(VARCHAR(8), a.appointment_time, 108) AS appointment_time,
        a.status,
        a.notes,
        a.created_at,
        p.patient_id,
        p.full_name AS patient_name,
        p.phone AS patient_phone,
        d.doctor_id,
        d.doctor_name,
        d.specialization
      FROM dbo.Appointments a
      INNER JOIN dbo.Patients p ON a.patient_id = p.patient_id
      INNER JOIN dbo.Doctors d ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);
    return result.recordset;
  }

  /**
   * Get an appointment by ID.
   */
  static async getById(appointmentId: number) {
    const pool = getPool();
    const result = await pool.request()
      .input('appointmentId', mssql.Int, appointmentId)
      .query(`
        SELECT 
          a.appointment_id,
          CONVERT(VARCHAR(10), a.appointment_date, 120) AS appointment_date,
          CONVERT(VARCHAR(8), a.appointment_time, 108) AS appointment_time,
          a.status,
          a.notes,
          a.created_at,
          p.patient_id,
          p.full_name AS patient_name,
          d.doctor_id,
          d.doctor_name
        FROM dbo.Appointments a
        INNER JOIN dbo.Patients p ON a.patient_id = p.patient_id
        INNER JOIN dbo.Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.appointment_id = @appointmentId
      `);

    const appointment = result.recordset[0];
    if (!appointment) {
      throw new NotFoundError(`Appointment with ID ${appointmentId} not found.`);
    }
    return appointment;
  }

  /**
   * Create an appointment.
   */
  static async create(input: AppointmentInput) {
    const pool = getPool();
    
    // Validate patient and doctor exist
    const patientCheck = await pool.request()
      .input('patientId', mssql.Int, input.patient_id)
      .query('SELECT full_name FROM dbo.Patients WHERE patient_id = @patientId');
    if (!patientCheck.recordset[0]) {
      throw new NotFoundError(`Patient with ID ${input.patient_id} does not exist.`);
    }

    const doctorCheck = await pool.request()
      .input('doctorId', mssql.Int, input.doctor_id)
      .query('SELECT doctor_name FROM dbo.Doctors WHERE doctor_id = @doctorId');
    if (!doctorCheck.recordset[0]) {
      throw new NotFoundError(`Doctor with ID ${input.doctor_id} does not exist.`);
    }

    const patientName = patientCheck.recordset[0].full_name;
    const doctorName = doctorCheck.recordset[0].doctor_name;

    const result = await pool.request()
      .input('patientId', mssql.Int, input.patient_id)
      .input('doctorId', mssql.Int, input.doctor_id)
      .input('appointmentDate', mssql.Date, input.appointment_date)
      .input('appointmentTime', mssql.VarChar, input.appointment_time)
      .input('status', mssql.VarChar, input.status || 'Pending')
      .input('notes', mssql.VarChar, input.notes || null)
      .query(`
        INSERT INTO dbo.Appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes)
        OUTPUT INSERTED.*
        VALUES (@patientId, @doctorId, @appointmentDate, @appointmentTime, @status, @notes)
      `);

    const createdAppointment = result.recordset[0];

    // Log the activity
    await pool.request()
      .input('action', mssql.VarChar, 'Appointment Booked')
      .input('description', mssql.VarChar, `Appointment scheduled for ${patientName} with ${doctorName} on ${createdAppointment.appointment_date.toISOString().split('T')[0]}`)
      .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');

    return createdAppointment;
  }

  /**
   * Update an existing appointment.
   */
  static async update(appointmentId: number, input: AppointmentInput) {
    const pool = getPool();
    
    // Check if appointment exists
    await this.getById(appointmentId);

    const result = await pool.request()
      .input('appointmentId', mssql.Int, appointmentId)
      .input('patientId', mssql.Int, input.patient_id)
      .input('doctorId', mssql.Int, input.doctor_id)
      .input('appointmentDate', mssql.Date, input.appointment_date)
      .input('appointmentTime', mssql.VarChar, input.appointment_time)
      .input('status', mssql.VarChar, input.status || 'Pending')
      .input('notes', mssql.VarChar, input.notes || null)
      .query(`
        UPDATE dbo.Appointments
        SET patient_id = @patientId,
            doctor_id = @doctorId,
            appointment_date = @appointmentDate,
            appointment_time = @appointmentTime,
            status = @status,
            notes = @notes,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE appointment_id = @appointmentId
      `);

    const updated = result.recordset[0];

    // Log the status change activity
    await pool.request()
      .input('action', mssql.VarChar, 'Appointment Updated')
      .input('description', mssql.VarChar, `Appointment #${appointmentId} status updated to ${updated.status}`)
      .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');

    return updated;
  }

  /**
   * Delete an appointment.
   */
  static async delete(appointmentId: number) {
    const pool = getPool();
    
    // Check if appointment exists
    await this.getById(appointmentId);

    await pool.request()
      .input('appointmentId', mssql.Int, appointmentId)
      .query('DELETE FROM dbo.Appointments WHERE appointment_id = @appointmentId');

    return true;
  }
}
