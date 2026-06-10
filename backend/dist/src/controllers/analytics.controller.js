"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const response_1 = require("../utils/response");
class AnalyticsController {
    /**
     * Fetch system reports.
     */
    static async getAnalytics(req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getAnalyticsData();
            (0, response_1.sendSuccess)(res, 'Analytics reporting data compiled successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
