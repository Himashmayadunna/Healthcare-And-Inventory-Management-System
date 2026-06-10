"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.HttpError = void 0;
/**
 * Custom base class for HTTP errors.
 */
class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends HttpError {
    constructor(message = 'Internal Server Error') {
        super(500, message);
    }
}
exports.InternalServerError = InternalServerError;
