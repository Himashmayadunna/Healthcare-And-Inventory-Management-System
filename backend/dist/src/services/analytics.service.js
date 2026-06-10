"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const db_1 = require("../config/db");
class AnalyticsService {
    /**
     * Fetch all reports and analytics datasets in one batched database call.
     */
    static async getAnalyticsData() {
        const pool = (0, db_1.getPool)();
        const query = `
      -- 1. Monthly Revenue
      SELECT 
        CONVERT(VARCHAR(7), payment_date, 120) AS [month], 
        SUM(amount) AS revenue
      FROM dbo.Payments
      GROUP BY CONVERT(VARCHAR(7), payment_date, 120)
      ORDER BY [month] ASC;

      -- 2. Medicine Usage
      SELECT TOP 10 
        m.medicine_name, 
        SUM(pi.quantity) AS total_quantity
      FROM dbo.Prescription_Items pi
      INNER JOIN dbo.Medicines m ON pi.medicine_id = m.medicine_id
      GROUP BY m.medicine_name
      ORDER BY total_quantity DESC;

      -- 3. Patient Visits
      SELECT 
        CONVERT(VARCHAR(7), appointment_date, 120) AS [month], 
        COUNT(*) AS visits
      FROM dbo.Appointments
      WHERE status = 'Completed'
      GROUP BY CONVERT(VARCHAR(7), appointment_date, 120)
      ORDER BY [month] ASC;

      -- 4. Doctor Performance
      SELECT 
        d.doctor_name, 
        COUNT(a.appointment_id) AS appointment_count, 
        SUM(d.consultation_fee) AS earnings
      FROM dbo.Appointments a
      INNER JOIN dbo.Doctors d ON a.doctor_id = d.doctor_id
      WHERE a.status = 'Completed'
      GROUP BY d.doctor_name
      ORDER BY appointment_count DESC;

      -- 5. Specialization (Department) Distribution
      SELECT 
        specialization, 
        COUNT(*) AS doctor_count
      FROM dbo.Doctors
      GROUP BY specialization;

      -- 6. Inventory Stock Levels
      SELECT 
        m.medicine_name, 
        COALESCE(SUM(i.quantity), 0) AS stock_quantity, 
        MIN(i.reorder_level) AS reorder_level
      FROM dbo.Medicines m
      LEFT JOIN dbo.Inventory i ON m.medicine_id = i.medicine_id
      GROUP BY m.medicine_name;

      -- 7. Revenue Trend (Daily)
      SELECT 
        CAST(payment_date AS DATE) AS [date], 
        SUM(amount) AS revenue
      FROM dbo.Payments
      GROUP BY CAST(payment_date AS DATE)
      ORDER BY [date] ASC;
    `;
        const result = await pool.request().query(query);
        const recordsets = result.recordsets;
        return {
            monthlyRevenue: recordsets[0] || [],
            medicineUsage: recordsets[1] || [],
            patientVisits: recordsets[2] || [],
            doctorPerformance: recordsets[3] || [],
            departmentDistribution: recordsets[4] || [],
            inventoryUsage: recordsets[5] || [],
            revenueTrend: recordsets[6] || [],
        };
    }
}
exports.AnalyticsService = AnalyticsService;
