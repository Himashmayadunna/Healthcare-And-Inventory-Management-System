"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const db_1 = require("../config/db");
class DashboardService {
    /**
     * Fetch aggregate data and logs for the dashboard.
     */
    static async getDashboardData() {
        const pool = (0, db_1.getPool)();
        const query = `
      SELECT COUNT(*) AS totalPatients FROM dbo.Patients;
      SELECT COUNT(*) AS totalDoctors FROM dbo.Doctors;
      SELECT COUNT(*) AS totalAppointments FROM dbo.Appointments;
      SELECT COUNT(*) AS totalMedicines FROM dbo.Medicines;
      SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM dbo.Payments;
      SELECT COUNT(*) AS lowStockCount FROM dbo.Inventory WHERE quantity <= reorder_level;
      SELECT COUNT(*) AS pendingInvoices FROM dbo.Invoices WHERE status = 'Pending';
      SELECT TOP 5 a.activity_id, a.action, a.description, a.created_at, u.full_name AS user_full_name
      FROM dbo.RecentActivities a
      LEFT JOIN dbo.Users u ON a.user_id = u.user_id
      ORDER BY a.created_at DESC;
    `;
        const result = await pool.request().query(query);
        const recordsets = result.recordsets;
        return {
            totalPatients: recordsets[0][0]?.totalPatients || 0,
            totalDoctors: recordsets[1][0]?.totalDoctors || 0,
            totalAppointments: recordsets[2][0]?.totalAppointments || 0,
            totalMedicines: recordsets[3][0]?.totalMedicines || 0,
            totalRevenue: recordsets[4][0]?.totalRevenue || 0,
            lowStockCount: recordsets[5][0]?.lowStockCount || 0,
            pendingInvoices: recordsets[6][0]?.pendingInvoices || 0,
            recentActivities: recordsets[7] || [],
        };
    }
}
exports.DashboardService = DashboardService;
