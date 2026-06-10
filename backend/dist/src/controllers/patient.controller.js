"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const patient_service_1 = require("../services/patient.service");
const response_1 = require("../utils/response");
class PatientController {
    static async getAll(req, res, next) {
        try {
            const data = await patient_service_1.PatientService.getAll();
            (0, response_1.sendSuccess)(res, 'Patients list retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await patient_service_1.PatientService.getById(id);
            (0, response_1.sendSuccess)(res, `Patient details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await patient_service_1.PatientService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Patient record created successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await patient_service_1.PatientService.update(id, req.body);
            (0, response_1.sendSuccess)(res, `Patient record for ID ${id} updated.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await patient_service_1.PatientService.delete(id);
            (0, response_1.sendSuccess)(res, `Patient record for ID ${id} deleted successfully.`, null);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PatientController = PatientController;
