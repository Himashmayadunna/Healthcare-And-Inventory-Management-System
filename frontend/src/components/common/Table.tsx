import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';
import { TableSkeleton } from './Skeletons.tsx';

export interface Column<T> {
  key: string;
  title: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchQuery?: string;
  filterFn?: (row: T, query: string) => boolean;
  pageSize?: number;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  searchQuery = '',
  filterFn,
  pageSize = 7,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // 1. Filter Data
  let processedData = [...data];
  if (searchQuery && filterFn) {
    processedData = processedData.filter((row) => filterFn(row, searchQuery));
  }

  // 2. Sort Data
  if (sortConfig !== null) {
    processedData.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortConfig.key];
      const bVal = (b as Record<string, unknown>)[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const compA = typeof aVal === 'number' || typeof aVal === 'string' ? aVal : String(aVal);
      const compB = typeof bVal === 'number' || typeof bVal === 'string' ? bVal : String(bVal);

      if (typeof compA === 'number' && typeof compB === 'number') {
        return sortConfig.direction === 'asc' ? compA - compB : compB - compA;
      }

      const strA = String(compA);
      const strB = String(compB);
      return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 3. Paginate Data
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  // Adjust page number if items count shrinks
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="flex flex-col">
      {/* Scrollable Container */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white custom-shadow">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-slate-50/75">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-6 py-4 font-semibold text-slate-500 tracking-wider select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100/50 hover:text-slate-800' : ''
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.title}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className="text-xs text-primary font-bold">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <TableSkeleton rows={pageSize} cols={columns.length} />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiInbox className="w-10 h-10 text-slate-300" />
                    <p className="font-medium text-slate-500">No records found matching filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIndex) => (
                <tr key={rIndex} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {col.render ? col.render(row, startIndex + rIndex) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="font-semibold text-slate-600">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-600">
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-slate-600">{totalItems}</span> items
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
