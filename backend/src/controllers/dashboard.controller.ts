import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  /**
   * Fetch home dashboard metrics.
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DashboardService.getDashboardData();
      sendSuccess(res, 'Dashboard metrics retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }
}
