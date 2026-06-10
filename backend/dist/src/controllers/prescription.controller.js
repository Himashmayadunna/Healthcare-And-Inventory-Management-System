"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const prescription_service_1 = require("../services/prescription.service");
const response_1 = require("../utils/response");
class PrescriptionController {
    static async getAll(req, res, next) {
        try {
            const data = await prescription_service_1.PrescriptionService.getAll();
            (0, response_1.sendSuccess)(res, 'Prescriptions list retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await prescription_service_1.PrescriptionService.getById(id);
            (0, response_1.sendSuccess)(res, `Prescription details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await prescription_service_1.PrescriptionService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Prescription issued successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PrescriptionController = PrescriptionController;
