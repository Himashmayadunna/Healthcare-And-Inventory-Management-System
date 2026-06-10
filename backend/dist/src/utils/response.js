"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Send a standardized success JSON response.
 */
const sendSuccess = (res, message, data, statusCode = 200) => {
    const responsePayload = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(responsePayload);
};
exports.sendSuccess = sendSuccess;
/**
 * Send a standardized error JSON response.
 */
const sendError = (res, message, errors, statusCode = 500) => {
    const responsePayload = {
        success: false,
        message,
    };
    if (errors !== undefined) {
        responsePayload.errors = errors;
    }
    return res.status(statusCode).json(responsePayload);
};
exports.sendError = sendError;
