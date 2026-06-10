import { Router } from 'express';
import { MedicineController } from '../controllers/medicine.controller';
import { medicineRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, MedicineController.getAll);
router.get('/:id', authenticateToken, idParamCheck, MedicineController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), medicineRules, MedicineController.create);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), idParamCheck, medicineRules, MedicineController.update);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), idParamCheck, MedicineController.delete);

export default router;
