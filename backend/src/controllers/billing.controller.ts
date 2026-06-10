import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';
import { sendSuccess } from '../utils/response';

export class BillingController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await BillingService.getAll();
      sendSuccess(res, 'Invoices retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await BillingService.getById(id);
      sendSuccess(res, `Invoice details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await BillingService.create(req.body);
      sendSuccess(res, 'Invoice generated successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }
}
