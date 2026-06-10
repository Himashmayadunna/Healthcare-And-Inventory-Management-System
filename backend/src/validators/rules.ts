import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { sendError } from '../utils/response';

/**
 * Middleware to intercept validation results and respond with detailed errors.
 */
export const validateResult = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'Validation failed for request parameter(s).', errors.array(), 400);
    return;
  }
  next();
};

/**
 * Authentication Rules
 */
export const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResult,
];

/**
 * Patient Rules
 */
export const patientRules = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('dob').isISO8601().toDate().withMessage('Date of birth must be a valid ISO8601 date (YYYY-MM-DD)'),
  body('blood_group').optional({ nullable: true }).trim().isLength({ max: 5 }).withMessage('Blood group must be max 5 chars'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional({ nullable: true }).trim().isEmail().withMessage('Must be a valid email address'),
  body('address').optional({ nullable: true }).trim().isLength({ max: 255 }).withMessage('Address must be max 255 chars'),
  validateResult,
];

/**
 * Doctor Rules
 */
export const doctorRules = [
  body('doctor_name').trim().notEmpty().withMessage('Doctor name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').trim().isEmail().withMessage('Must be a valid email address'),
  body('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
  body('availability').trim().notEmpty().withMessage('Availability details are required'),
  validateResult,
];

/**
 * Appointment Rules
 */
export const appointmentRules = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid Patient ID is required'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Valid Doctor ID is required'),
  body('appointment_date').isISO8601().toDate().withMessage('Appointment date must be a valid date'),
  body('appointment_time').matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Appointment time must be in HH:MM or HH:MM:SS format'),
  body('status').optional().isIn(['Pending', 'Confirmed', 'Completed', 'Cancelled']).withMessage('Status must be Pending, Confirmed, Completed, or Cancelled'),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  validateResult,
];

/**
 * Prescription Rules
 */
export const prescriptionRules = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid Patient ID is required'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Valid Doctor ID is required'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required in the prescription'),
  body('medicines.*.medicine_id').isInt({ min: 1 }).withMessage('Valid Medicine ID is required'),
  body('medicines.*.dosage').trim().notEmpty().withMessage('Dosage is required for each medicine'),
  body('medicines.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for each medicine'),
  body('medicines.*.duration').trim().notEmpty().withMessage('Duration is required for each medicine'),
  validateResult,
];

/**
 * Medicine Rules
 */
export const medicineRules = [
  body('medicine_name').trim().notEmpty().withMessage('Medicine name is required'),
  body('generic_name').trim().notEmpty().withMessage('Generic name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative decimal'),
  validateResult,
];

/**
 * Inventory Rules
 */
export const inventoryRules = [
  body('medicine_id').isInt({ min: 1 }).withMessage('Valid Medicine ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('expiry_date').isISO8601().toDate().withMessage('Expiry date must be a valid date'),
  body('supplier_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid Supplier ID is required'),
  body('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
  validateResult,
];

/**
 * Supplier Rules
 */
export const supplierRules = [
  body('supplier_name').trim().notEmpty().withMessage('Supplier name is required'),
  body('contact_person').optional({ nullable: true }).trim(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional({ nullable: true }).trim().isEmail().withMessage('Must be a valid email address'),
  body('address').optional({ nullable: true }).trim(),
  validateResult,
];

/**
 * Invoice Rules
 */
export const invoiceRules = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid Patient ID is required'),
  body('appointment_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid Appointment ID is required'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('due_date').isISO8601().toDate().withMessage('Due date must be a valid date'),
  validateResult,
];

/**
 * Payment Rules
 */
export const paymentRules = [
  body('invoice_id').isInt({ min: 1 }).withMessage('Valid Invoice ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('payment_method').isIn(['Cash', 'Card', 'Online']).withMessage('Payment method must be Cash, Card, or Online'),
  validateResult,
];

/**
 * ID Parameter Check Utility
 */
export const idParamCheck = [
  param('id').isInt({ min: 1 }).withMessage('Valid numeric ID is required in url parameter'),
  validateResult,
];
