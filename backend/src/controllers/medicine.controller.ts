import { Request, Response, NextFunction } from 'express';
import { MedicineService } from '../services/medicine.service';
import { sendSuccess } from '../utils/response';

export class MedicineController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MedicineService.getAll();
      sendSuccess(res, 'Medicines retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await MedicineService.getById(id);
      sendSuccess(res, `Medicine details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MedicineService.create(req.body);
      sendSuccess(res, 'Medicine created successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await MedicineService.update(id, req.body);
      sendSuccess(res, `Medicine details for ID ${id} updated.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await MedicineService.delete(id);
      sendSuccess(res, `Medicine with ID ${id} deleted successfully.`, null);
    } catch (error) {
      next(error);
    }
  }
}
