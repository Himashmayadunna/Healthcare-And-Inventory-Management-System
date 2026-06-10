"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
/**
 * Express error-handling middleware.
 */
const errorHandler = (err, req, res, next) => {
    // Check if it's a known HTTP error
    if (err instanceof errors_1.HttpError) {
        (0, response_1.sendError)(res, err.message, undefined, err.statusCode);
        return;
    }
    // Handle express-validator or similar structured array error responses
    if ('errors' in err && Array.isArray(err.errors)) {
        (0, response_1.sendError)(res, err.message, err.errors, 400);
        return;
    }
    // Log unexpected errors
    console.error('[Unhandled Exception]:', err);
    // Default to 500 Internal Server Error
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;
    (0, response_1.sendError)(res, message, undefined, 500);
};
exports.errorHandler = errorHandler;
