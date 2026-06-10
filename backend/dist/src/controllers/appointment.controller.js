"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const response_1 = require("../utils/response");
class AppointmentController {
    static async getAll(req, res, next) {
        try {
            const data = await appointment_service_1.AppointmentService.getAll();
            (0, response_1.sendSuccess)(res, 'Appointments retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await appointment_service_1.AppointmentService.getById(id);
            (0, response_1.sendSuccess)(res, `Appointment details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await appointment_service_1.AppointmentService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Appointment scheduled successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await appointment_service_1.AppointmentService.update(id, req.body);
            (0, response_1.sendSuccess)(res, `Appointment #${id} updated successfully.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await appointment_service_1.AppointmentService.delete(id);
            (0, response_1.sendSuccess)(res, `Appointment #${id} deleted successfully.`, null);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AppointmentController = AppointmentController;
