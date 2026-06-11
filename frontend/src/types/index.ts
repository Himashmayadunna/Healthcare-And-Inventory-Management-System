export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Receptionist' | 'Doctor' | 'Pharmacist';
}

export interface Patient {
  patient_id: number;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  blood_group?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Doctor {
  doctor_id: number;
  user_id?: number | null;
  doctor_name: string;
  specialization: string;
  phone: string;
  email: string;
  consultation_fee: number;
  availability: string;
  rating?: number; // UI metadata helper
  patients_count?: number; // UI metadata helper
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  patient_name?: string;
  patient_phone?: string;
  doctor_id: number;
  doctor_name?: string;
  specialization?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string | null;
  created_at?: string;
}

export interface Medicine {
  medicine_id: number;
  medicine_name: string;
  generic_name: string;
  category: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
}

export interface InventoryItem {
  inventory_id: number;
  medicine_id: number;
  medicine_name?: string;
  generic_name?: string;
  category?: string;
  price?: number;
  quantity: number;
  expiry_date: string;
  supplier_id?: number | null;
  supplier_name?: string;
  reorder_level: number;
  created_at?: string;
  updated_at?: string;
}

export interface PrescriptionItem {
  prescription_item_id?: number;
  medicine_id: number;
  medicine_name?: string;
  generic_name?: string;
  category?: string;
  price?: number;
  dosage: string;
  quantity: number;
  duration: string;
}

export interface Prescription {
  prescription_id: number;
  patient_id: number;
  patient_name?: string;
  doctor_id: number;
  doctor_name?: string;
  doctor_specialization?: string;
  diagnosis: string;
  created_at?: string;
  medicines?: PrescriptionItem[];
}

export interface Invoice {
  invoice_id: number;
  patient_id: number;
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  appointment_id?: number | null;
  total_amount: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  due_date: string;
  created_at?: string;
  payments?: Payment[];
}

export interface Payment {
  payment_id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'Card' | 'Online';
}

export interface Activity {
  activity_id: number;
  user_id?: number | null;
  user_full_name?: string;
  action: string;
  description: string;
  created_at: string;
}

export interface DashboardData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicines: number;
  totalRevenue: number;
  lowStockCount: number;
  pendingInvoices: number;
  recentActivities: Activity[];
}

export interface AnalyticsData {
  monthlyRevenue: { month: string; revenue: number }[];
  medicineUsage: { medicine_name: string; total_quantity: number }[];
  patientVisits: { month: string; visits: number }[];
  doctorPerformance: { doctor_name: string; appointment_count: number; earnings: number }[];
  departmentDistribution: { specialization: string; doctor_count: number }[];
  inventoryUsage: { medicine_name: string; stock_quantity: number; reorder_level: number }[];
  revenueTrend: { date: string; revenue: number }[];
}
