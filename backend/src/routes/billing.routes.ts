import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { invoiceRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Receptionist']), BillingController.getAll);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Receptionist']), idParamCheck, BillingController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Receptionist']), invoiceRules, BillingController.create);

export default router;
