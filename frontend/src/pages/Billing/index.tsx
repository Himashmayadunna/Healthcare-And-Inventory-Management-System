import React, { useState } from 'react';
import {
  useInvoices,
  useCreateInvoice,
  useCreatePayment,
  usePatients,
} from '../../hooks/useApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import type { Invoice } from '../../types';
import {
  FiPlus,
  FiSearch,
  FiPrinter,
  FiCreditCard,
  FiCheckCircle,
  FiFileText,
} from 'react-icons/fi';

export const Billing: React.FC = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: patients = [] } = usePatients();

  const createInvoiceMutation = useCreateInvoice();
  const createPaymentMutation = useCreatePayment();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invError, setInvError] = useState<string | null>(null);

  // Payment Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [payError, setPayError] = useState<string | null>(null);

  const resetInvForm = () => {
    setSelectedPatientId('');
    setTotalAmount('');
    setDueDate('');
    setInvError(null);
  };

  const handleOpenPay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const balance = invoice.total_amount - (invoice.payments?.reduce((s, p) => s + p.amount, 0) || 0);
    setPayAmount(balance.toString());
    setPayError(null);
    setPayModalOpen(true);
  };

  const handleOpenView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !totalAmount || !dueDate) {
      setInvError('Please fill in all fields');
      return;
    }

    try {
      await createInvoiceMutation.mutateAsync({
        patient_id: Number(selectedPatientId),
        total_amount: parseFloat(totalAmount),
        due_date: dueDate,
        status: 'Pending',
      });
      setModalOpen(false);
      resetInvForm();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setInvError(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !payAmount) return;

    try {
      await createPaymentMutation.mutateAsync({
        invoice_id: selectedInvoice.invoice_id,
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        payment_date: new Date().toISOString()
      });
      setPayModalOpen(false);
      setSelectedInvoice(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setPayError(error.response?.data?.message || 'Payment submission failed');
    }
  };

  const filterInvoices = (invoice: Invoice, query: string) => {
    const q = query.toLowerCase();
    return (
      (invoice.patient_name && invoice.patient_name.toLowerCase().includes(q)) ||
      invoice.status.toLowerCase().includes(q)
    );
  };

  const statusBadge = (status: Invoice['status']) => {
    const classes = {
      Pending: 'bg-amber-50 text-amber-600 border-amber-100',
      Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
      <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${classes[status]}`}>
        {status}
      </span>
    );
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_id',
      title: 'Invoice ID',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-bold">#INV-{row.invoice_id}</span>,
    },
    {
      key: 'patient_name',
      title: 'Patient Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-700">{row.patient_name}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{row.patient_phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      key: 'total_amount',
      title: 'Total Amount',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-slate-700">
          ${row.total_amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'balance',
      title: 'Paid / Balance',
      render: (row) => {
        const paid = row.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const balance = row.total_amount - paid;
        return (
          <div className="text-xs">
            <span className="text-emerald-600 font-bold">${paid.toFixed(2)}</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className={balance > 0 ? 'text-slate-500 font-semibold' : 'text-slate-400 font-medium'}>
              ${balance.toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      title: 'Bill Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'due_date',
      title: 'Due Date',
      sortable: true,
      render: (row) => {
        const isOverdue = row.status === 'Pending' && new Date(row.due_date).getTime() < new Date().getTime();
        return (
          <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
            {row.due_date} {isOverdue && '(Overdue)'}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'Pending' && (
            <button
              onClick={() => handleOpenPay(row)}
              className="p-1.5 border border-primary/20 bg-primary/5 rounded-lg text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
            >
              <FiCreditCard className="w-3.5 h-3.5" />
              Collect
            </button>
          )}
          <button
            onClick={() => handleOpenView(row)}
            className="p-1.5 border border-gray-200 bg-slate-50/50 rounded-lg text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            Receipt
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Billing & Invoices</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Generate customer bills, process payments and audit receipts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          Create Invoice
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
            placeholder="Search by patient name or status..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-semibold text-slate-600 outline-none transition-all"
          />
        </div>
      </Card>

      {/* Main Table */}
      <Table<Invoice>
        columns={columns}
        data={invoices}
        loading={isLoading}
        searchQuery={searchQuery}
        filterFn={filterInvoices}
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate Invoice Bill"
        size="sm"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          {invError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {invError}
            </div>
          )}

          {/* Select Patient */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Patient Name *
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.full_name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Bill Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Bill Amount ($) *
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="e.g. 150.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 justify-end border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 flex items-center gap-1"
            >
              <FiFileText /> Generate Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Process Invoice Payment: #${selectedInvoice?.invoice_id}`}
        size="sm"
      >
        {selectedInvoice && (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            {payError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                {payError}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 font-semibold mb-4">
                Total Bill amount: ${selectedInvoice.total_amount.toFixed(2)}. Outstandings can be paid fully or partially below.
              </p>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Amount to Collect ($) *
              </label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="e.g. 100.00"
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Payment Method *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as 'Cash' | 'Card' | 'Online')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 justify-end border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 flex items-center gap-1.5"
              >
                <FiCheckCircle /> Confirm Payment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Invoice Receipt Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Invoice & Receipt sheet"
        size="md"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Printed Invoice Details */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl print:bg-white print:border-none print:p-0 flex flex-col gap-6 text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-teal-800">MediLex Healthcare Clinic</h2>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                    Invoice Registry & Receipt Sheet
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-teal-700">Payment Invoice</span>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                    Invoice ID: #INV-{selectedInvoice.invoice_id}
                  </p>
                </div>
              </div>

              {/* Patient metadata */}
              <div className="text-xs font-semibold">
                <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Patient Details</p>
                <p className="text-slate-800 font-bold">{selectedInvoice.patient_name}</p>
                <p className="text-slate-500 mt-0.5">Contact: {selectedInvoice.patient_phone || '—'}</p>
                <p className="text-slate-500 mt-0.5">Email: {selectedInvoice.patient_email || '—'}</p>
              </div>

              {/* Invoiced Payments Registry */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200 pb-1">
                  Invoice Breakdown
                </p>
                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Fees / Medicine Bill</span>
                    <span>${selectedInvoice.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-teal-800">
                    <span>Invoiced Total:</span>
                    <span>${selectedInvoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Paid Transactions history */}
                {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-200 pb-1">
                      Payment History Logs
                    </p>
                    <div className="divide-y divide-slate-200">
                      {selectedInvoice.payments.map((p, i) => (
                        <div key={i} className="py-2 flex justify-between text-xs">
                          <span className="text-slate-500">
                            {new Date(p.payment_date).toLocaleDateString()} via {p.payment_method}
                          </span>
                          <span className="text-emerald-600 font-bold">+${p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[10px] text-slate-400 border-t border-slate-200 font-bold">
                <div>
                  <p>Due Date: {selectedInvoice.due_date}</p>
                  <p className="mt-1">Status: {selectedInvoice.status.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className="w-36 border-t border-slate-300 mb-1" />
                  <p className="uppercase">Pharmacy Cashier Signature</p>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
              >
                <FiPrinter /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
