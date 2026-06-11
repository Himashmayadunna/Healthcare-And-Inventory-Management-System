-- MediLex Seed Data Script
-- Default password for all users: password123
-- Bcrypt hash: $2a$10$7R9Mv6N34hVnC4w3H1n5ke8/aD2Bq/W.H4fG3YnC8hQ3aG2q5.VWy

-- Clear tables first in reverse dependency order
DELETE FROM dbo.RecentActivities;
DELETE FROM dbo.Payments;
DELETE FROM dbo.Invoices;
DELETE FROM dbo.Prescription_Items;
DELETE FROM dbo.Prescriptions;
DELETE FROM dbo.Inventory;
DELETE FROM dbo.Medicines;
DELETE FROM dbo.Suppliers;
DELETE FROM dbo.Appointments;
DELETE FROM dbo.Doctors;
DELETE FROM dbo.Patients;
DELETE FROM dbo.Users;

-- Insert Users (password: password123)
INSERT INTO dbo.Users (username, password_hash, email, full_name, role) VALUES
('admin', '$2a$10$UuRzYQgoVd9gNCGnjgTB3O3zNrUQ2Fytlwyj7JpGQoCZnPTsj71US', 'admin@medilex.com', 'Alex Mercer', 'Admin'),
('receptionist', '$2a$10$UuRzYQgoVd9gNCGnjgTB3O3zNrUQ2Fytlwyj7JpGQoCZnPTsj71US', 'receptionist@medilex.com', 'Sarah Jenkins', 'Receptionist'),
('doctor', '$2a$10$UuRzYQgoVd9gNCGnjgTB3O3zNrUQ2Fytlwyj7JpGQoCZnPTsj71US', 'doctor@medilex.com', 'Dr. Gregory House', 'Doctor'),
('pharmacist', '$2a$10$UuRzYQgoVd9gNCGnjgTB3O3zNrUQ2Fytlwyj7JpGQoCZnPTsj71US', 'pharmacist@medilex.com', 'John Doe', 'Pharmacist');

-- Insert Patients
INSERT INTO dbo.Patients (full_name, gender, dob, blood_group, phone, email, address) VALUES
('Bruce Wayne', 'Male', '1985-02-19', 'O+', '+1-555-0199', 'bruce@waynecorp.com', '1007 Mountain Drive, Gotham'),
('Diana Prince', 'Female', '1988-11-10', 'AB+', '+1-555-0188', 'diana@themyscira.gov', 'Gateway City Historical Museum'),
('Peter Parker', 'Male', '2001-08-10', 'A-', '+1-555-0177', 'peter.parker@midtownhigh.edu', '20 Ingram St, Queens, NY'),
('Clark Kent', 'Male', '1982-06-18', 'O-', '+1-555-0166', 'clark.kent@dailyplanet.com', '344 Clinton St, Metropolis');

-- Insert Doctors (Dr. House links to the user with ID 3)
INSERT INTO dbo.Doctors (user_id, doctor_name, specialization, phone, email, consultation_fee, availability) VALUES
(3, 'Dr. Gregory House', 'Diagnostic Medicine', '+1-555-1001', 'house@medilex.com', 250.00, 'Monday-Friday: 10:00 AM - 4:00 PM'),
(NULL, 'Dr. Stephen Strange', 'Neurosurgery', '+1-555-1002', 'strange@medilex.com', 400.00, 'Monday, Wednesday: 9:00 AM - 2:00 PM'),
(NULL, 'Dr. Beverly Crusher', 'General Medicine', '+1-555-1003', 'crusher@medilex.com', 150.00, 'Tuesday, Thursday: 8:00 AM - 6:00 PM');

-- Insert Appointments
INSERT INTO dbo.Appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES
(1, 1, CAST(GETDATE() AS DATE), '10:30:00', 'Confirmed', 'Routine physical checkup'),
(2, 2, CAST(GETDATE() AS DATE), '11:15:00', 'Completed', 'Post-surgery review'),
(3, 1, CAST(DATEADD(day, 1, GETDATE()) AS DATE), '14:00:00', 'Pending', 'Persistent joint pain review'),
(4, 3, CAST(DATEADD(day, 2, GETDATE()) AS DATE), '09:00:00', 'Cancelled', 'Rescheduling requested');

-- Insert Suppliers
INSERT INTO dbo.Suppliers (supplier_name, contact_person, phone, email, address) VALUES
('Acme Pharma Industries', 'Wile E. Coyote', '+1-800-555-0100', 'acme@pharma.com', '123 Desert Road, AZ'),
('Stark Medical Solutions', 'Pepper Potts', '+1-800-555-0200', 'pepper@starkmed.com', 'Stark Tower, New York'),
('Wayne Biotech', 'Lucius Fox', '+1-800-555-0300', 'lucius@waynebiotech.com', 'Research Lab, Gotham');

-- Insert Medicines
INSERT INTO dbo.Medicines (medicine_name, generic_name, category, price) VALUES
('Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotic', 15.50),
('Lipitor 20mg', 'Atorvastatin Calcium', 'Cardiovascular', 45.00),
('Panadol Extra', 'Paracetamol / Caffeine', 'Analgesic', 5.20),
('Albuterol Inhaler', 'Albuterol Sulfate', 'Respiratory', 35.00),
('Insulin Humalog', 'Insulin Lispro', 'Diabetes', 120.00);

-- Insert Inventory
INSERT INTO dbo.Inventory (medicine_id, quantity, expiry_date, supplier_id, reorder_level) VALUES
(1, 150, '2027-12-31', 1, 30),
(2, 8, '2028-06-30', 2, 15), -- Low stock alert triggers (8 <= 15)
(3, 500, '2027-01-15', 1, 50),
(4, 5, '2026-11-30', 3, 10), -- Low stock alert triggers (5 <= 10)
(5, 30, '2027-09-15', 2, 8);

-- Insert Prescriptions
INSERT INTO dbo.Prescriptions (patient_id, doctor_id, diagnosis) VALUES
(2, 2, 'Chronic lumbar disc displacement recovery review'),
(1, 1, 'Mild fatigue and vitamin deficiency');

-- Insert Prescription Items
INSERT INTO dbo.Prescription_Items (prescription_id, medicine_id, dosage, quantity, duration) VALUES
(1, 3, '1 pill every 8 hours', 15, '5 Days'),
(1, 2, '1 pill at bedtime', 30, '30 Days'),
(2, 1, '1 pill twice daily', 10, '5 Days');

-- Insert Invoices
INSERT INTO dbo.Invoices (patient_id, appointment_id, total_amount, status, due_date) VALUES
(1, 1, 250.00, 'Pending', CAST(GETDATE() AS DATE)),
(2, 2, 400.00, 'Paid', CAST(DATEADD(day, -5, GETDATE()) AS DATE)),
(3, 3, 250.00, 'Pending', CAST(DATEADD(day, 7, GETDATE()) AS DATE));

-- Insert Payments (linked to Paid invoice ID 2)
INSERT INTO dbo.Payments (invoice_id, amount, payment_date, payment_method) VALUES
(2, 400.00, DATEADD(day, -5, GETDATE()), 'Card');

-- Insert Recent Activities (Audit trail)
INSERT INTO dbo.RecentActivities (user_id, action, description) VALUES
(1, 'User Seeding', 'Initialized default administration setup and seeded sample tables'),
(3, 'Appointment Completed', 'Completed appointment with Diana Prince'),
(1, 'Billing Generated', 'Created invoice #2 for Diana Prince of amount $400.00'),
(2, 'Payment Received', 'Processed Card payment of $400.00 for Invoice #2');
