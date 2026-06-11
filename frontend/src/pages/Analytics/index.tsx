import React from 'react';
import { useAnalytics } from '../../hooks/useApi';
import { Card } from '../../components/common/Card';
import { DashboardSkeleton } from '../../components/common/Skeletons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FiTrendingUp, FiCheckSquare, FiAlertCircle, FiAward } from 'react-icons/fi';

export const Analytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !analytics) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-rose-800 text-sm font-semibold flex items-center gap-3">
        <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold">Failed to load analytics engine data</p>
          <p className="text-xs text-rose-600 mt-1">Please ensure database configuration is online.</p>
        </div>
      </div>
    );
  }

  // Pie chart colors
  const COLORS = ['#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#f43f5e', '#eab308'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Business Intelligence & Analytics</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Perform clinical audits, monitor revenue trajectories and medicine sales volumes
        </p>
      </div>

      {/* Trajectory statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 text-xl flex items-center justify-center">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Top Drug Prescribed</p>
              <p className="text-lg font-bold text-slate-700 mt-1">
                {analytics.medicineUsage[0]?.medicine_name || 'Paracetamol'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 text-xl flex items-center justify-center">
              <FiAward />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lead Practitioner</p>
              <p className="text-lg font-bold text-slate-700 mt-1">
                {analytics.doctorPerformance[0]?.doctor_name || 'Dr. Gregory House'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xl flex items-center justify-center">
              <FiCheckSquare />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Earnings Trajectory</p>
              <p className="text-lg font-bold text-slate-700 mt-1">
                ${analytics.monthlyRevenue.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()} (YTD)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue trajectory curve */}
        <Card title="Monthly Income Statement Trajectory" subtitle="Aggregated monthly invoices cash flow reports">
          <div className="h-80 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                  formatter={(value: unknown) => [`$${value as string | number}`, 'Monthly Revenue']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, stroke: '#14b8a6', fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Medicine consumption volumes */}
        <Card title="Top Prescribed Pharmacy Drugs" subtitle="Quantity of drug dosages distributed out by pharmacists">
          <div className="h-80 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.medicineUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="medicine_name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                  formatter={(value: unknown) => [value as string | number, 'Units Sold']}
                />
                <Bar dataKey="total_quantity" name="Dosages Dispensed" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Practitioner consult workloads */}
        <Card title="Practitioner Caseload & Performance" subtitle="Completed consultations count against consultancy fees earnings">
          <div className="h-80 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.doctorPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="doctor_name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar yAxisId="left" dataKey="appointment_count" name="Appointments Checkups" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar yAxisId="right" dataKey="earnings" name="Consult Fees Earnings ($)" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department distribution */}
        <Card title="Department Staffing Allocations" subtitle="Practitioners distribution spread out across clinic departments">
          <div className="h-80 w-full mt-3 flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="doctor_count"
                    nameKey="specialization"
                  >
                    {analytics.departmentDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: unknown) => [`${value as string | number} doctor(s)`, 'Specialty']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 text-xs space-y-2 max-h-60 overflow-y-auto pr-2">
              {analytics.departmentDistribution.map((entry, idx) => (
                <div key={entry.specialization} className="flex justify-between items-center font-bold">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="truncate max-w-[150px]">{entry.specialization}</span>
                  </div>
                  <span className="text-slate-800">{entry.doctor_count} staff</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
