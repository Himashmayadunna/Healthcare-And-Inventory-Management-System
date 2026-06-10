import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { appointmentRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Receptionist', 'Doctor']), AppointmentController.getAll);
router.get('/:id', authenticateToken, idParamCheck, AppointmentController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Receptionist']), appointmentRules, AppointmentController.create);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Receptionist', 'Doctor']), idParamCheck, appointmentRules, AppointmentController.update);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), idParamCheck, AppointmentController.delete);

export default router;
