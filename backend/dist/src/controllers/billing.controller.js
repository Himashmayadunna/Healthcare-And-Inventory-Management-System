"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const billing_service_1 = require("../services/billing.service");
const response_1 = require("../utils/response");
class BillingController {
    static async getAll(req, res, next) {
        try {
            const data = await billing_service_1.BillingService.getAll();
            (0, response_1.sendSuccess)(res, 'Invoices retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await billing_service_1.BillingService.getById(id);
            (0, response_1.sendSuccess)(res, `Invoice details for ID ${id} retrieved.`, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await billing_service_1.BillingService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Invoice generated successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BillingController = BillingController;
