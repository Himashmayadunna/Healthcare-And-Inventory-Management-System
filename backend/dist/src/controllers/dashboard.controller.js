"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const response_1 = require("../utils/response");
class DashboardController {
    /**
     * Fetch home dashboard metrics.
     */
    static async getDashboard(req, res, next) {
        try {
            const data = await dashboard_service_1.DashboardService.getDashboardData();
            (0, response_1.sendSuccess)(res, 'Dashboard metrics retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
