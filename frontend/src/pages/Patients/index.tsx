import React, { useState } from 'react';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../../hooks/useApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import type { Patient } from '../../types';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiHeart } from 'react-icons/fi';

export const Patients: React.FC = () => {
  const { data: patients = [], isLoading } = usePatients();
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setGender('Male');
    setDob('');
    setBloodGroup('O+');
    setPhone('');
    setEmail('');
    setAddress('');
    setFormError(null);
    setEditingPatient(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFullName(patient.full_name);
    setGender(patient.gender);
    setDob(patient.dob);
    setBloodGroup(patient.blood_group || 'O+');
    setPhone(patient.phone);
    setEmail(patient.email || '');
    setAddress(patient.address || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob || !phone || !address) {
      setFormError('Please fill in all required fields (*)');
      return;
    }

    const payload = {
      full_name: fullName,
      gender,
      dob,
      blood_group: bloodGroup,
      phone,
      email: email || undefined,
      address,
    };

    try {
      if (editingPatient) {
        await updatePatientMutation.mutateAsync({
          id: editingPatient.patient_id,
          data: payload,
        });
      } else {
        await createPatientMutation.mutateAsync(payload);
      }
      setModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await deletePatientMutation.mutateAsync(id);
      } catch (err) {
        console.error('Delete patient failed', err);
      }
    }
  };

  const filterPatients = (patient: Patient, query: string) => {
    const q = query.toLowerCase();
    return !!(
      patient.full_name.toLowerCase().includes(q) ||
      patient.phone.includes(q) ||
      (patient.email && patient.email.toLowerCase().includes(q)) ||
      (patient.blood_group && patient.blood_group.toLowerCase().includes(q))
    );
  };

  const columns: Column<Patient>[] = [
    {
      key: 'patient_id',
      title: 'ID',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-bold">#{row.patient_id}</span>,
    },
    {
      key: 'full_name',
      title: 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-50 text-teal-600 border border-teal-100 rounded-lg flex items-center justify-center font-bold text-xs">
            {row.full_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-slate-700">{row.full_name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{row.gender}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'dob',
      title: 'Age / DOB',
      sortable: true,
      render: (row) => {
        const birthDate = new Date(row.dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return (
          <div>
            <p className="font-bold text-slate-600">{age} yrs</p>
            <p className="text-[10px] text-slate-400 font-bold">{row.dob}</p>
          </div>
        );
      },
    },
    {
      key: 'blood_group',
      title: 'Blood',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-full border border-rose-100">
          <FiHeart className="w-2.5 h-2.5 fill-rose-600" />
          {row.blood_group}
        </span>
      ),
    },
    {
      key: 'phone',
      title: 'Contact Information',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-600">{row.phone}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{row.email || 'No email'}</p>
        </div>
      ),
    },
    {
      key: 'address',
      title: 'Address',
      render: (row) => <span className="text-xs text-slate-500 font-medium max-w-xs truncate block">{row.address}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-2 border border-gray-100 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors"
            title="Edit Patient"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.patient_id)}
            className="p-2 border border-gray-100 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Patient"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Patient Records</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Manage clinical patient list and details</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Search Filter Panel */}
      <Card className="p-4 border border-gray-100">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, contact, blood type..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-semibold text-slate-600 outline-none transition-all"
          />
        </div>
      </Card>

      {/* Main Table */}
      <Table<Patient>
        columns={columns}
        data={patients}
        loading={isLoading}
        searchQuery={searchQuery}
        filterFn={filterPatients}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1-555-0199"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Residential Address *
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address details..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 justify-end border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
            >
              <FiUserCheck className="w-4 h-4" />
              {editingPatient ? 'Save Changes' : 'Register Patient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
