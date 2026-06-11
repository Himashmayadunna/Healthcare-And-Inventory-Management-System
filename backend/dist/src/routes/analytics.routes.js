"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRole)(['Admin', 'Receptionist', 'Doctor', 'Pharmacist']), analytics_controller_1.AnalyticsController.getAnalytics);
exports.default = router;
