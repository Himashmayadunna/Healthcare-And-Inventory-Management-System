"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const doctor_service_1 = require("../services/doctor.service");
const response_1 = require("../utils/response");
class DoctorController {
    static async getAll(req, res, next) {
        try {
            const data = await doctor_service_1.DoctorService.getAll();
            (0, response_1.sendSuccess)(res, 'Doctors list retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await doctor_service_1.DoctorService.getById(id);
            (0, response_1.sendSuccess)(res, `Doctor details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await doctor_service_1.DoctorService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Doctor record created successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await doctor_service_1.DoctorService.update(id, req.body);
            (0, response_1.sendSuccess)(res, `Doctor record for ID ${id} updated.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await doctor_service_1.DoctorService.delete(id);
            (0, response_1.sendSuccess)(res, `Doctor record for ID ${id} deleted successfully.`, null);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DoctorController = DoctorController;
