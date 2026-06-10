import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/response';

export class PaymentController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PaymentService.getAll();
      sendSuccess(res, 'Payments logs retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PaymentService.create(req.body);
      sendSuccess(res, 'Payment processed and invoice updated successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }
}
