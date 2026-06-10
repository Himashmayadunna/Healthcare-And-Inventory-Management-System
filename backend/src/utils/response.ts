import { Response } from 'express';

/**
 * Standardized success response structure.
 */
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

/**
 * Standardized error response structure.
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

/**
 * Send a standardized success JSON response.
 */
export const sendSuccess = <T>(res: Response, message: string, data: T, statusCode: number = 200): Response => {
  const responsePayload: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responsePayload);
};

/**
 * Send a standardized error JSON response.
 */
export const sendError = (res: Response, message: string, errors?: any, statusCode: number = 500): Response => {
  const responsePayload: ErrorResponse = {
    success: false,
    message,
  };
  if (errors !== undefined) {
    responsePayload.errors = errors;
  }
  return res.status(statusCode).json(responsePayload);
};
