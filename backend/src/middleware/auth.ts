import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserPayload } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'medilex_jwt_secret_key_2026_secure';

/**
 * Middleware to authenticate client request via JWT Bearer Token.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return next(new UnauthorizedError('Access token is missing. Please log in.'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new ForbiddenError('Invalid or expired access token.'));
    }
    
    // Attach decoded user payload to the request
    (req as AuthenticatedRequest).user = decoded as UserPayload;
    next();
  });
};

/**
 * Middleware to authorize the request based on the user's role.
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new UnauthorizedError('User session not authenticated.'));
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return next(new ForbiddenError('Access Denied. You do not have the required permissions.'));
    }

    next();
  };
};
