import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Receptionist', 'Doctor', 'Pharmacist']), DashboardController.getDashboard);

export default router;
