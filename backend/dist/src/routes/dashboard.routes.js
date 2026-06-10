"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Receptionist', 'Doctor', 'Pharmacist']), dashboard_controller_1.DashboardController.getDashboard);
exports.default = router;
