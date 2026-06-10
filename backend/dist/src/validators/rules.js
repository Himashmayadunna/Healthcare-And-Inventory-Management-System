"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamCheck = exports.paymentRules = exports.invoiceRules = exports.supplierRules = exports.inventoryRules = exports.medicineRules = exports.prescriptionRules = exports.appointmentRules = exports.doctorRules = exports.patientRules = exports.loginRules = exports.validateResult = void 0;
const express_validator_1 = require("express-validator");
const response_1 = require("../utils/response");
/**
 * Middleware to intercept validation results and respond with detailed errors.
 */
const validateResult = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, response_1.sendError)(res, 'Validation failed for request parameter(s).', errors.array(), 400);
        return;
    }
    next();
};
exports.validateResult = validateResult;
/**
 * Authentication Rules
 */
exports.loginRules = [
    (0, express_validator_1.body)('username').trim().notEmpty().withMessage('Username is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    exports.validateResult,
];
/**
 * Patient Rules
 */
exports.patientRules = [
    (0, express_validator_1.body)('full_name').trim().notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    (0, express_validator_1.body)('dob').isISO8601().toDate().withMessage('Date of birth must be a valid ISO8601 date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('blood_group').optional({ nullable: true }).trim().isLength({ max: 5 }).withMessage('Blood group must be max 5 chars'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('email').optional({ nullable: true }).trim().isEmail().withMessage('Must be a valid email address'),
    (0, express_validator_1.body)('address').optional({ nullable: true }).trim().isLength({ max: 255 }).withMessage('Address must be max 255 chars'),
    exports.validateResult,
];
/**
 * Doctor Rules
 */
exports.doctorRules = [
    (0, express_validator_1.body)('doctor_name').trim().notEmpty().withMessage('Doctor name is required'),
    (0, express_validator_1.body)('specialization').trim().notEmpty().withMessage('Specialization is required'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Must be a valid email address'),
    (0, express_validator_1.body)('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
    (0, express_validator_1.body)('availability').trim().notEmpty().withMessage('Availability details are required'),
    exports.validateResult,
];
/**
 * Appointment Rules
 */
exports.appointmentRules = [
    (0, express_validator_1.body)('patient_id').isInt({ min: 1 }).withMessage('Valid Patient ID is required'),
    (0, express_validator_1.body)('doctor_id').isInt({ min: 1 }).withMessage('Valid Doctor ID is required'),
    (0, express_validator_1.body)('appointment_date').isISO8601().toDate().withMessage('Appointment date must be a valid date'),
    (0, express_validator_1.body)('appointment_time').matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Appointment time must be in HH:MM or HH:MM:SS format'),
    (0, express_validator_1.body)('status').optional().isIn(['Pending', 'Confirmed', 'Completed', 'Cancelled']).withMessage('Status must be Pending, Confirmed, Completed, or Cancelled'),
    (0, express_validator_1.body)('notes').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    exports.validateResult,
];
/**
 * Prescription Rules
 */
exports.prescriptionRules = [
    (0, express_validator_1.body)('patient_id').isInt({ min: 1 }).withMessage('Valid Patient ID is required'),
    (0, express_validator_1.body)('doctor_id').isInt({ min: 1 }).withMessage('Valid Doctor ID is required'),
    (0, express_validator_1.body)('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    (0, express_validator_1.body)('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required in the prescription'),
    (0, express_validator_1.body)('medicines.*.medicine_id').isInt({ min: 1 }).withMessage('Valid Medicine ID is required'),
    (0, express_validator_1.body)('medicines.*.dosage').trim().notEmpty().withMessage('Dosage is required for each medicine'),
    (0, express_validator_1.body)('medicines.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for each medicine'),
    (0, express_validator_1.body)('medicines.*.duration').trim().notEmpty().withMessage('Duration is required for each medicine'),
    exports.validateResult,
];
/**
 * Medicine Rules
 */
exports.medicineRules = [
    (0, express_validator_1.body)('medicine_name').trim().notEmpty().withMessage('Medicine name is required'),
    (0, express_validator_1.body)('generic_name').trim().notEmpty().withMessage('Generic name is required'),
    (0, express_validator_1.body)('category').trim().notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative decimal'),
    exports.validateResult,
];
/**
 * Inventory Rules
 */
exports.inventoryRules = [
    (0, express_validator_1.body)('medicine_id').isInt({ min: 1 }).withMessage('Valid Medicine ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    (0, express_validator_1.body)('expiry_date').isISO8601().toDate().withMessage('Expiry date must be a valid date'),
    (0, express_validator_1.body)('supplier_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid Supplier ID is required'),
    (0, express_validator_1.body)('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
    exports.validateResult,
];
/**
 * Supplier Rules
 */
exports.supplierRules = [
    (0, express_validator_1.body)('supplier_name').trim().notEmpty().withMessage('Supplier name is required'),
    (0, express_validator_1.body)('contact_person').optional({ nullable: true }).trim(),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('email').optional({ nullable: true }).trim().isEmail().withMessage('Must be a valid email address'),
    (0, express_validator_1.body)('address').optional({ nullable: true }).trim(),
    exports.validateResult,
];
/**
 * Invoice Rules
 */
exports.invoiceRules = [
    (0, express_validator_1.body)('patient_id').isInt({ min: 1 }).withMessage('Valid Patient ID is required'),
    (0, express_validator_1.body)('appointment_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid Appointment ID is required'),
    (0, express_validator_1.body)('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    (0, express_validator_1.body)('due_date').isISO8601().toDate().withMessage('Due date must be a valid date'),
    exports.validateResult,
];
/**
 * Payment Rules
 */
exports.paymentRules = [
    (0, express_validator_1.body)('invoice_id').isInt({ min: 1 }).withMessage('Valid Invoice ID is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    (0, express_validator_1.body)('payment_method').isIn(['Cash', 'Card', 'Online']).withMessage('Payment method must be Cash, Card, or Online'),
    exports.validateResult,
];
/**
 * ID Parameter Check Utility
 */
exports.idParamCheck = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Valid numeric ID is required in url parameter'),
    exports.validateResult,
];
