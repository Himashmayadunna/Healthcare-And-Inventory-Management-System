import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import * as Types from '../types';

// ==========================================
// MOCK STATE DATA STORE FOR GUEST SESSIONS
// ==========================================
const mockStore: {
  patients: Types.Patient[];
  doctors: Types.Doctor[];
  appointments: Types.Appointment[];
  medicines: Types.Medicine[];
  suppliers: Types.Supplier[];
  inventory: Types.InventoryItem[];
  prescriptions: Types.Prescription[];
  invoices: Types.Invoice[];
  activities: Types.Activity[];
} = {
  patients: [
    { patient_id: 1, full_name: 'Bruce Wayne', gender: 'Male' as const, dob: '1985-02-19', blood_group: 'O+', phone: '+1-555-0199', email: 'bruce@waynecorp.com', address: '1007 Mountain Drive, Gotham' },
    { patient_id: 2, full_name: 'Diana Prince', gender: 'Female' as const, dob: '1988-11-10', blood_group: 'AB+', phone: '+1-555-0188', email: 'diana@themyscira.gov', address: 'Gateway City Historical Museum' },
    { patient_id: 3, full_name: 'Peter Parker', gender: 'Male' as const, dob: '2001-08-10', blood_group: 'A-', phone: '+1-555-0177', email: 'peter.parker@spidey.net', address: '20 Ingram St, Queens, NY' },
    { patient_id: 4, full_name: 'Clark Kent', gender: 'Male' as const, dob: '1982-06-18', blood_group: 'O-', phone: '+1-555-0166', email: 'clark.kent@dailyplanet.com', address: '344 Clinton St, Metropolis' },
    { patient_id: 5, full_name: 'Emma Watson', gender: 'Female' as const, dob: '1990-04-15', blood_group: 'B+', phone: '+1-555-0211', email: 'emma@watson.co.uk', address: 'London, UK' },
    { patient_id: 6, full_name: 'David Smith', gender: 'Male' as const, dob: '1959-12-05', blood_group: 'AB-', phone: '+1-555-0265', email: 'david@smith.com', address: '789 Oak Ave, Boston' },
    { patient_id: 7, full_name: 'Olivia Brown', gender: 'Female' as const, dob: '1997-07-22', blood_group: 'O-', phone: '+1-555-0319', email: 'olivia.b@gmail.com', address: '456 Pine Rd, Chicago' }
  ],
  doctors: [
    { doctor_id: 1, doctor_name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine', phone: '+1-555-1001', email: 'house@medilex.com', consultation_fee: 250.00, availability: 'Monday-Friday: 10:00 AM - 4:00 PM', rating: 4.9, patients_count: 1240 },
    { doctor_id: 2, doctor_name: 'Dr. Stephen Strange', specialization: 'Neurosurgery', phone: '+1-555-1002', email: 'strange@medilex.com', consultation_fee: 400.00, availability: 'Monday, Wednesday: 9:00 AM - 2:00 PM', rating: 4.8, patients_count: 980 },
    { doctor_id: 3, doctor_name: 'Dr. Beverly Crusher', specialization: 'General Medicine', phone: '+1-555-1003', email: 'crusher@medilex.com', consultation_fee: 150.00, availability: 'Tuesday, Thursday: 8:00 AM - 6:00 PM', rating: 4.9, patients_count: 1620 },
    { doctor_id: 4, doctor_name: 'Dr. Priya Shah', specialization: 'Orthopedics', phone: '+1-555-1004', email: 'shah@medilex.com', consultation_fee: 200.00, availability: 'Monday-Thursday: 1:00 PM - 5:00 PM', rating: 4.7, patients_count: 760 },
    { doctor_id: 5, doctor_name: 'Dr. Marco Rossi', specialization: 'Oncology', phone: '+1-555-1005', email: 'rossi@medilex.com', consultation_fee: 350.00, availability: 'Friday: 8:00 AM - 4:00 PM', rating: 4.9, patients_count: 540 },
    { doctor_id: 6, doctor_name: 'Dr. Aisha Khan', specialization: 'Dermatology', phone: '+1-555-1006', email: 'khan@medilex.com', consultation_fee: 180.00, availability: 'Tuesday, Wednesday: 9:00 AM - 1:00 PM', rating: 4.8, patients_count: 890 }
  ],
  appointments: [
    { appointment_id: 1, patient_id: 1, patient_name: 'Bruce Wayne', patient_phone: '+1-555-0199', doctor_id: 1, doctor_name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine', appointment_date: '2026-06-10', appointment_time: '10:30:00', status: 'Confirmed' as const, notes: 'Routine physical checkup' },
    { appointment_id: 2, patient_id: 2, patient_name: 'Diana Prince', patient_phone: '+1-555-0188', doctor_id: 2, doctor_name: 'Dr. Stephen Strange', specialization: 'Neurosurgery', appointment_date: '2026-06-10', appointment_time: '11:15:00', status: 'Completed' as const, notes: 'Post-surgery review' },
    { appointment_id: 3, patient_id: 3, patient_name: 'Peter Parker', patient_phone: '+1-555-0177', doctor_id: 1, doctor_name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine', appointment_date: '2026-06-11', appointment_time: '14:00:00', status: 'Pending' as const, notes: 'Persistent joint pain review' },
    { appointment_id: 4, patient_id: 4, patient_name: 'Clark Kent', patient_phone: '+1-555-0166', doctor_id: 3, doctor_name: 'Dr. Beverly Crusher', specialization: 'General Medicine', appointment_date: '2026-06-12', appointment_time: '09:00:00', status: 'Cancelled' as const, notes: 'Rescheduling requested' }
  ],
  medicines: [
    { medicine_id: 1, medicine_name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin Trihydrate', category: 'Antibiotic', price: 15.50 },
    { medicine_id: 2, medicine_name: 'Atorvastatin 20mg', generic_name: 'Atorvastatin Calcium', category: 'Cardiovascular', price: 45.00 },
    { medicine_id: 3, medicine_name: 'Paracetamol 650mg', generic_name: 'Paracetamol / Caffeine', category: 'Analgesic', price: 5.20 },
    { medicine_id: 4, medicine_name: 'Salbutamol Inhaler', generic_name: 'Albuterol Sulfate', category: 'Respiratory', price: 35.00 },
    { medicine_id: 5, medicine_name: 'Insulin Glargine', generic_name: 'Insulin Lispro', category: 'Diabetes', price: 120.00 }
  ],
  suppliers: [
    { supplier_id: 1, supplier_name: 'Acme Pharma Industries', contact_person: 'Wile E. Coyote', phone: '+1-800-555-0100', email: 'acme@pharma.com', address: '123 Desert Road, AZ' },
    { supplier_id: 2, supplier_name: 'Stark Medical Solutions', contact_person: 'Pepper Potts', phone: '+1-800-555-0200', email: 'pepper@starkmed.com', address: 'Stark Tower, New York' },
    { supplier_id: 3, supplier_name: 'Wayne Biotech', contact_person: 'Lucius Fox', phone: '+1-800-555-0300', email: 'lucius@waynebiotech.com', address: 'Research Lab, Gotham' }
  ],
  inventory: [
    { inventory_id: 1, medicine_id: 1, medicine_name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin Trihydrate', category: 'Antibiotic', price: 15.50, quantity: 150, expiry_date: '2027-12-31', supplier_id: 1, supplier_name: 'Acme Pharma Industries', reorder_level: 30 },
    { inventory_id: 2, medicine_id: 2, medicine_name: 'Atorvastatin 20mg', generic_name: 'Atorvastatin Calcium', category: 'Cardiovascular', price: 45.00, quantity: 8, expiry_date: '2028-06-30', supplier_id: 2, supplier_name: 'Stark Medical Solutions', reorder_level: 15 }, // Trigger Alert
    { inventory_id: 3, medicine_id: 3, medicine_name: 'Paracetamol 650mg', generic_name: 'Paracetamol / Caffeine', category: 'Analgesic', price: 5.20, quantity: 500, expiry_date: '2027-01-15', supplier_id: 1, supplier_name: 'Acme Pharma Industries', reorder_level: 50 },
    { inventory_id: 4, medicine_id: 4, medicine_name: 'Salbutamol Inhaler', generic_name: 'Albuterol Sulfate', category: 'Respiratory', price: 35.00, quantity: 5, expiry_date: '2026-11-30', supplier_id: 3, supplier_name: 'Wayne Biotech', reorder_level: 10 }, // Trigger Alert
    { inventory_id: 5, medicine_id: 5, medicine_name: 'Insulin Glargine', generic_name: 'Insulin Lispro', category: 'Diabetes', price: 120.00, quantity: 30, expiry_date: '2027-09-15', supplier_id: 2, supplier_name: 'Stark Medical Solutions', reorder_level: 8 }
  ],
  prescriptions: [
    {
      prescription_id: 1,
      patient_id: 2,
      patient_name: 'Diana Prince',
      doctor_id: 2,
      doctor_name: 'Dr. Stephen Strange',
      doctor_specialization: 'Neurosurgery',
      diagnosis: 'Chronic lumbar disc displacement recovery review',
      created_at: '2026-06-05T10:15:00.000Z',
      medicines: [
        { medicine_id: 3, medicine_name: 'Paracetamol 650mg', dosage: '1 pill every 8 hours', quantity: 15, duration: '5 Days' },
        { medicine_id: 2, medicine_name: 'Atorvastatin 20mg', dosage: '1 pill at bedtime', quantity: 30, duration: '30 Days' }
      ]
    },
    {
      prescription_id: 2,
      patient_id: 1,
      patient_name: 'Bruce Wayne',
      doctor_id: 1,
      doctor_name: 'Dr. Gregory House',
      doctor_specialization: 'Diagnostic Medicine',
      diagnosis: 'Mild fatigue and vitamin deficiency',
      created_at: '2026-06-08T14:30:00.000Z',
      medicines: [
        { medicine_id: 1, medicine_name: 'Amoxicillin 500mg', dosage: '1 pill twice daily', quantity: 10, duration: '5 Days' }
      ]
    }
  ],
  invoices: [
    { invoice_id: 1, patient_id: 1, patient_name: 'Bruce Wayne', patient_phone: '+1-555-0199', patient_email: 'bruce@waynecorp.com', appointment_id: 1, total_amount: 250.00, status: 'Pending' as const, due_date: '2026-06-10', created_at: '2026-06-10T05:00:00Z', payments: [] },
    { invoice_id: 2, patient_id: 2, patient_name: 'Diana Prince', patient_phone: '+1-555-0188', patient_email: 'diana@themyscira.gov', appointment_id: 2, total_amount: 400.00, status: 'Paid' as const, due_date: '2026-06-05', created_at: '2026-06-05T06:15:00Z', payments: [{ payment_id: 1, invoice_id: 2, amount: 400.00, payment_date: '2026-06-05T06:20:00Z', payment_method: 'Card' as const }] },
    { invoice_id: 3, patient_id: 3, patient_name: 'Peter Parker', patient_phone: '+1-555-0177', patient_email: 'peter.parker@spidey.net', appointment_id: 3, total_amount: 250.00, status: 'Pending' as const, due_date: '2026-06-17', created_at: '2026-06-10T08:30:00Z', payments: [] }
  ],
  activities: [
    { activity_id: 1, user_id: 1, user_full_name: 'Alex Mercer', action: 'User Seeding', description: 'Initialized default administration setup and seeded sample tables', created_at: '2026-06-10T05:00:00.000Z' },
    { activity_id: 2, user_id: 3, user_full_name: 'Dr. Gregory House', action: 'Appointment Completed', description: 'Completed appointment with Diana Prince', created_at: '2026-06-10T05:45:00.000Z' },
    { activity_id: 3, user_id: 1, user_full_name: 'Alex Mercer', action: 'Billing Generated', description: 'Created invoice #2 for Diana Prince of amount $400.00', created_at: '2026-06-10T06:15:00.000Z' },
    { activity_id: 4, user_id: 2, user_full_name: 'Sarah Jenkins', action: 'Payment Received', description: 'Processed Card payment of $400.00 for Invoice #2', created_at: '2026-06-10T06:20:00.000Z' }
  ]
};

// ==========================================
// REACT QUERY HOOK IMPLEMENTATIONS
// ==========================================

// Helper for offline latency simulation
const simulateLatency = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. DASHBOARD DATA HOOK
 */
export const useDashboardData = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency(300);
        return {
          totalPatients: mockStore.patients.length,
          totalDoctors: mockStore.doctors.length,
          totalAppointments: mockStore.appointments.length,
          totalMedicines: mockStore.medicines.length,
          totalRevenue: mockStore.invoices
            .filter((i) => i.status === 'Paid')
            .reduce((sum, inv) => sum + inv.total_amount, 0),
          lowStockCount: mockStore.inventory.filter((i) => i.quantity <= i.reorder_level).length,
          pendingInvoices: mockStore.invoices.filter((i) => i.status === 'Pending').length,
          recentActivities: mockStore.activities,
        };
      }
      const response = await api.get('/dashboard');
      return response.data.data;
    },
  });
};

