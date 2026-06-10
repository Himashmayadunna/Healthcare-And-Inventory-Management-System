import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service';
import { sendSuccess } from '../utils/response';

export class PatientController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PatientService.getAll();
      sendSuccess(res, 'Patients list retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await PatientService.getById(id);
      sendSuccess(res, `Patient details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PatientService.create(req.body);
      sendSuccess(res, 'Patient record created successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await PatientService.update(id, req.body);
      sendSuccess(res, `Patient record for ID ${id} updated.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await PatientService.delete(id);
      sendSuccess(res, `Patient record for ID ${id} deleted successfully.`, null);
    } catch (error) {
      next(error);
    }
  }
}
