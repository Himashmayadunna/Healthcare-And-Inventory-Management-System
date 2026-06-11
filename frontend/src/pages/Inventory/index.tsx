import React, { useState } from 'react';
import {
  useInventory,
  useCreateInventory,
  useUpdateInventory,
  useMedicines,
  useCreateMedicine,
  useSuppliers,
} from '../../hooks/useApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import type { InventoryItem } from '../../types';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiAlertTriangle,
  FiCalendar,
  FiPackage,
  FiPlusCircle,
  FiTrendingUp,
} from 'react-icons/fi';

export const Inventory: React.FC = () => {
  const { data: inventory = [], isLoading } = useInventory();
  const { data: medicines = [] } = useMedicines();
  const { data: suppliers = [] } = useSuppliers();

  const createInventoryMutation = useCreateInventory();
  const updateInventoryMutation = useUpdateInventory();
  const createMedicineMutation = useCreateMedicine();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // New Medicine Form states
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [price, setPrice] = useState('');
  const [medError, setMedError] = useState<string | null>(null);

  // Inventory Batch Form states
  const [selectedMedId, setSelectedMedId] = useState('');
  const [selectedSupId, setSelectedSupId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('15');
  const [expiryDate, setExpiryDate] = useState('');
  const [invError, setInvError] = useState<string | null>(null);

  // Restock Form states
  const [restockQty, setRestockQty] = useState('');
  const [restockError, setRestockError] = useState<string | null>(null);

  const resetMedForm = () => {
    setMedName('');
    setGenericName('');
    setCategory('Antibiotic');
    setPrice('');
    setMedError(null);
  };

  const resetInvForm = () => {
    setSelectedMedId('');
    setSelectedSupId('');
    setQuantity('');
    setReorderLevel('15');
    setExpiryDate('');
    setInvError(null);
  };

  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    setRestockQty(item.quantity.toString());
    setRestockError(null);
    setRestockModalOpen(true);
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !genericName || !price) {
      setMedError('Please fill in all fields');
      return;
    }

    try {
      const created = await createMedicineMutation.mutateAsync({
        medicine_name: medName,
        generic_name: genericName,
        category,
        price: parseFloat(price),
      });
      // Automatically select the newly created medicine in the inventory form
      setSelectedMedId(created.medicine_id.toString());
      setMedModalOpen(false);
      resetMedForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMedError(error.response?.data?.message || 'Failed to register medicine');
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || !selectedSupId || !quantity || !expiryDate) {
      setInvError('Please fill in all fields');
      return;
    }

    try {
      await createInventoryMutation.mutateAsync({
        medicine_id: Number(selectedMedId),
        supplier_id: Number(selectedSupId),
        quantity: Number(quantity),
        reorder_level: Number(reorderLevel),
        expiry_date: expiryDate,
      });
      setModalOpen(false);
      resetInvForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setInvError(error.response?.data?.message || 'Failed to add inventory batch');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !restockQty) return;

    try {
      await updateInventoryMutation.mutateAsync({
        id: selectedItem.inventory_id,
        data: { quantity: Number(restockQty) },
      });
      setRestockModalOpen(false);
      setSelectedItem(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setRestockError(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const filterInventory = (item: InventoryItem, query: string): boolean => {
    const q = query.toLowerCase();
    return !!(
      (item.medicine_name && item.medicine_name.toLowerCase().includes(q)) ||
      (item.generic_name && item.generic_name.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.supplier_name && item.supplier_name.toLowerCase().includes(q))
    );
  };

  const lowStockBatches = inventory.filter((item) => item.quantity <= item.reorder_level);

  const columns: Column<InventoryItem>[] = [
    {
      key: 'inventory_id',
      title: 'Batch ID',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-bold">#BATCH-{row.inventory_id}</span>,
    },
    {
      key: 'medicine_name',
      title: 'Medicine Info',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-700">{row.medicine_name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{row.generic_name}</p>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          {row.category}
        </span>
      ),
    },
    {
      key: 'quantity',
      title: 'In Stock',
      sortable: true,
      render: (row) => {
        const isLow = row.quantity <= row.reorder_level;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-extrabold text-sm ${isLow ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
              {row.quantity} units
            </span>
            {isLow && (
              <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                <FiAlertTriangle /> Low
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-700">${row.price?.toFixed(2)}</span>,
    },
    {
      key: 'expiry_date',
      title: 'Expiry Date',
      sortable: true,
      render: (row) => {
        const isExpiring = new Date(row.expiry_date).getTime() < new Date().getTime() + 180 * 24 * 60 * 60 * 1000;
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FiCalendar className="text-slate-400" />
            <span className={isExpiring ? 'text-amber-600 font-bold' : ''}>{row.expiry_date}</span>
          </div>
        );
      },
    },
    {
      key: 'supplier_name',
      title: 'Supplier',
      render: (row) => <span className="text-xs text-slate-500 font-medium">{row.supplier_name || '—'}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleOpenRestock(row)}
          className="p-1.5 border border-primary/20 bg-primary/5 rounded-lg text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
        >
          <FiEdit className="w-3.5 h-3.5" />
          Restock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Pharmacy Stock</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Audit medicine supply inventory and alert triggers</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-primary-600 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          Add Supply Batch
        </button>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockBatches.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-rose-800 text-xs font-semibold flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 text-lg border border-rose-500/20 flex-shrink-0 animate-bounce">
            <FiAlertTriangle />
          </div>
          <div>
            <p className="font-bold text-sm">Critical Inventory Stock Warning</p>
            <p className="mt-1 text-rose-600">
              There are <span className="font-extrabold">{lowStockBatches.length} medicine batches</span> that are
              currently below their reorder safety thresholds. Please issue restock requests to suppliers immediately.
            </p>
          </div>
        </div>
      )}

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
            placeholder="Search by name, category, generic details..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-semibold text-slate-600 outline-none transition-all"
          />
        </div>
      </Card>

      {/* Main Table */}
      <Table<InventoryItem>
        columns={columns}
        data={inventory}
        loading={isLoading}
        searchQuery={searchQuery}
        filterFn={filterInventory}
      />

      {/* Add Supply Batch Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Stock Supply Batch"
        size="md"
      >
        <form onSubmit={handleCreateInventory} className="space-y-4">
          {invError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {invError}
            </div>
          )}

          {/* Select Medicine Compound */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Choose Medicine *
              </label>
              <button
                type="button"
                onClick={() => setMedModalOpen(true)}
                className="text-xs text-primary font-bold hover:text-primary-600 transition-colors flex items-center gap-1"
              >
                <FiPlusCircle /> New Drug Catalog
              </button>
            </div>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            >
              <option value="">-- Choose Medicine --</option>
              {medicines.map((m) => (
                <option key={m.medicine_id} value={m.medicine_id}>
                  {m.medicine_name} ({m.generic_name})
                </option>
              ))}
            </select>
          </div>

          {/* Select Supplier */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Choose Supplier *
            </label>
            <select
              value={selectedSupId}
              onChange={(e) => setSelectedSupId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              required
            >
              <option value="">-- Choose Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Batch Quantity *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
                min="1"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Reorder safety level */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Reorder Level *
              </label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="e.g. 15"
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Batch Expiry Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
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
              disabled={createInventoryMutation.isPending}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
            >
              <FiPackage /> Save Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* New Medicine Dialog Modal */}
      <Modal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        title="Register Drug Catalog Entry"
        size="sm"
      >
        <form onSubmit={handleCreateMedicine} className="space-y-4">
          {medError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {medError}
            </div>
          )}

          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Brand / Medicine Name *
            </label>
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Paracetamol 650mg"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
          </div>

          {/* Generic Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Generic Chemical Name *
            </label>
            <input
              type="text"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              placeholder="e.g. Acetaminophen"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Drug Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {['Antibiotic', 'Cardiovascular', 'Analgesic', 'Respiratory', 'Diabetes', 'Vitamin', 'General'].map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Selling Price ($) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 5.50"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 justify-end border-t border-gray-100">
            <button
              type="button"
              onClick={() => setMedModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMedicineMutation.isPending}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 flex items-center gap-1"
            >
              <FiTrendingUp /> Register
            </button>
          </div>
        </form>
      </Modal>

      {/* Restock Qty Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title={`Restock: ${selectedItem?.medicine_name}`}
        size="sm"
      >
        {selectedItem && (
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            {restockError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                {restockError}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 mb-4 font-semibold">
                Update stock units for Batch #{selectedItem.inventory_id}. Current quantity: {selectedItem.quantity}.
              </p>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                New Quantity *
              </label>
              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-3 justify-end border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateInventoryMutation.isPending}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600"
              >
                Update Stock
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
