import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { sendSuccess } from '../utils/response';

export class AppointmentController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AppointmentService.getAll();
      sendSuccess(res, 'Appointments retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await AppointmentService.getById(id);
      sendSuccess(res, `Appointment details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AppointmentService.create(req.body);
      sendSuccess(res, 'Appointment scheduled successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await AppointmentService.update(id, req.body);
      sendSuccess(res, `Appointment #${id} updated successfully.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await AppointmentService.delete(id);
      sendSuccess(res, `Appointment #${id} deleted successfully.`, null);
    } catch (error) {
      next(error);
    }
  }
}
