"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const response_1 = require("../utils/response");
class PaymentController {
    static async getAll(req, res, next) {
        try {
            const data = await payment_service_1.PaymentService.getAll();
            (0, response_1.sendSuccess)(res, 'Payments logs retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const data = await payment_service_1.PaymentService.create(req.body);
            (0, response_1.sendSuccess)(res, 'Payment processed and invoice updated successfully.', data, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
