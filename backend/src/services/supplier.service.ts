import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface SupplierInput {
  supplier_name: string;
  contact_person?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
}

export class SupplierService {
  /**
   * Get all suppliers.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM dbo.Suppliers ORDER BY supplier_name ASC');
    return result.recordset;
  }

  /**
   * Get supplier by ID.
   */
  static async getById(supplierId: number) {
    const pool = getPool();
    const result = await pool.request()
      .input('supplierId', mssql.Int, supplierId)
      .query('SELECT * FROM dbo.Suppliers WHERE supplier_id = @supplierId');

    const supplier = result.recordset[0];
    if (!supplier) {
      throw new NotFoundError(`Supplier with ID ${supplierId} not found.`);
    }
    return supplier;
  }

  /**
   * Create a new supplier.
   */
  static async create(input: SupplierInput) {
    const pool = getPool();
    const result = await pool.request()
      .input('supplierName', mssql.VarChar, input.supplier_name)
      .input('contactPerson', mssql.VarChar, input.contact_person || null)
      .input('phone', mssql.VarChar, input.phone)
      .input('email', mssql.VarChar, input.email || null)
      .input('address', mssql.VarChar, input.address || null)
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
  static async update(supplierId: number, input: SupplierInput) {
    const pool = getPool();
    
    // Check if supplier exists
    await this.getById(supplierId);

    const result = await pool.request()
      .input('supplierId', mssql.Int, supplierId)
      .input('supplierName', mssql.VarChar, input.supplier_name)
      .input('contactPerson', mssql.VarChar, input.contact_person || null)
      .input('phone', mssql.VarChar, input.phone)
      .input('email', mssql.VarChar, input.email || null)
      .input('address', mssql.VarChar, input.address || null)
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
  static async delete(supplierId: number) {
    const pool = getPool();

    // Check if supplier exists
    await this.getById(supplierId);

    await pool.request()
      .input('supplierId', mssql.Int, supplierId)
      .query('DELETE FROM dbo.Suppliers WHERE supplier_id = @supplierId');

    return true;
  }
}
