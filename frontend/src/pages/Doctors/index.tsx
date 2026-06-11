import React, { useState } from 'react';
import { useDoctors, useCreateDoctor } from '../../hooks/useApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import type { Doctor } from '../../types';
import { FiPlus, FiSearch, FiDollarSign, FiClock, FiStar, FiActivity } from 'react-icons/fi';

export const Doctors: React.FC = () => {
  const { data: doctors = [], isLoading } = useDoctors();
  const createDoctorMutation = useCreateDoctor();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form States
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [availability, setAvailability] = useState('Monday-Friday: 9:00 AM - 5:00 PM');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setDoctorName('');
    setSpecialization('General Medicine');
    setPhone('');
    setEmail('');
    setConsultationFee('');
    setAvailability('Monday-Friday: 9:00 AM - 5:00 PM');
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !phone || !email || !consultationFee) {
      setFormError('Please fill in all required fields (*)');
      return;
    }

    const payload = {
      doctor_name: doctorName,
      specialization,
      phone,
      email,
      consultation_fee: parseFloat(consultationFee),
      availability,
    };

    try {
      await createDoctorMutation.mutateAsync(payload);
      setModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  const filterDoctors = (doctor: Doctor, query: string) => {
    const q = query.toLowerCase();
    return (
      doctor.doctor_name.toLowerCase().includes(q) ||
      doctor.specialization.toLowerCase().includes(q) ||
      doctor.email.toLowerCase().includes(q)
    );
  };

  const columns: Column<Doctor>[] = [
    {
      key: 'doctor_id',
      title: 'ID',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-bold">#{row.doctor_id}</span>,
    },
    {
      key: 'doctor_name',
      title: 'Doctor Info',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-bold text-sm">
            {row.doctor_name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-slate-800">{row.doctor_name}</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{row.specialization}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'consultation_fee',
      title: 'Consultation Fee',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-slate-700 flex items-center">
          <FiDollarSign className="w-3 h-3 text-slate-400" />
          {row.consultation_fee.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'availability',
      title: 'Weekly Schedule',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <FiClock className="text-slate-400 flex-shrink-0" />
          <span>{row.availability}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact Details',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-600 text-xs">{row.phone}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      title: 'Rating / Patients',
      render: (row) => (
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-xs">
            <FiStar className="fill-amber-500" />
            <span>{row.rating || 4.8}</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
            {row.patients_count || 120} checkups
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Doctors Registry</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Manage consultation hours, specials and fees</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          Add Practitioner
        </button>
      </div>

      {/* Filter panel */}
      <Card className="p-4 border border-gray-100">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, specialty or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-semibold text-slate-600 outline-none transition-all"
          />
        </div>
      </Card>

      {/* Table grid */}
      <Table<Doctor>
        columns={columns}
        data={doctors}
        loading={isLoading}
        searchQuery={searchQuery}
        filterFn={filterDoctors}
      />

      {/* Register Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Practitioner"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Doctor Name *
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. John Watson"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Specialization *
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              >
                {[
                  'General Medicine',
                  'Diagnostic Medicine',
                  'Neurosurgery',
                  'Orthopedics',
                  'Oncology',
                  'Dermatology',
                  'Pediatrics',
                  'Cardiology'
                ].map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="e.g. 150.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-1001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="watson@medilex.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Availability schedule */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Weekly Schedule Availability *
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Mon, Wed, Fri: 9:00 AM - 1:00 PM"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
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
              disabled={createDoctorMutation.isPending}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
            >
              <FiActivity className="w-4 h-4" />
              Add Practitioner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
