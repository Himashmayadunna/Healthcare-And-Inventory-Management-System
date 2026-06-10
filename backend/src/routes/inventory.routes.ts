import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { inventoryRules, idParamCheck } from '../validators/rules';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// Retrieve low stock alerts - must be registered BEFORE /:id
router.get('/alerts', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), InventoryController.getLowStockAlerts);

router.get('/', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), InventoryController.getAll);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), idParamCheck, InventoryController.getById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), inventoryRules, InventoryController.create);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Pharmacist']), idParamCheck, inventoryRules, InventoryController.update);

export default router;
