"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const JWT_SECRET = process.env.JWT_SECRET || 'medilex_jwt_secret_key_2026_secure';
/**
 * Middleware to authenticate client request via JWT Bearer Token.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return next(new errors_1.UnauthorizedError('Access token is missing. Please log in.'));
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new errors_1.ForbiddenError('Invalid or expired access token.'));
        }
        // Attach decoded user payload to the request
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to authorize the request based on the user's role.
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return next(new errors_1.UnauthorizedError('User session not authenticated.'));
        }
        if (!allowedRoles.includes(authReq.user.role)) {
            return next(new errors_1.ForbiddenError('Access Denied. You do not have the required permissions.'));
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
