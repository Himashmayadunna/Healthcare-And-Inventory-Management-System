"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class MedicineService {
    /**
     * Get all medicines.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query('SELECT * FROM dbo.Medicines ORDER BY medicine_name ASC');
        return result.recordset;
    }
    /**
     * Get medicine by ID.
     */
    static async getById(medicineId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('medicineId', mssql_1.default.Int, medicineId)
            .query('SELECT * FROM dbo.Medicines WHERE medicine_id = @medicineId');
        const medicine = result.recordset[0];
        if (!medicine) {
            throw new errors_1.NotFoundError(`Medicine with ID ${medicineId} not found.`);
        }
        return medicine;
    }
    /**
     * Create a new medicine record.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('medicineName', mssql_1.default.VarChar, input.medicine_name)
            .input('genericName', mssql_1.default.VarChar, input.generic_name)
            .input('category', mssql_1.default.VarChar, input.category)
            .input('price', mssql_1.default.Decimal(10, 2), input.price)
            .query(`
        INSERT INTO dbo.Medicines (medicine_name, generic_name, category, price)
        OUTPUT INSERTED.*
        VALUES (@medicineName, @genericName, @category, @price)
      `);
        return result.recordset[0];
    }
    /**
     * Update an existing medicine record.
     */
    static async update(medicineId, input) {
        const pool = (0, db_1.getPool)();
        // Check if medicine exists
        await this.getById(medicineId);
        const result = await pool.request()
            .input('medicineId', mssql_1.default.Int, medicineId)
            .input('medicineName', mssql_1.default.VarChar, input.medicine_name)
            .input('genericName', mssql_1.default.VarChar, input.generic_name)
            .input('category', mssql_1.default.VarChar, input.category)
            .input('price', mssql_1.default.Decimal(10, 2), input.price)
            .query(`
        UPDATE dbo.Medicines
        SET medicine_name = @medicineName,
            generic_name = @genericName,
            category = @category,
            price = @price,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE medicine_id = @medicineId
      `);
        return result.recordset[0];
    }
    /**
     * Delete a medicine record.
     */
    static async delete(medicineId) {
        const pool = (0, db_1.getPool)();
        // Check if medicine exists
        await this.getById(medicineId);
        await pool.request()
            .input('medicineId', mssql_1.default.Int, medicineId)
            .query('DELETE FROM dbo.Medicines WHERE medicine_id = @medicineId');
        return true;
    }
}
exports.MedicineService = MedicineService;