/**
 * 2. PATIENTS HOOKS
 */
export const usePatients = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.patients];
      }
      const response = await api.get('/patients');
      return response.data.data;
    },
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newPatient: Omit<Types.Patient, 'patient_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const created = {
          ...newPatient,
          patient_id: mockStore.patients.length + 1,
        };
        mockStore.patients.push(created);
        return created;
      }
      const response = await api.post('/patients', newPatient);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Omit<Types.Patient, 'patient_id'> }) => {
      if (isGuest) {
        await simulateLatency();
        const index = mockStore.patients.findIndex((p) => p.patient_id === id);
        if (index !== -1) {
          mockStore.patients[index] = { ...mockStore.patients[index], ...data };
          return mockStore.patients[index];
        }
        throw new Error('Patient not found');
      }
      const response = await api.put(`/patients/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (id: number) => {
      if (isGuest) {
        await simulateLatency();
        mockStore.patients = mockStore.patients.filter((p) => p.patient_id !== id);
        return true;
      }
      await api.delete(`/patients/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 3. DOCTORS HOOKS
 */
export const useDoctors = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Doctor[]>({
    queryKey: ['doctors'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.doctors];
      }
      const response = await api.get('/doctors');
      return response.data.data;
    },
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newDoctor: Omit<Types.Doctor, 'doctor_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const created = {
          ...newDoctor,
          doctor_id: mockStore.doctors.length + 1,
          rating: 4.8,
          patients_count: 0
        };
        mockStore.doctors.push(created);
        return created;
      }
      const response = await api.post('/doctors', newDoctor);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 4. APPOINTMENTS HOOKS
 */
