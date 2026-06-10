import { Request } from 'express';

export interface UserPayload {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Receptionist' | 'Doctor' | 'Pharmacist';
}

/**
 * Custom request interface containing the authenticated user session.
 */
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
