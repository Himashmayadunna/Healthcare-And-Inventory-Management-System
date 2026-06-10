import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { supplierRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), SupplierController.getAll);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), idParamCheck, SupplierController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), supplierRules, SupplierController.create);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), idParamCheck, supplierRules, SupplierController.update);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), idParamCheck, SupplierController.delete);

export default router;