export const useAppointments = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.appointments];
      }
      const response = await api.get('/appointments');
      return response.data.data;
    },
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newAppt: Omit<Types.Appointment, 'appointment_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const patient = mockStore.patients.find((p) => p.patient_id === Number(newAppt.patient_id));
        const doctor = mockStore.doctors.find((d) => d.doctor_id === Number(newAppt.doctor_id));

        const created = {
          ...newAppt,
          appointment_id: mockStore.appointments.length + 1,
          patient_name: patient ? patient.full_name : 'Unknown Patient',
          doctor_name: doctor ? doctor.doctor_name : 'Unknown Doctor',
          specialization: doctor ? doctor.specialization : 'General Medicine'
        };
        mockStore.appointments.push(created);

        // Add Log Activity
        mockStore.activities.unshift({
          activity_id: mockStore.activities.length + 1,
          action: 'Appointment Booked',
          description: `Appointment booked for ${created.patient_name} with ${created.doctor_name}`,
          created_at: new Date().toISOString()
        });

        return created;
      }
      const response = await api.post('/appointments', newAppt);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Types.Appointment> }) => {
      if (isGuest) {
        await simulateLatency();
        const index = mockStore.appointments.findIndex((a) => a.appointment_id === id);
        if (index !== -1) {
          mockStore.appointments[index] = { ...mockStore.appointments[index], ...data } as Types.Appointment;
          return mockStore.appointments[index];
        }
        throw new Error('Appointment not found');
      }
      const response = await api.put(`/appointments/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

/**
 * 5. PRESCRIPTIONS HOOKS
 */
export const usePrescriptions = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.prescriptions];
      }
      const response = await api.get('/prescriptions');
      return response.data.data;
    },
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newPres: Omit<Types.Prescription, 'prescription_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const patient = mockStore.patients.find((p) => p.patient_id === Number(newPres.patient_id));
        const doctor = mockStore.doctors.find((d) => d.doctor_id === Number(newPres.doctor_id));

        const created: Types.Prescription = {
          ...newPres,
          prescription_id: mockStore.prescriptions.length + 1,
          patient_name: patient ? patient.full_name : 'Unknown Patient',
          doctor_name: doctor ? doctor.doctor_name : 'Unknown Doctor',
          doctor_specialization: doctor ? doctor.specialization : 'General Medicine',
          created_at: new Date().toISOString()
        };
        
        // Populate names on medicine lines
        if (created.medicines) {
          created.medicines = created.medicines.map((m) => {
            const med = mockStore.medicines.find((medItem) => medItem.medicine_id === Number(m.medicine_id));
            return {
              ...m,
              medicine_name: med ? med.medicine_name : 'Unknown Medicine',
              generic_name: med ? med.generic_name : ''
            };
          });
        }

        mockStore.prescriptions.push(created);

        // Deduct inventory items
        if (created.medicines) {
          for (const item of created.medicines) {
            const invIndex = mockStore.inventory.findIndex((inv) => inv.medicine_id === Number(item.medicine_id));
            if (invIndex !== -1) {
              mockStore.inventory[invIndex].quantity = Math.max(0, mockStore.inventory[invIndex].quantity - item.quantity);
            }
          }
        }

        // Add Log
        mockStore.activities.unshift({
          activity_id: mockStore.activities.length + 1,
          action: 'Prescription Issued',
          description: `Prescription issued to ${created.patient_name} by ${created.doctor_name}`,
          created_at: new Date().toISOString()
        });

        return created;
      }
      const response = await api.post('/prescriptions', newPres);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 6. INVENTORY HOOKS
 */
export const useInventory = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.inventory];
      }
      const response = await api.get('/inventory');
      return response.data.data;
    },
  });
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newInventory: Omit<Types.InventoryItem, 'inventory_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const med = mockStore.medicines.find((m) => m.medicine_id === Number(newInventory.medicine_id));
        const sup = mockStore.suppliers.find((s) => s.supplier_id === Number(newInventory.supplier_id));

        const created = {
          ...newInventory,
          inventory_id: mockStore.inventory.length + 1,
          medicine_name: med ? med.medicine_name : 'Unknown Medicine',
          generic_name: med ? med.generic_name : '',
          category: med ? med.category : 'General',
          price: med ? med.price : 10.00,
          supplier_name: sup ? sup.supplier_name : 'Unknown Supplier',
        };
        mockStore.inventory.push(created);
        return created;
      }
      const response = await api.post('/inventory', newInventory);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Types.InventoryItem> }) => {
      if (isGuest) {
        await simulateLatency();
        const index = mockStore.inventory.findIndex((inv) => inv.inventory_id === id);
        if (index !== -1) {
          mockStore.inventory[index] = { ...mockStore.inventory[index], ...data } as Types.InventoryItem;
          return mockStore.inventory[index];
        }
        throw new Error('Inventory batch not found');
      }
      const response = await api.put(`/inventory/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 7. SUPPLIERS HOOKS
 */
export const useSuppliers = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.suppliers];
      }
      const response = await api.get('/suppliers');
      return response.data.data;
    },
  });
};

