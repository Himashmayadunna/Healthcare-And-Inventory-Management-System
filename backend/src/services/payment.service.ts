import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export interface PaymentInput {
  invoice_id: number;
  amount: number;
  payment_method: 'Cash' | 'Card' | 'Online';
}

export class PaymentService {
  /**
   * Get all payments.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        py.payment_id,
        py.amount,
        py.payment_date,
        py.payment_method,
        i.invoice_id,
        i.total_amount AS invoice_total,
        p.full_name AS patient_name
      FROM dbo.Payments py
      INNER JOIN dbo.Invoices i ON py.invoice_id = i.invoice_id
      INNER JOIN dbo.Patients p ON i.patient_id = p.patient_id
      ORDER BY py.payment_date DESC
    `);
    return result.recordset;
  }

  /**
   * Process a payment using SQL Transaction.
   */
  static async create(input: PaymentInput) {
    const pool = getPool();

    // Create a transaction
    const transaction = new mssql.Transaction(pool);
    try {
      await transaction.begin();

      // 1. Check if invoice exists and get details
      const invReq = new mssql.Request(transaction);
      const invResult = await invReq
        .input('invoiceId', mssql.Int, input.invoice_id)
        .query(`
          SELECT i.invoice_id, i.total_amount, i.status, p.full_name 
          FROM dbo.Invoices i
          INNER JOIN dbo.Patients p ON i.patient_id = p.patient_id
          WHERE i.invoice_id = @invoiceId
        `);

      const invoice = invResult.recordset[0];
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${input.invoice_id} not found.`);
      }

      if (invoice.status === 'Paid') {
        throw new BadRequestError(`Invoice #${input.invoice_id} is already fully paid.`);
      }

      if (invoice.status === 'Cancelled') {
        throw new BadRequestError(`Invoice #${input.invoice_id} has been cancelled.`);
      }

      // 2. Calculate remaining balance on the invoice
      const paymentsReq = new mssql.Request(transaction);
      const paymentsResult = await paymentsReq
        .input('invoiceId', mssql.Int, input.invoice_id)
        .query('SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM dbo.Payments WHERE invoice_id = @invoiceId');
      
      const totalPaid = paymentsResult.recordset[0].totalPaid;
      const remainingBalance = invoice.total_amount - totalPaid;

      if (input.amount > remainingBalance) {
        throw new BadRequestError(`Payment amount ($${input.amount}) exceeds remaining invoice balance ($${remainingBalance.toFixed(2)}).`);
      }

      // 3. Insert Payment record
      const payReq = new mssql.Request(transaction);
      const payResult = await payReq
        .input('invoiceId', mssql.Int, input.invoice_id)
        .input('amount', mssql.Decimal(10, 2), input.amount)
        .input('paymentMethod', mssql.VarChar, input.payment_method)
        .query(`
          INSERT INTO dbo.Payments (invoice_id, amount, payment_method)
          OUTPUT INSERTED.*
          VALUES (@invoiceId, @amount, @paymentMethod)
        `);

      const createdPayment = payResult.recordset[0];

      // 4. Update Invoice status to 'Paid' if fully settled
      const newTotalPaid = totalPaid + input.amount;
      if (newTotalPaid >= invoice.total_amount) {
        const updateInvReq = new mssql.Request(transaction);
        await updateInvReq
          .input('invoiceId', mssql.Int, input.invoice_id)
          .query("UPDATE dbo.Invoices SET status = 'Paid', updated_at = GETDATE() WHERE invoice_id = @invoiceId");
      }

      // 5. Log activity
      const activityReq = new mssql.Request(transaction);
      await activityReq
        .input('action', mssql.VarChar, 'Payment Received')
        .input('description', mssql.VarChar, `Received $${input.amount} payment via ${input.payment_method} for Invoice #${input.invoice_id}`)
        .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');

      await transaction.commit();
      return createdPayment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
