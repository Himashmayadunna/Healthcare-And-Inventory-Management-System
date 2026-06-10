"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class PaymentService {
    /**
     * Get all payments.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
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
    static async create(input) {
        const pool = (0, db_1.getPool)();
        // Create a transaction
        const transaction = new mssql_1.default.Transaction(pool);
        try {
            await transaction.begin();
            // 1. Check if invoice exists and get details
            const invReq = new mssql_1.default.Request(transaction);
            const invResult = await invReq
                .input('invoiceId', mssql_1.default.Int, input.invoice_id)
                .query(`
          SELECT i.invoice_id, i.total_amount, i.status, p.full_name 
          FROM dbo.Invoices i
          INNER JOIN dbo.Patients p ON i.patient_id = p.patient_id
          WHERE i.invoice_id = @invoiceId
        `);
            const invoice = invResult.recordset[0];
            if (!invoice) {
                throw new errors_1.NotFoundError(`Invoice with ID ${input.invoice_id} not found.`);
            }
            if (invoice.status === 'Paid') {
                throw new errors_1.BadRequestError(`Invoice #${input.invoice_id} is already fully paid.`);
            }
            if (invoice.status === 'Cancelled') {
                throw new errors_1.BadRequestError(`Invoice #${input.invoice_id} has been cancelled.`);
            }
            // 2. Calculate remaining balance on the invoice
            const paymentsReq = new mssql_1.default.Request(transaction);
            const paymentsResult = await paymentsReq
                .input('invoiceId', mssql_1.default.Int, input.invoice_id)
                .query('SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM dbo.Payments WHERE invoice_id = @invoiceId');
            const totalPaid = paymentsResult.recordset[0].totalPaid;
            const remainingBalance = invoice.total_amount - totalPaid;
            if (input.amount > remainingBalance) {
                throw new errors_1.BadRequestError(`Payment amount ($${input.amount}) exceeds remaining invoice balance ($${remainingBalance.toFixed(2)}).`);
            }
            // 3. Insert Payment record
            const payReq = new mssql_1.default.Request(transaction);
            const payResult = await payReq
                .input('invoiceId', mssql_1.default.Int, input.invoice_id)
                .input('amount', mssql_1.default.Decimal(10, 2), input.amount)
                .input('paymentMethod', mssql_1.default.VarChar, input.payment_method)
                .query(`
          INSERT INTO dbo.Payments (invoice_id, amount, payment_method)
          OUTPUT INSERTED.*
          VALUES (@invoiceId, @amount, @paymentMethod)
        `);
            const createdPayment = payResult.recordset[0];
            // 4. Update Invoice status to 'Paid' if fully settled
            const newTotalPaid = totalPaid + input.amount;
            if (newTotalPaid >= invoice.total_amount) {
                const updateInvReq = new mssql_1.default.Request(transaction);
                await updateInvReq
                    .input('invoiceId', mssql_1.default.Int, input.invoice_id)
                    .query("UPDATE dbo.Invoices SET status = 'Paid', updated_at = GETDATE() WHERE invoice_id = @invoiceId");
            }
            // 5. Log activity
            const activityReq = new mssql_1.default.Request(transaction);
            await activityReq
                .input('action', mssql_1.default.VarChar, 'Payment Received')
                .input('description', mssql_1.default.VarChar, `Received $${input.amount} payment via ${input.payment_method} for Invoice #${input.invoice_id}`)
                .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');
            await transaction.commit();
            return createdPayment;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
