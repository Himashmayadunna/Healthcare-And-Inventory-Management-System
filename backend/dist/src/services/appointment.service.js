"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class AppointmentService {
    /**
     * Get all appointments with Patient and Doctor info.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
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
    static async getById(appointmentId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('appointmentId', mssql_1.default.Int, appointmentId)
            .query(`
        SELECT 
          a.appointment_id,
          a.appointment_date,
          a.appointment_time,
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
            throw new errors_1.NotFoundError(`Appointment with ID ${appointmentId} not found.`);
        }
        return appointment;
    }
    /**
     * Create an appointment.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        // Validate patient and doctor exist
        const patientCheck = await pool.request()
            .input('patientId', mssql_1.default.Int, input.patient_id)
            .query('SELECT full_name FROM dbo.Patients WHERE patient_id = @patientId');
        if (!patientCheck.recordset[0]) {
            throw new errors_1.NotFoundError(`Patient with ID ${input.patient_id} does not exist.`);
        }
        const doctorCheck = await pool.request()
            .input('doctorId', mssql_1.default.Int, input.doctor_id)
            .query('SELECT doctor_name FROM dbo.Doctors WHERE doctor_id = @doctorId');
        if (!doctorCheck.recordset[0]) {
            throw new errors_1.NotFoundError(`Doctor with ID ${input.doctor_id} does not exist.`);
        }
        const patientName = patientCheck.recordset[0].full_name;
        const doctorName = doctorCheck.recordset[0].doctor_name;
        const result = await pool.request()
            .input('patientId', mssql_1.default.Int, input.patient_id)
            .input('doctorId', mssql_1.default.Int, input.doctor_id)
            .input('appointmentDate', mssql_1.default.Date, input.appointment_date)
            .input('appointmentTime', mssql_1.default.VarChar, input.appointment_time)
            .input('status', mssql_1.default.VarChar, input.status || 'Pending')
            .input('notes', mssql_1.default.VarChar, input.notes || null)
            .query(`
        INSERT INTO dbo.Appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes)
        OUTPUT INSERTED.*
        VALUES (@patientId, @doctorId, @appointmentDate, @appointmentTime, @status, @notes)
      `);
        const createdAppointment = result.recordset[0];
        // Log the activity
        await pool.request()
            .input('action', mssql_1.default.VarChar, 'Appointment Booked')
            .input('description', mssql_1.default.VarChar, `Appointment scheduled for ${patientName} with ${doctorName} on ${createdAppointment.appointment_date.toISOString().split('T')[0]}`)
            .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');
        return createdAppointment;
    }
    /**
     * Update an existing appointment.
     */
    static async update(appointmentId, input) {
        const pool = (0, db_1.getPool)();
        // Check if appointment exists
        await this.getById(appointmentId);
        const result = await pool.request()
            .input('appointmentId', mssql_1.default.Int, appointmentId)
            .input('patientId', mssql_1.default.Int, input.patient_id)
            .input('doctorId', mssql_1.default.Int, input.doctor_id)
            .input('appointmentDate', mssql_1.default.Date, input.appointment_date)
            .input('appointmentTime', mssql_1.default.VarChar, input.appointment_time)
            .input('status', mssql_1.default.VarChar, input.status || 'Pending')
            .input('notes', mssql_1.default.VarChar, input.notes || null)
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
            .input('action', mssql_1.default.VarChar, 'Appointment Updated')
            .input('description', mssql_1.default.VarChar, `Appointment #${appointmentId} status updated to ${updated.status}`)
            .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');
        return updated;
    }
    /**
     * Delete an appointment.
     */
    static async delete(appointmentId) {
        const pool = (0, db_1.getPool)();
        // Check if appointment exists
        await this.getById(appointmentId);
        await pool.request()
            .input('appointmentId', mssql_1.default.Int, appointmentId)
            .query('DELETE FROM dbo.Appointments WHERE appointment_id = @appointmentId');
        return true;
    }
}
exports.AppointmentService = AppointmentService;
