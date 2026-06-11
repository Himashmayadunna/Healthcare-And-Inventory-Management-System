import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  usePatients,
  useDoctors,
} from '../../hooks/useApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import type { Appointment } from '../../types';
import {
  FiCalendar,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

export const Appointments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: appointments = [], isLoading } = useAppointments();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();

  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Trigger modal open if URL query has ?book=true
  useEffect(() => {
    if (searchParams.get('book') === 'true') {
      const timer = setTimeout(() => {
        setModalOpen(true);
        // Clean query string
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('book');
        setSearchParams(nextParams);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  const resetForm = () => {
    setSelectedPatientId('');
    setSelectedDoctorId('');
    setApptDate('');
    setApptTime('');
    setNotes('');
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !apptDate || !apptTime) {
      setFormError('Please fill in all fields');
      return;
    }

    const payload = {
      patient_id: Number(selectedPatientId),
      doctor_id: Number(selectedDoctorId),
      appointment_date: apptDate,
      appointment_time: `${apptTime}:00`,
      status: 'Confirmed' as const,
      notes,
    };

    try {
      await createAppointmentMutation.mutateAsync(payload);
      setModalOpen(false);
      resetForm();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleUpdateStatus = async (id: number, status: 'Confirmed' | 'Completed' | 'Cancelled') => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id,
        data: { status },
      });
    } catch (err) {
      console.error('Update status failed', err);
    }
  };

  const statusBadge = (status: Appointment['status']) => {
    const classes = {
      Pending: 'bg-amber-50 text-amber-600 border-amber-100',
      Confirmed: 'bg-teal-50 text-teal-600 border-teal-100',
      Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
      <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${classes[status]}`}>
        {status}
      </span>
    );
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'appointment_id',
      title: 'Appt ID',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-bold">#{row.appointment_id}</span>,
    },
    {
      key: 'patient_name',
      title: 'Patient Name',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-700">{row.patient_name}</span>,
    },
    {
      key: 'doctor_name',
      title: 'Practitioner',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-700">{row.doctor_name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{row.specialization}</p>
        </div>
      ),
    },
    {
      key: 'schedule',
      title: 'Date & Time',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-600">{row.appointment_date}</p>
          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <FiClock /> {row.appointment_time}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'notes',
      title: 'Notes',
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium max-w-xs truncate block" title={row.notes || undefined}>
          {row.notes || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => {
        if (row.status === 'Completed' || row.status === 'Cancelled') {
          return <span className="text-xs text-slate-300 font-semibold italic">Settled</span>;
        }

        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(row.appointment_id, 'Completed')}
              className="p-1.5 border border-emerald-100 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              title="Complete Visit"
            >
              <FiCheckCircle />
              Complete
            </button>
            <button
              onClick={() => handleUpdateStatus(row.appointment_id, 'Cancelled')}
              className="p-1.5 border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              title="Cancel Booking"
            >
              <FiXCircle />
              Cancel
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Appointments</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Schedule and follow-up medical consultations</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Main Table */}
      <Table<Appointment>
        columns={columns}
        data={appointments}
        loading={isLoading}
      />

      {/* Booking Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Book Clinic Appointment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Select Patient *
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.full_name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Select Practitioner *
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.doctor_name} - {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Appointment Date *
              </label>
              <input
                type="date"
                value={apptDate}
                onChange={(e) => setApptDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Consultation Time *
              </label>
              <input
                type="time"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Reason / Symptoms & Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide clinic consultation reason..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
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
              disabled={createAppointmentMutation.isPending}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
            >
              <FiCalendar className="w-4 h-4" />
              Schedule Book
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
