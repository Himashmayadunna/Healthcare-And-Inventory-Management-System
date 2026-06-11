-- MediLex Database Schema Creation Script

-- Drop foreign keys first to allow dropping tables safely
IF OBJECT_ID('dbo.RecentActivities', 'U') IS NOT NULL DROP TABLE dbo.RecentActivities;
IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID('dbo.Invoices', 'U') IS NOT NULL DROP TABLE dbo.Invoices;
IF OBJECT_ID('dbo.Prescription_Items', 'U') IS NOT NULL DROP TABLE dbo.Prescription_Items;
IF OBJECT_ID('dbo.Prescriptions', 'U') IS NOT NULL DROP TABLE dbo.Prescriptions;
IF OBJECT_ID('dbo.Inventory', 'U') IS NOT NULL DROP TABLE dbo.Inventory;
IF OBJECT_ID('dbo.Medicines', 'U') IS NOT NULL DROP TABLE dbo.Medicines;
IF OBJECT_ID('dbo.Suppliers', 'U') IS NOT NULL DROP TABLE dbo.Suppliers;
IF OBJECT_ID('dbo.Appointments', 'U') IS NOT NULL DROP TABLE dbo.Appointments;
IF OBJECT_ID('dbo.Doctors', 'U') IS NOT NULL DROP TABLE dbo.Doctors;
IF OBJECT_ID('dbo.Patients', 'U') IS NOT NULL DROP TABLE dbo.Patients;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;

-- 1. Users Table (Admin, Receptionist, Doctor, Pharmacist)
CREATE TABLE dbo.Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Receptionist', 'Doctor', 'Pharmacist')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 2. Patients Table
CREATE TABLE dbo.Patients (
    patient_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE NOT NULL,
    blood_group VARCHAR(5) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    address VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 3. Doctors Table
CREATE TABLE dbo.Doctors (
    doctor_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE SET NULL,
    doctor_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    availability VARCHAR(255) NOT NULL, -- e.g. "Monday-Friday: 9:00 AM - 5:00 PM"
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 4. Appointments Table
CREATE TABLE dbo.Appointments (
    appointment_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Patients(patient_id) ON DELETE CASCADE,
    doctor_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Doctors(doctor_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')) DEFAULT 'Pending',
    notes VARCHAR(500) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 5. Suppliers Table
CREATE TABLE dbo.Suppliers (
    supplier_id INT IDENTITY(1,1) PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    address VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 6. Medicines Table
CREATE TABLE dbo.Medicines (
    medicine_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 7. Inventory Table
CREATE TABLE dbo.Inventory (
    inventory_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Medicines(medicine_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    supplier_id INT NULL FOREIGN KEY REFERENCES dbo.Suppliers(supplier_id) ON DELETE SET NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 8. Prescriptions Table
CREATE TABLE dbo.Prescriptions (
    prescription_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Patients(patient_id) ON DELETE CASCADE,
    doctor_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Doctors(doctor_id) ON DELETE CASCADE,
    diagnosis VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 9. Prescription Items Table
CREATE TABLE dbo.Prescription_Items (
    prescription_item_id INT IDENTITY(1,1) PRIMARY KEY,
    prescription_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Medicines(medicine_id) ON DELETE CASCADE,
    dosage VARCHAR(100) NOT NULL, -- e.g. "1-0-1" or "Take 1 pill after meals"
    quantity INT NOT NULL CHECK (quantity > 0),
    duration VARCHAR(50) NOT NULL -- e.g. "5 Days"
);

-- 10. Invoices Table
CREATE TABLE dbo.Invoices (
    invoice_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Patients(patient_id) ON DELETE CASCADE,
    appointment_id INT NULL FOREIGN KEY REFERENCES dbo.Appointments(appointment_id),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Paid', 'Cancelled')) DEFAULT 'Pending',
    due_date DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 11. Payments Table
CREATE TABLE dbo.Payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL FOREIGN KEY REFERENCES dbo.Invoices(invoice_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATETIME DEFAULT GETDATE(),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Online'))
);

-- 12. Recent Activities Table (Audit log for dashboard)
CREATE TABLE dbo.RecentActivities (
    activity_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
