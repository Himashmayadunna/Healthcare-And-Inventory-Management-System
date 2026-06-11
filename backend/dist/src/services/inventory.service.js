"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
class InventoryService {
    /**
     * Get all inventory records with Medicine and Supplier details.
     */
    static async getAll() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query(`
      SELECT 
        i.inventory_id,
        i.quantity,
        CONVERT(VARCHAR(10), i.expiry_date, 120) AS expiry_date,
        i.reorder_level,
        i.created_at,
        i.updated_at,
        m.medicine_id,
        m.medicine_name,
        m.generic_name,
        m.category,
        m.price,
        s.supplier_id,
        s.supplier_name
      FROM dbo.Inventory i
      INNER JOIN dbo.Medicines m ON i.medicine_id = m.medicine_id
      LEFT JOIN dbo.Suppliers s ON i.supplier_id = s.supplier_id
      ORDER BY m.medicine_name ASC, i.expiry_date ASC
    `);
        return result.recordset;
    }
    /**
     * Get a single inventory record by ID.
     */
    static async getById(inventoryId) {
        const pool = (0, db_1.getPool)();
        const result = await pool.request()
            .input('inventoryId', mssql_1.default.Int, inventoryId)
            .query(`
        SELECT 
          i.inventory_id,
          i.quantity,
          CONVERT(VARCHAR(10), i.expiry_date, 120) AS expiry_date,
          i.reorder_level,
          i.created_at,
          m.medicine_id,
          m.medicine_name,
          s.supplier_id,
          s.supplier_name
        FROM dbo.Inventory i
        INNER JOIN dbo.Medicines m ON i.medicine_id = m.medicine_id
        LEFT JOIN dbo.Suppliers s ON i.supplier_id = s.supplier_id
        WHERE i.inventory_id = @inventoryId
      `);
        const inventory = result.recordset[0];
        if (!inventory) {
            throw new errors_1.NotFoundError(`Inventory item with ID ${inventoryId} not found.`);
        }
        return inventory;
    }
    /**
     * Create a new inventory batch.
     */
    static async create(input) {
        const pool = (0, db_1.getPool)();
        // Verify medicine exists
        const medCheck = await pool.request()
            .input('medicineId', mssql_1.default.Int, input.medicine_id)
            .query('SELECT medicine_name FROM dbo.Medicines WHERE medicine_id = @medicineId');
        if (!medCheck.recordset[0]) {
            throw new errors_1.NotFoundError(`Medicine with ID ${input.medicine_id} does not exist.`);
        }
        const medicineName = medCheck.recordset[0].medicine_name;
        // Verify supplier exists if supplied
        if (input.supplier_id) {
            const supCheck = await pool.request()
                .input('supplierId', mssql_1.default.Int, input.supplier_id)
                .query('SELECT supplier_name FROM dbo.Suppliers WHERE supplier_id = @supplierId');
            if (!supCheck.recordset[0]) {
                throw new errors_1.NotFoundError(`Supplier with ID ${input.supplier_id} does not exist.`);
            }
        }
        const result = await pool.request()
            .input('medicineId', mssql_1.default.Int, input.medicine_id)
            .input('quantity', mssql_1.default.Int, input.quantity)
            .input('expiryDate', mssql_1.default.Date, input.expiry_date)
            .input('supplierId', mssql_1.default.Int, input.supplier_id || null)
            .input('reorderLevel', mssql_1.default.Int, input.reorder_level ?? 10)
            .query(`
        INSERT INTO dbo.Inventory (medicine_id, quantity, expiry_date, supplier_id, reorder_level)
        OUTPUT INSERTED.*
        VALUES (@medicineId, @quantity, @expiryDate, @supplierId, @reorderLevel)
      `);
        const created = result.recordset[0];
        // Log this inventory check-in activity
        await pool.request()
            .input('action', mssql_1.default.VarChar, 'Inventory Added')
            .input('description', mssql_1.default.VarChar, `Added batch of ${created.quantity} units for medicine ${medicineName}`)
            .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');
        return created;
    }
    /**
     * Update an existing inventory batch.
     */
    static async update(inventoryId, input) {
        const pool = (0, db_1.getPool)();
        // Check if inventory exists
        await this.getById(inventoryId);
        // Verify medicine exists
        const medCheck = await pool.request()
            .input('medicineId', mssql_1.default.Int, input.medicine_id)
            .query('SELECT medicine_name FROM dbo.Medicines WHERE medicine_id = @medicineId');
        if (!medCheck.recordset[0]) {
            throw new errors_1.NotFoundError(`Medicine with ID ${input.medicine_id} does not exist.`);
        }
        // Verify supplier exists if supplied
        if (input.supplier_id) {
            const supCheck = await pool.request()
                .input('supplierId', mssql_1.default.Int, input.supplier_id)
                .query('SELECT supplier_name FROM dbo.Suppliers WHERE supplier_id = @supplierId');
            if (!supCheck.recordset[0]) {
                throw new errors_1.NotFoundError(`Supplier with ID ${input.supplier_id} does not exist.`);
            }
        }
        const result = await pool.request()
            .input('inventoryId', mssql_1.default.Int, inventoryId)
            .input('medicineId', mssql_1.default.Int, input.medicine_id)
            .input('quantity', mssql_1.default.Int, input.quantity)
            .input('expiryDate', mssql_1.default.Date, input.expiry_date)
            .input('supplierId', mssql_1.default.Int, input.supplier_id || null)
            .input('reorderLevel', mssql_1.default.Int, input.reorder_level ?? 10)
            .query(`
        UPDATE dbo.Inventory
        SET medicine_id = @medicineId,
            quantity = @quantity,
            expiry_date = @expiryDate,
            supplier_id = @supplierId,
            reorder_level = @reorderLevel,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE inventory_id = @inventoryId
      `);
        const updated = result.recordset[0];
        // Log the stock update activity
        await pool.request()
            .input('action', mssql_1.default.VarChar, 'Inventory Updated')
            .input('description', mssql_1.default.VarChar, `Updated stock count of batch #${inventoryId} to ${updated.quantity} units`)
            .query('INSERT INTO dbo.RecentActivities (action, description) VALUES (@action, @description)');
        return updated;
    }
    /**
     * Get list of medicines that are currently low in stock (quantity <= reorder_level)
     */
    static async getLowStockAlerts() {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query(`
      SELECT 
        i.inventory_id,
        i.quantity,
        i.reorder_level,
        m.medicine_id,
        m.medicine_name,
        m.generic_name,
        s.supplier_name
      FROM dbo.Inventory i
      INNER JOIN dbo.Medicines m ON i.medicine_id = m.medicine_id
      LEFT JOIN dbo.Suppliers s ON i.supplier_id = s.supplier_id
      WHERE i.quantity <= i.reorder_level
      ORDER BY i.quantity ASC
    `);
        return result.recordset;
    }
}
exports.InventoryService = InventoryService;
