"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
/**
 * Health check route to verify live database connectivity.
 * Executes: SELECT GETDATE() AS CurrentTime
 */
router.get('/health', async (req, res, next) => {
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.request().query('SELECT GETDATE() AS CurrentTime');
        const currentTime = result.recordset[0].CurrentTime;
        res.status(200).json({
            success: true,
            database: 'connected',
            serverTime: currentTime,
            message: 'Database Connected Successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
