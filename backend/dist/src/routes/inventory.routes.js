"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const rules_1 = require("../validators/rules");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Retrieve low stock alerts - must be registered BEFORE /:id
router.get('/alerts', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Pharmacist']), inventory_controller_1.InventoryController.getLowStockAlerts);
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Pharmacist']), inventory_controller_1.InventoryController.getAll);
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Pharmacist']), rules_1.idParamCheck, inventory_controller_1.InventoryController.getById);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Pharmacist']), rules_1.inventoryRules, inventory_controller_1.InventoryController.create);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Pharmacist']), rules_1.idParamCheck, rules_1.inventoryRules, inventory_controller_1.InventoryController.update);
exports.default = router;
