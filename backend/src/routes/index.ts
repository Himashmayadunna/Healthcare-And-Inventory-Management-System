import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import patientRoutes from './patient.routes';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import prescriptionRoutes from './prescription.routes';
import medicineRoutes from './medicine.routes';
import inventoryRoutes from './inventory.routes';
import supplierRoutes from './supplier.routes';
import billingRoutes from './billing.routes';
import paymentRoutes from './payment.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// Mount all API endpoints
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/medicines', medicineRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/invoices', billingRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