/**
 * 7.5. MEDICINES HOOKS
 */
export const useMedicines = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Medicine[]>({
    queryKey: ['medicines'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.medicines];
      }
      const response = await api.get('/medicines');
      return response.data.data;
    },
  });
};

export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newMedicine: Omit<Types.Medicine, 'medicine_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const created = {
          ...newMedicine,
          medicine_id: mockStore.medicines.length + 1,
        };
        mockStore.medicines.push(created);
        return created;
      }
      const response = await api.post('/medicines', newMedicine);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 8. BILLING & INVOICES HOOKS
 */
export const useInvoices = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return [...mockStore.invoices];
      }
      const response = await api.get('/invoices');
      return response.data.data;
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newInvoice: Omit<Types.Invoice, 'invoice_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const patient = mockStore.patients.find((p) => p.patient_id === Number(newInvoice.patient_id));

        const created: Types.Invoice = {
          ...newInvoice,
          invoice_id: mockStore.invoices.length + 1,
          patient_name: patient ? patient.full_name : 'Unknown Patient',
          patient_phone: patient ? patient.phone : '',
          patient_email: patient ? patient.email || '' : '',
          created_at: new Date().toISOString(),
          status: 'Pending',
          payments: []
        };
        mockStore.invoices.push(created);

        // Add Log
        mockStore.activities.unshift({
          activity_id: mockStore.activities.length + 1,
          action: 'Invoice Generated',
          description: `Invoice #${created.invoice_id} generated for ${created.patient_name} ($${created.total_amount})`,
          created_at: new Date().toISOString()
        });

        return created;
      }
      const response = await api.post('/invoices', newInvoice);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 9. PAYMENTS HOOKS
 */
