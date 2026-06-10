import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplier.service';
import { sendSuccess } from '../utils/response';

export class SupplierController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await SupplierService.getAll();
      sendSuccess(res, 'Suppliers retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await SupplierService.getById(id);
      sendSuccess(res, `Supplier details for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await SupplierService.create(req.body);
      sendSuccess(res, 'Supplier created successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await SupplierService.update(id, req.body);
      sendSuccess(res, `Supplier for ID ${id} updated.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await SupplierService.delete(id);
      sendSuccess(res, `Supplier for ID ${id} deleted successfully.`, null);
    } catch (error) {
      next(error);
    }
  }
}
