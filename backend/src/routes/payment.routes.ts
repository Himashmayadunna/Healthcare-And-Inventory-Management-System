import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { paymentRules } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Receptionist']), PaymentController.getAll);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Receptionist']), paymentRules, PaymentController.create);

export default router;
