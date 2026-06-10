import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { prescriptionRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Doctor', 'Pharmacist']), PrescriptionController.getAll);
router.get('/:id', authenticateToken, idParamCheck, PrescriptionController.getById);
router.post('/', authenticateToken, authorizeRole(['Doctor']), prescriptionRules, PrescriptionController.create);

export default router;
