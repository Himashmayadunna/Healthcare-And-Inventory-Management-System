import React, { useState } from 'react';
import {
  usePrescriptions,
  useCreatePrescription,
  usePatients,
  useDoctors,
  useInventory,
} from '../../hooks/useApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import type { Prescription } from '../../types';
import {
  FiPlus,
  FiPrinter,
  FiPlusCircle,
  FiMinusCircle,
  FiCheckCircle,
} from 'react-icons/fi';

export const Prescriptions: React.FC = () => {
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: inventory = [] } = useInventory();
  const createPrescriptionMutation = useCreatePrescription();

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Form States
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicineLines, setMedicineLines] = useState<
    { medicine_id: string; dosage: string; quantity: number; duration: string }[]
  >([{ medicine_id: '', dosage: '1 pill daily', quantity: 10, duration: '10 Days' }]);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedPatientId('');
    setSelectedDoctorId('');
    setDiagnosis('');
    setMedicineLines([{ medicine_id: '', dosage: '1 pill daily', quantity: 10, duration: '10 Days' }]);
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleAddLine = () => {
    setMedicineLines([
      ...medicineLines,
      { medicine_id: '', dosage: '1 pill daily', quantity: 10, duration: '10 Days' },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (medicineLines.length === 1) return;
    setMedicineLines(medicineLines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (
    idx: number,
    field: 'medicine_id' | 'dosage' | 'quantity' | 'duration',
    value: string | number
  ) => {
    const updated = [...medicineLines];
    const item = { ...updated[idx] };
    if (field === 'quantity') {
      item.quantity = Number(value);
    } else {
      item[field] = String(value);
    }
    updated[idx] = item;
    setMedicineLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !diagnosis) {
      setFormError('Please fill in clinical details');
      return;
    }

    const validLines = medicineLines.filter((l) => l.medicine_id !== '');
    if (validLines.length === 0) {
      setFormError('Please prescribe at least one medicine');
      return;
    }

    // Check inventory stock availability
    for (const line of validLines) {
      const stockItem = inventory.find((inv) => inv.medicine_id === Number(line.medicine_id));
      if (!stockItem || stockItem.quantity < line.quantity) {
        setFormError(
          `Insufficient stock for ${stockItem?.medicine_name || 'selected medicine'}. In stock: ${
            stockItem?.quantity || 0
          }`
        );
        return;
      }
    }

    const payload = {
      patient_id: Number(selectedPatientId),
      doctor_id: Number(selectedDoctorId),
      diagnosis,
      medicines: validLines.map((l) => ({
        medicine_id: Number(l.medicine_id),
        dosage: l.dosage,
        quantity: Number(l.quantity),
        duration: l.duration,
      })),
    };

    try {
      await createPrescriptionMutation.mutateAsync(payload);
      setModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to issue prescription');
    }
  };

  const handleViewPrescription = (pres: Prescription) => {
    setSelectedPrescription(pres);
    setViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<Prescription>[] = [
    {
      key: 'prescription_id',
      title: 'Rx ID',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-bold">#RX-{row.prescription_id}</span>,
    },
    {
      key: 'patient_name',
      title: 'Patient',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-700">{row.patient_name}</span>,
    },
    {
      key: 'doctor_name',
      title: 'Prescribed By',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-700">{row.doctor_name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{row.doctor_specialization || 'General'}</p>
        </div>
      ),
    },
    {
      key: 'diagnosis',
      title: 'Diagnosis / Notes',
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium max-w-xs truncate block" title={row.diagnosis}>
          {row.diagnosis}
        </span>
      ),
    },
    {
      key: 'medicines',
      title: 'Items',
      render: (row) => {
        const list = row.medicines || [];
        return (
          <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 border border-slate-200 rounded-full">
            {list.length} item{list.length !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      title: 'Issued Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleViewPrescription(row)}
          className="p-1.5 border border-primary/20 bg-primary/5 rounded-lg text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
        >
          <FiPrinter className="w-3.5 h-3.5" />
          Print / View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Prescriptions</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Issue and record clinical drug prescriptions</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          New Prescription (Rx)
        </button>
      </div>

      {/* Main Table */}
      <Table<Prescription>
        columns={columns}
        data={prescriptions}
        loading={isLoading}
      />

      {/* New Rx Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Compose Medical Prescription"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Patient Name *
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

            {/* Doctor Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Practitioner *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              >
                <option value="">-- Choose Practitioner --</option>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    {d.doctor_name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Clinical Diagnosis & Remarks *
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute streptococcal pharyngitis"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Medicines Checklist Builders */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Prescribed Medicines
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1.5 text-xs text-primary font-bold hover:text-primary-600 transition-colors"
              >
                <FiPlusCircle /> Add Medicine
              </button>
            </div>

            <div className="space-y-3.5">
              {medicineLines.map((line, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3.5 items-end bg-slate-50/50 p-4 border border-gray-100 rounded-2xl relative">
                  {/* Select Medicine */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Medicine (Stock Qty)
                    </label>
                    <select
                      value={line.medicine_id}
                      onChange={(e) => handleLineChange(idx, 'medicine_id', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="">-- Select --</option>
                      {inventory.map((inv) => (
                        <option key={inv.inventory_id} value={inv.medicine_id}>
                          {inv.medicine_name} ({inv.quantity} left)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dosage */}
                  <div className="w-full md:w-48">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Dosage Instructions
                    </label>
                    <input
                      type="text"
                      value={line.dosage}
                      onChange={(e) => handleLineChange(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 1 tab morning & night"
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full md:w-56">
                    {/* Quantity */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                        Total Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-slate-700"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={line.duration}
                        onChange={(e) => handleLineChange(idx, 'duration', e.target.value)}
                        placeholder="e.g. 7 Days"
                        className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Remove line */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={medicineLines.length === 1}
                    className="p-2.5 text-slate-400 hover:text-rose-500 bg-white border border-gray-100 hover:bg-rose-50 rounded-xl disabled:opacity-30 disabled:hover:bg-white"
                  >
                    <FiMinusCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
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
              disabled={createPrescriptionMutation.isPending}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
            >
              <FiCheckCircle className="w-4 h-4" />
              Issue & Save (Rx)
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Prescription Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Prescription Sheet"
        size="md"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Printed Header Sheet */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl print:bg-white print:border-none print:p-0 flex flex-col gap-6 text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-teal-800">MediLex Healthcare Clinic</h2>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                    State-Of-The-Art Clinic & Inventory Portal
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-teal-700">Rx Sheet</span>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                    ID: #RX-{selectedPrescription.prescription_id}
                  </p>
                </div>
              </div>

              {/* Patient and Doctor metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Patient Details</p>
                  <p className="text-slate-800 font-bold">{selectedPrescription.patient_name}</p>
                  <p className="text-slate-500 mt-0.5">Diagnosed: {selectedPrescription.diagnosis}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Practitioner Details</p>
                  <p className="text-slate-800 font-bold">{selectedPrescription.doctor_name}</p>
                  <p className="text-slate-500 mt-0.5">Dept: {selectedPrescription.doctor_specialization || 'General'}</p>
                </div>
              </div>

              {/* Prescribed Drug lists */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200 pb-1">
                  Prescribed Medication Regimen
                </p>
                <div className="divide-y divide-slate-200">
                  {selectedPrescription.medicines?.map((med, index) => (
                    <div key={index} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{med.medicine_name}</p>
                        <p className="text-[10px] text-teal-600 font-bold mt-0.5">{med.dosage}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-bold text-slate-600">Qty: {med.quantity}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">For {med.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[10px] text-slate-400 border-t border-slate-200 font-bold">
                <p>Date: {selectedPrescription.created_at ? new Date(selectedPrescription.created_at).toLocaleDateString() : '—'}</p>
                <div className="text-right">
                  <div className="w-36 border-t border-slate-300 mb-1" />
                  <p className="uppercase">Clinic Staff Signature</p>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
              >
                <FiPrinter /> Print Sheet
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
