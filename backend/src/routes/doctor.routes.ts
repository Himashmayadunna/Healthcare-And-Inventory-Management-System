import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { doctorRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, DoctorController.getAll);
router.get('/:id', authenticateToken, idParamCheck, DoctorController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin']), doctorRules, DoctorController.create);
router.put('/:id', authenticateToken, authorizeRole(['Admin']), idParamCheck, doctorRules, DoctorController.update);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), idParamCheck, DoctorController.delete);

export default router;
