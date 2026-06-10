import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin']), AnalyticsController.getAnalytics);

export default router;
