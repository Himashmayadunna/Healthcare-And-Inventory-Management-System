import React from 'react';

/**
 * 1. TABLE LOADER SKELETON
 */
interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full divide-y divide-gray-100 animate-pulse bg-white">
      {Array.from({ length: rows }).map((_, rIndex) => (
        <div key={rIndex} className="flex px-6 py-4 items-center gap-4">
          {Array.from({ length: cols }).map((_, cIndex) => (
            <div
              key={cIndex}
              className={`h-4 bg-slate-100 rounded-md flex-1 ${
                cIndex === 0 ? 'max-w-[150px]' : cIndex === cols - 1 ? 'max-w-[100px]' : ''
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * 2. CARD LOADER SKELETON
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl custom-shadow animate-pulse flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="w-8 h-8 rounded-lg bg-slate-100" />
        <div className="w-12 h-4 rounded bg-slate-100" />
      </div>
      <div className="h-7 w-20 rounded bg-slate-100 mt-1" />
      <div className="h-4 w-32 rounded bg-slate-100" />
    </div>
  );
};

/**
 * 3. CHART PANEL LOADER SKELETON
 */
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl custom-shadow animate-pulse flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col gap-1.5">
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-slate-100" />
      </div>
      <div className="h-48 w-full bg-slate-50 rounded-xl flex items-end justify-between p-4 gap-3">
        <div className="w-full h-1/3 bg-slate-100 rounded-md" />
        <div className="w-full h-2/3 bg-slate-100 rounded-md" />
        <div className="w-full h-1/2 bg-slate-100 rounded-md" />
        <div className="w-full h-4/5 bg-slate-100 rounded-md" />
        <div className="w-full h-3/5 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
};

/**
 * 4. GENERAL DETAILS PANEL SKELETON
 */
export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-3.5 w-24 rounded bg-slate-100" />
        </div>
      </div>
      <div className="flex flex-col gap-3.5 border-t border-gray-100 pt-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="h-4 w-20 rounded bg-slate-100" />
            <div className="h-4 w-36 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 5. DASHBOARD COMPLETE SKELETON
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome banner skeleton */}
      <div className="h-32 bg-slate-100 rounded-3xl" />
      
      {/* 3 cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-28 bg-slate-100 rounded-2xl" />
        <div className="h-28 bg-slate-100 rounded-2xl" />
        <div className="h-28 bg-slate-100 rounded-2xl" />
      </div>

      {/* 2 charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
};
