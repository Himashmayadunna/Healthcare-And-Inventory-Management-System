"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const supplier_service_1 = require("../services/supplier.service");
const response_1 = require("../utils/response");
class SupplierController {
    static async getAll(req, res, next) {
        try {
            const data = await supplier_service_1.SupplierService.getAll();
            (0, response_1.sendSuccess)(res, 'Suppliers retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await supplier_service_1.SupplierService.getById(id);
            (0, response_1.sendSuccess)(res, `Supplier details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await supplier_service_1.SupplierService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Supplier created successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await supplier_service_1.SupplierService.update(id, req.body);
            (0, response_1.sendSuccess)(res, `Supplier for ID ${id} updated.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await supplier_service_1.SupplierService.delete(id);
            (0, response_1.sendSuccess)(res, `Supplier for ID ${id} deleted successfully.`, null);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SupplierController = SupplierController;
