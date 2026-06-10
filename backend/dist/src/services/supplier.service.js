"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class SupplierService {
    /**
     * Get all suppliers.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query('SELECT * FROM dbo.Suppliers ORDER BY supplier_name ASC');
        return result.recordset;
    }
    /**
     * Get supplier by ID.
     */
    static async getById(supplierId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('supplierId', mssql_1.default.Int, supplierId)
            .query('SELECT * FROM dbo.Suppliers WHERE supplier_id = @supplierId');
        const supplier = result.recordset[0];
        if (!supplier) {
            throw new errors_1.NotFoundError(`Supplier with ID ${supplierId} not found.`);
        }
        return supplier;
    }
    /**
     * Create a new supplier.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('supplierName', mssql_1.default.VarChar, input.supplier_name)
            .input('contactPerson', mssql_1.default.VarChar, input.contact_person || null)
            .input('phone', mssql_1.default.VarChar, input.phone)
            .input('email', mssql_1.default.VarChar, input.email || null)
            .input('address', mssql_1.default.VarChar, input.address || null)
            .query(`
        INSERT INTO dbo.Suppliers (supplier_name, contact_person, phone, email, address)
        OUTPUT INSERTED.*
        VALUES (@supplierName, @contactPerson, @phone, @email, @address)
      `);
        return result.recordset[0];
    }
    /**
     * Update an existing supplier.
     */
    static async update(supplierId, input) {
        const pool = (0, db_1.getPool)();
        // Check if supplier exists
        await this.getById(supplierId);
        const result = await pool.request()
            .input('supplierId', mssql_1.default.Int, supplierId)
            .input('supplierName', mssql_1.default.VarChar, input.supplier_name)
            .input('contactPerson', mssql_1.default.VarChar, input.contact_person || null)
            .input('phone', mssql_1.default.VarChar, input.phone)
            .input('email', mssql_1.default.VarChar, input.email || null)
            .input('address', mssql_1.default.VarChar, input.address || null)
            .query(`
        UPDATE dbo.Suppliers
        SET supplier_name = @supplierName,
            contact_person = @contactPerson,
            phone = @phone,
            email = @email,
            address = @address,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE supplier_id = @supplierId
      `);
        return result.recordset[0];
    }
    /**
     * Delete a supplier.
     */
    static async delete(supplierId) {
        const pool = (0, db_1.getPool)();
        // Check if supplier exists
        await this.getById(supplierId);
        await pool.request()
            .input('supplierId', mssql_1.default.Int, supplierId)
            .query('DELETE FROM dbo.Suppliers WHERE supplier_id = @supplierId');
        return true;
    }
}
exports.SupplierService = SupplierService;
