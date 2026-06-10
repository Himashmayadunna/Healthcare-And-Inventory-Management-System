"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class PrescriptionService {
    /**
     * Get all prescriptions.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query(`
      SELECT 
        pr.prescription_id,
        pr.diagnosis,
        pr.created_at,
        p.patient_id,
        p.full_name AS patient_name,
        d.doctor_id,
        d.doctor_name AS doctor_name,
        d.specialization AS doctor_specialization
      FROM dbo.Prescriptions pr
      INNER JOIN dbo.Patients p ON pr.patient_id = p.patient_id
      INNER JOIN dbo.Doctors d ON pr.doctor_id = d.doctor_id
      ORDER BY pr.created_at DESC
    `);
        return result.recordset;
    }
    /**
     * Get a single prescription by ID with all item details.
     */
    static async getById(prescriptionId) {
        const pool = (0, db_1.getPool)();
        // Query 1: Prescription main details
        const presResult = await pool.request()
            .input('prescriptionId', mssql_1.default.Int, prescriptionId)
            .query(`
        SELECT 
          pr.prescription_id,
          pr.diagnosis,
          pr.created_at,
          p.patient_id,
          p.full_name AS patient_name,
          p.phone AS patient_phone,
          p.dob AS patient_dob,
          p.gender AS patient_gender,
          d.doctor_id,
          d.doctor_name AS doctor_name,
          d.specialization AS doctor_specialization
        FROM dbo.Prescriptions pr
        INNER JOIN dbo.Patients p ON pr.patient_id = p.patient_id
        INNER JOIN dbo.Doctors d ON pr.doctor_id = d.doctor_id
        WHERE pr.prescription_id = @prescriptionId
      `);
        const prescription = presResult.recordset[0];
        if (!prescription) {
            throw new errors_1.NotFoundError(`Prescription with ID ${prescriptionId} not found.`);
        }
        // Query 2: Prescription items (medicines)
        const itemsResult = await pool.request()
            .input('prescriptionId', mssql_1.default.Int, prescriptionId)
            .query(`
        SELECT 
          pi.prescription_item_id,
          pi.dosage,
          pi.quantity,
          pi.duration,
          m.medicine_id,
          m.medicine_name,
          m.generic_name,
          m.category,
          m.price
        FROM dbo.Prescription_Items pi
        INNER JOIN dbo.Medicines m ON pi.medicine_id = m.medicine_id
        WHERE pi.prescription_id = @prescriptionId
      `);
        prescription.medicines = itemsResult.recordset;
        return prescription;
    }
    /**
     * Create a new prescription with multiple items using SQL Transaction.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        // Verify patient and doctor exist
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
        // Create transaction
        const transaction = new mssql_1.default.Transaction(pool);
        try {
            await transaction.begin();
            // 1. Insert Prescription
            const presRequest = new mssql_1.default.Request(transaction);
            const presResult = await presRequest
                .input('patientId', mssql_1.default.Int, input.patient_id)
                .input('doctorId', mssql_1.default.Int, input.doctor_id)
                .input('diagnosis', mssql_1.default.VarChar, input.diagnosis)
                .query(`
          INSERT INTO dbo.Prescriptions (patient_id, doctor_id, diagnosis)
          OUTPUT INSERTED.prescription_id
          VALUES (@patientId, @doctorId, @diagnosis)
        `);
            const prescriptionId = presResult.recordset[0].prescription_id;
            // 2. Insert Prescription Items & Deduct Inventory Stock
            for (const item of input.medicines) {
                // Verify medicine exists
                const medReq = new mssql_1.default.Request(transaction);
                const medCheck = await medReq
                    .input('medicineId', mssql_1.default.Int, item.medicine_id)
                    .query('SELECT medicine_name FROM dbo.Medicines WHERE medicine_id = @medicineId');
                if (!medCheck.recordset[0]) {
                    throw new errors_1.NotFoundError(`Medicine with ID ${item.medicine_id} does not exist.`);
                }
                // Insert Item
                const itemReq = new mssql_1.default.Request(transaction);
                await itemReq
                    .input('prescriptionId', mssql_1.default.Int, prescriptionId)
                    .input('medicineId', mssql_1.default.Int, item.medicine_id)
                    .input('dosage', mssql_1.default.VarChar, item.dosage)
                    .input('quantity', mssql_1.default.Int, item.quantity)
                    .input('duration', mssql_1.default.VarChar, item.duration)
                    .query(`
            INSERT INTO dbo.Prescription_Items (prescription_id, medicine_id, dosage, quantity, duration)
            VALUES (@prescriptionId, @medicineId, @dosage, @quantity, @duration)
          `);
                // Deduct from Inventory (FIFO: oldest expiry first)
                const invReq = new mssql_1.default.Request(transaction);
                const invCheck = await invReq
                    .input('medicineId', mssql_1.default.Int, item.medicine_id)
                    .query('SELECT TOP 1 inventory_id, quantity FROM dbo.Inventory WHERE medicine_id = @medicineId ORDER BY expiry_date ASC');
                if (invCheck.recordset[0]) {
                    const invRecord = invCheck.recordset[0];
                    // Determine new stock count (clamp at zero)
                    const newQty = Math.max(0, invRecord.quantity - item.quantity);
                    const updateInvReq = new mssql_1.default.Request(transaction);
                    await updateInvReq
                        .input('inventoryId', mssql_1.default.Int, invRecord.inventory_id)
                        .input('newQuantity', mssql_1.default.Int, newQty)
                        .query('UPDATE dbo.Inventory SET quantity = @newQuantity, updated_at = GETDATE() WHERE inventory_id = @inventoryId');
                }
            }
            // 3. Log activity
            const activityReq = new mssql_1.default.Request(transaction);
            await activityReq
                .input('action', mssql_1.default.VarChar, 'Prescription Created')
                .input('description', mssql_1.default.VarChar, `Prescription issued to ${patientName} by ${doctorName}`)
                .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');
            await transaction.commit();
            // Fetch complete populated prescription to return
            return await this.getById(prescriptionId);
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
exports.PrescriptionService = PrescriptionService;
