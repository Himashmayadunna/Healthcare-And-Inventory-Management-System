import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { patientRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, PatientController.getAll);
router.get('/:id', authenticateToken, idParamCheck, PatientController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Receptionist', 'Doctor']), patientRules, PatientController.create);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Receptionist', 'Doctor']), idParamCheck, patientRules, PatientController.update);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), idParamCheck, PatientController.delete);

export default router;