export const usePayments = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        const list: Types.Payment[] = [];
        mockStore.invoices.forEach((inv) => {
          if (inv.payments) {
            list.push(...inv.payments);
          }
        });
        return list;
      }
      const response = await api.get('/payments');
      return response.data.data;
    },
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: async (newPay: Omit<Types.Payment, 'payment_id'>) => {
      if (isGuest) {
        await simulateLatency();
        const invoiceIndex = mockStore.invoices.findIndex((inv) => inv.invoice_id === Number(newPay.invoice_id));
        if (invoiceIndex === -1) throw new Error('Invoice not found');
        const invoice = mockStore.invoices[invoiceIndex];

        const created: Types.Payment = {
          ...newPay,
          payment_id: Math.floor(Math.random() * 10000),
          payment_date: new Date().toISOString()
        };

        if (!invoice.payments) invoice.payments = [];
        invoice.payments.push(created);

        // Calculate remaining balances to update status
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= invoice.total_amount) {
          invoice.status = 'Paid';
        }

        // Add Log
        mockStore.activities.unshift({
          activity_id: mockStore.activities.length + 1,
          action: 'Payment Received',
          description: `Processed payment of $${created.amount} for Invoice #${invoice.invoice_id}`,
          created_at: new Date().toISOString()
        });

        return created;
      }
      const response = await api.post('/payments', newPay);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

