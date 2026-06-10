import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
  /**
   * Fetch system reports.
   */
  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getAnalyticsData();
      sendSuccess(res, 'Analytics reporting data compiled successfully.', data);
    } catch (error) {
      next(error);
    }
  }
}
