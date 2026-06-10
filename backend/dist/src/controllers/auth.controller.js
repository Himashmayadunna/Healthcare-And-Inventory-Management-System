"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
class AuthController {
    /**
     * Log in user and generate JWT token.
     */
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const data = await auth_service_1.AuthService.login(username, password);
            (0, response_1.sendSuccess)(res, 'Login successful.', data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Log out user session.
     */
    static async logout(req, res, next) {
        try {
            // In JWT authentication, logout is primarily handled client-side by deleting the token.
            // We return a standard success response confirming token invalidation instructions.
            (0, response_1.sendSuccess)(res, 'Logout successful. Please delete your local access token.', null);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retrieve current user profile.
     */
    static async getProfile(req, res, next) {
        try {
            const authReq = req;
            if (!authReq.user) {
                throw new errors_1.UnauthorizedError('User session not authenticated.');
            }
            const data = await auth_service_1.AuthService.getProfile(authReq.user.userId);
            (0, response_1.sendSuccess)(res, 'Profile retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