/**
 * 10. ANALYTICS HOOK
 */
export const useAnalytics = () => {
  const { isGuest } = useAuth();
  return useQuery<Types.AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (isGuest) {
        await simulateLatency();
        return {
          monthlyRevenue: [
            { month: 'Jan', revenue: 1500 },
            { month: 'Feb', revenue: 2300 },
            { month: 'Mar', revenue: 3100 },
            { month: 'Apr', revenue: 2800 },
            { month: 'May', revenue: 4200 },
            { month: 'Jun', revenue: 3742 },
          ],
          medicineUsage: [
            { medicine_name: 'Paracetamol 650mg', total_quantity: 120 },
            { medicine_name: 'Amoxicillin 500mg', total_quantity: 85 },
            { medicine_name: 'Salbutamol Inhaler', total_quantity: 45 },
            { medicine_name: 'Atorvastatin 20mg', total_quantity: 30 },
            { medicine_name: 'Insulin Glargine', total_quantity: 15 },
          ],
          patientVisits: [
            { month: 'Jan', visits: 110 },
            { month: 'Feb', visits: 134 },
            { month: 'Mar', visits: 158 },
            { month: 'Apr', visits: 124 },
            { month: 'May', visits: 172 },
            { month: 'Jun', visits: 190 },
          ],
          doctorPerformance: [
            { doctor_name: 'Dr. Gregory House', appointment_count: 55, earnings: 13750 },
            { doctor_name: 'Dr. Beverly Crusher', appointment_count: 42, earnings: 6300 },
            { doctor_name: 'Dr. Stephen Strange', appointment_count: 24, earnings: 9600 },
            { doctor_name: 'Dr. Priya Shah', appointment_count: 18, earnings: 3600 },
          ],
          departmentDistribution: [
            { specialization: 'Diagnostic Medicine', doctor_count: 1 },
            { specialization: 'Neurosurgery', doctor_count: 1 },
            { specialization: 'General Medicine', doctor_count: 1 },
            { specialization: 'Orthopedics', doctor_count: 1 },
            { specialization: 'Oncology', doctor_count: 1 },
            { specialization: 'Dermatology', doctor_count: 1 },
          ],
          inventoryUsage: [
            { medicine_name: 'Amoxicillin 500mg', stock_quantity: 150, reorder_level: 30 },
            { medicine_name: 'Atorvastatin 20mg', stock_quantity: 8, reorder_level: 15 },
            { medicine_name: 'Paracetamol 650mg', stock_quantity: 500, reorder_level: 50 },
            { medicine_name: 'Salbutamol Inhaler', stock_quantity: 5, reorder_level: 10 },
            { medicine_name: 'Insulin Glargine', stock_quantity: 30, reorder_level: 8 },
          ],
          revenueTrend: [
            { date: '2026-06-01', revenue: 400 },
            { date: '2026-06-03', revenue: 150 },
            { date: '2026-06-05', revenue: 650 },
            { date: '2026-06-08', revenue: 800 },
            { date: '2026-06-10', revenue: 250 },
          ],
        };
      }
      const response = await api.get('/analytics');
      return response.data.data;
    },
  });
};
