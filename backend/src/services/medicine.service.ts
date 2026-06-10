import mssql from 'mssql';
import { getPool } from '../config/db';
import { NotFoundError } from '../utils/errors';

export interface MedicineInput {
  medicine_name: string;
  generic_name: string;
  category: string;
  price: number;
}

export class MedicineService {
  /**
   * Get all medicines.
   */
  static async getAll() {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM dbo.Medicines ORDER BY medicine_name ASC');
    return result.recordset;
  }

  /**
   * Get medicine by ID.
   */
  static async getById(medicineId: number) {
    const pool = getPool();
    const result = await pool.request()
      .input('medicineId', mssql.Int, medicineId)
      .query('SELECT * FROM dbo.Medicines WHERE medicine_id = @medicineId');

    const medicine = result.recordset[0];
    if (!medicine) {
      throw new NotFoundError(`Medicine with ID ${medicineId} not found.`);
    }
    return medicine;
  }

  /**
   * Create a new medicine record.
   */
  static async create(input: MedicineInput) {
    const pool = getPool();
    const result = await pool.request()
      .input('medicineName', mssql.VarChar, input.medicine_name)
      .input('genericName', mssql.VarChar, input.generic_name)
      .input('category', mssql.VarChar, input.category)
      .input('price', mssql.Decimal(10, 2), input.price)
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
  static async update(medicineId: number, input: MedicineInput) {
    const pool = getPool();
    
    // Check if medicine exists
    await this.getById(medicineId);

    const result = await pool.request()
      .input('medicineId', mssql.Int, medicineId)
      .input('medicineName', mssql.VarChar, input.medicine_name)
      .input('genericName', mssql.VarChar, input.generic_name)
      .input('category', mssql.VarChar, input.category)
      .input('price', mssql.Decimal(10, 2), input.price)
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
  static async delete(medicineId: number) {
    const pool = getPool();
    
    // Check if medicine exists
    await this.getById(medicineId);

    await pool.request()
      .input('medicineId', mssql.Int, medicineId)
      .query('DELETE FROM dbo.Medicines WHERE medicine_id = @medicineId');

    return true;
  }
}
