import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, useAnalytics } from '../../hooks/useApi';
import { Card } from '../../components/common/Card';
import { DashboardSkeleton } from '../../components/common/Skeletons';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiActivity,
  FiCalendar,
  FiDollarSign,
  FiAlertTriangle,
  FiFileText,
  FiArrowRight,
  FiPlus,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashData, isLoading: isDashLoading, error: dashError } = useDashboardData();
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics();

  if (isDashLoading || isAnalyticsLoading) {
    return <DashboardSkeleton />;
  }

  if (dashError) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-rose-800 text-sm font-semibold flex items-center gap-3">
        <FiAlertTriangle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold">Failed to load dashboard metrics</p>
          <p className="text-xs text-rose-600 mt-1">Please ensure your SQL Server or API service is running.</p>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: dashData?.totalPatients ?? 0,
      icon: FiUsers,
      color: 'bg-teal-50 text-teal-600 border-teal-100/50',
      action: () => navigate('/patients'),
    },
    {
      title: 'Active Doctors',
      value: dashData?.totalDoctors ?? 0,
      icon: FiActivity,
      color: 'bg-sky-50 text-sky-600 border-sky-100/50',
      action: () => navigate('/doctors'),
    },
    {
      title: 'Appointments booked',
      value: dashData?.totalAppointments ?? 0,
      icon: FiCalendar,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
      action: () => navigate('/appointments'),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashData?.totalRevenue ?? 0),
      icon: FiDollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
      action: () => navigate('/billing'),
    },
    {
      title: 'Low Stock Alerts',
      value: dashData?.lowStockCount ?? 0,
      icon: FiAlertTriangle,
      color: dashData?.lowStockCount && dashData.lowStockCount > 0
        ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
        : 'bg-amber-50 text-amber-600 border-amber-100/50',
      action: () => navigate('/inventory'),
      badge: dashData?.lowStockCount && dashData.lowStockCount > 0 ? 'Critical' : undefined,
    },
    {
      title: 'Pending Invoices',
      value: dashData?.pendingInvoices ?? 0,
      icon: FiFileText,
      color: 'bg-purple-50 text-purple-600 border-purple-100/50',
      action: () => navigate('/billing'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-primary/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome back to MediLex!</h2>
          <p className="text-xs sm:text-sm text-teal-50/95 font-medium mt-1">
            Access dashboard statistics, track patient bookings, and audit medicine stock levels below.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/appointments?book=true')}
            className="flex items-center gap-1.5 bg-white text-primary text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <FiPlus className="w-4 h-4" />
            Book Visit
          </button>
        </div>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className="hoverable border border-gray-100"
                hoverable
                onClick={stat.action}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-2.5">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      {stat.title}
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 block">
                      {stat.value}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border text-xl ${stat.color}`}>
                      <Icon />
                    </div>
                    {stat.badge && (
                      <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Patient visits chart */}
        <Card title="Patient Visits" subtitle="Monthly clinic visit count trends">
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.patientVisits || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}
                  itemStyle={{ fontSize: '11px', color: '#0d9488' }}
                />
                <Area type="monotone" dataKey="visits" name="Visits" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue chart */}
        <Card title="Monthly Revenue" subtitle="Income overview across months">
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}
                  itemStyle={{ fontSize: '11px', color: '#0ea5e9' }}
                  formatter={(value: unknown) => [`$${value as string | number}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity logs */}
      <Card
        title="Audit Logs & Recent Activity"
        subtitle="Chronological trail of user operations"
        extra={
          <button
            onClick={() => navigate('/settings')}
            className="text-xs font-bold text-primary hover:text-primary-600 flex items-center gap-1"
          >
            Settings
            <FiArrowRight />
          </button>
        }
      >
        <div className="space-y-4">
          {dashData?.recentActivities && dashData.recentActivities.length > 0 ? (
            dashData.recentActivities.map((act) => (
              <div key={act.activity_id} className="flex gap-4 items-start p-3 hover:bg-slate-50/50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/30 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {act.action[0]}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-700">{act.action}</p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{act.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    By: {act.user_full_name || 'System Operator'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No recent activities available.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
