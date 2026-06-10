import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess } from '../utils/response';

export class InventoryController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await InventoryService.getAll();
      sendSuccess(res, 'Inventory batches retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await InventoryService.getById(id);
      sendSuccess(res, `Inventory batch for ID ${id} retrieved.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await InventoryService.create(req.body);
      sendSuccess(res, 'Inventory batch registered successfully.', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await InventoryService.update(id, req.body);
      sendSuccess(res, `Inventory batch #${id} updated successfully.`, data);
    } catch (error) {
      next(error);
    }
  }

  static async getLowStockAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await InventoryService.getLowStockAlerts();
      sendSuccess(res, 'Low stock alerts fetched successfully.', data);
    } catch (error) {
      next(error);
    }
  }
}
