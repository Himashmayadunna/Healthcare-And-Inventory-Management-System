import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface InvoiceInput {
  patient_id: number;
  appointment_id?: number | null;
  total_amount: number;
  due_date: Date;
}

export class BillingService {
  /**
   * Get all invoices with Patient name.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        i.invoice_id,
        i.total_amount,
        i.status,
        i.due_date,
        i.created_at,
        p.patient_id,
        p.full_name AS patient_name
      FROM dbo.Invoices i
      INNER JOIN dbo.Patients p ON i.patient_id = p.patient_id
      ORDER BY i.created_at DESC
    `);
    return result.recordset;
  }

  /**
   * Get an invoice by ID, including related payment transactions.
   */
  static async getById(invoiceId: number) {
    const pool = getPool();

    // Query 1: Invoice details
    const invoiceResult = await pool.request()
      .input('invoiceId', mssql.Int, invoiceId)
      .query(`
        SELECT 
          i.invoice_id,
          i.total_amount,
          i.status,
          i.due_date,
          i.created_at,
          p.patient_id,
          p.full_name AS patient_name,
          p.phone AS patient_phone,
          p.email AS patient_email
        FROM dbo.Invoices i
        INNER JOIN dbo.Patients p ON i.patient_id = p.patient_id
        WHERE i.invoice_id = @invoiceId
      `);

    const invoice = invoiceResult.recordset[0];
    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${invoiceId} not found.`);
    }

    // Query 2: Payments for this invoice
    const paymentsResult = await pool.request()
      .input('invoiceId', mssql.Int, invoiceId)
      .query('SELECT * FROM dbo.Payments WHERE invoice_id = @invoiceId ORDER BY payment_date DESC');

    invoice.payments = paymentsResult.recordset;
    return invoice;
  }

  /**
   * Create a new invoice.
   */
  static async create(input: InvoiceInput) {
    const pool = getPool();

    // Verify patient exists
    const patientCheck = await pool.request()
      .input('patientId', mssql.Int, input.patient_id)
      .query('SELECT full_name FROM dbo.Patients WHERE patient_id = @patientId');
    if (!patientCheck.recordset[0]) {
      throw new NotFoundError(`Patient with ID ${input.patient_id} does not exist.`);
    }

    const patientName = patientCheck.recordset[0].full_name;

    // Verify appointment exists if supplied
    if (input.appointment_id) {
      const appCheck = await pool.request()
        .input('appointmentId', mssql.Int, input.appointment_id)
        .query('SELECT appointment_id FROM dbo.Appointments WHERE appointment_id = @appointmentId');
      if (!appCheck.recordset[0]) {
        throw new NotFoundError(`Appointment with ID ${input.appointment_id} does not exist.`);
      }
    }

    const result = await pool.request()
      .input('patientId', mssql.Int, input.patient_id)
      .input('appointmentId', mssql.Int, input.appointment_id || null)
      .input('totalAmount', mssql.Decimal(10, 2), input.total_amount)
      .input('dueDate', mssql.Date, input.due_date)
      .query(`
        INSERT INTO dbo.Invoices (patient_id, appointment_id, total_amount, status, due_date)
        OUTPUT INSERTED.*
        VALUES (@patientId, @appointmentId, @totalAmount, 'Pending', @dueDate)
      `);

    const created = result.recordset[0];

    // Log the billing generation activity
    await pool.request()
      .input('action', mssql.VarChar, 'Billing Generated')
      .input('description', mssql.VarChar, `Created invoice #${created.invoice_id} for ${patientName} of amount $${created.total_amount}`)
      .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');

    return created;
  }
}
