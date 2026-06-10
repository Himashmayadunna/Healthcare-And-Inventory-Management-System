"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const response_1 = require("../utils/response");
class InventoryController {
    static async getAll(req, res, next) {
        try {
            const data = await inventory_service_1.InventoryService.getAll();
            (0, response_1.sendSuccess)(res, 'Inventory batches retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await inventory_service_1.InventoryService.getById(id);
            (0, response_1.sendSuccess)(res, `Inventory batch for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await inventory_service_1.InventoryService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Inventory batch registered successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await inventory_service_1.InventoryService.update(id, req.body);
            (0, response_1.sendSuccess)(res, `Inventory batch #${id} updated successfully.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getLowStockAlerts(req, res, next) {
        try {
            const data = await inventory_service_1.InventoryService.getLowStockAlerts();
            (0, response_1.sendSuccess)(res, 'Low stock alerts fetched successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InventoryController = InventoryController;
