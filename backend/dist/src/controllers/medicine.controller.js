"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineController = void 0;
const medicine_service_1 = require("../services/medicine.service");
const response_1 = require("../utils/response");
class MedicineController {
    static async getAll(req, res, next) {
        try {
            const data = await medicine_service_1.MedicineService.getAll();
            (0, response_1.sendSuccess)(res, 'Medicines retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await medicine_service_1.MedicineService.getById(id);
            (0, response_1.sendSuccess)(res, `Medicine details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await medicine_service_1.MedicineService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Medicine created successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await medicine_service_1.MedicineService.update(id, req.body);
            (0, response_1.sendSuccess)(res, `Medicine details for ID ${id} updated.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await medicine_service_1.MedicineService.delete(id);
            (0, response_1.sendSuccess)(res, `Medicine with ID ${id} deleted successfully.`, null);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MedicineController = MedicineController;
