import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';
import { sendError } from '../utils/response';

/**
 * Express error-handling middleware.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if it's a known HTTP error
  if (err instanceof HttpError) {
    sendError(res, err.message, undefined, err.statusCode);
    return;
  }

  // Handle express-validator or similar structured array error responses
  if ('errors' in err && Array.isArray((err as any).errors)) {
    sendError(res, err.message, (err as any).errors, 400);
    return;
  }

  // Log unexpected errors
  console.error('[Unhandled Exception]:', err);

  // Default to 500 Internal Server Error
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
    
  sendError(res, message, undefined, 500);
};
