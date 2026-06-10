import { Request, Response, NextFunction } from 'express';
import { PrescriptionService } from '../services/prescription.service';
import { sendSuccess } from '../utils/response';

export class PrescriptionController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PrescriptionService.getAll();
      sendSuccess(res, 'Prescriptions list retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await PrescriptionService.getById(id);
      sendSuccess(res, `Prescription details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PrescriptionService.create(req.body);
      sendSuccess(res, 'Prescription issued successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }
}
