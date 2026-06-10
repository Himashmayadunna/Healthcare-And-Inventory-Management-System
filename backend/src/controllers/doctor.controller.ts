import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service';
import { sendSuccess } from '../utils/response';

export class DoctorController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DoctorService.getAll();
      sendSuccess(res, 'Doctors list retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await DoctorService.getById(id);
      sendSuccess(res, `Doctor details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DoctorService.create(req.body);
      sendSuccess(res, 'Doctor record created successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await DoctorService.update(id, req.body);
      sendSuccess(res, `Doctor record for ID ${id} updated.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await DoctorService.delete(id);
      sendSuccess(res, `Doctor record for ID ${id} deleted successfully.`, null);
    } catch (error) {
      next(error);
    }
  }
}
