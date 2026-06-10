import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  /**
   * Log in user and generate JWT token.
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login(username, password);
      sendSuccess(res, 'Login successful.', data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log out user session.
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In JWT authentication, logout is primarily handled client-side by deleting the token.
      // We return a standard success response confirming token invalidation instructions.
      sendSuccess(res, 'Logout successful. Please delete your local access token.', null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve current user profile.
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        throw new UnauthorizedError('User session not authenticated.');
      }
      
      const data = await AuthService.getProfile(authReq.user.userId);
      sendSuccess(res, 'Profile retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }
}
