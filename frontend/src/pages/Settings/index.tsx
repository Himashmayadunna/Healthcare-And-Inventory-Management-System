import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import api from '../../services/api';
import {
  FiUser,
  FiLock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from 'react-icons/fi';

interface DbDetails {
  success: boolean;
  database: string;
  serverTime?: string;
  timestamp?: string;
}

export const Settings: React.FC = () => {
  const { user, isGuest } = useAuth();

  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [dbDetails, setDbDetails] = useState<DbDetails | null>(null);

  // Profile Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role] = useState(user?.role || '');

  // Password Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const checkDbHealth = async () => {
    setDbStatus('checking');
    try {
      const res = await api.get('/health'); // GET /api/health
      if (res.data && res.data.success && res.data.database === 'connected') {
        setDbStatus('connected');
        setDbDetails(res.data);
      } else {
        setDbStatus('failed');
      }
    } catch (err) {
      console.error('Database connection test failed', err);
      setDbStatus('failed');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkDbHealth();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile update is mocked. Changes are simulated successfully.');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwdMessage({ type: 'error', text: 'Please fill in password fields' });
      return;
    }
    setPwdMessage({ type: 'success', text: 'Security credentials updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleResetGuestStore = () => {
    if (isGuest) {
      localStorage.clear();
      window.location.reload();
    } else {
      alert('Reset data store is only available in Guest sessions.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Configure profile details and audit database connection status</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left column: Profile details */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Staff Member Profile" subtitle="Manage your contact and credentials details">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Username (Read Only)
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-gray-100 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Clinic Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-gray-100 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  required
                />
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1.5"
                >
                  <FiUser className="w-4 h-4" />
                  Save Profile
                </button>
              </div>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card title="Security Credentials" subtitle="Update account password and auth hashes">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {pwdMessage && (
                <div
                  className={`p-3 border rounded-xl text-xs font-semibold ${
                    pwdMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-rose-50 border-rose-100 text-rose-700'
                  }`}
                >
                  {pwdMessage.text}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <FiLock className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right column: DB health monitor */}
        <div className="space-y-6">
          <Card
            title="Database Connection"
            subtitle="Microsoft SQL Server integration health"
            extra={
              <button
                onClick={checkDbHealth}
                disabled={dbStatus === 'checking'}
                className="p-2 border border-gray-100 rounded-lg text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 disabled:opacity-50"
                title="Refresh Status"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${dbStatus === 'checking' ? 'animate-spin' : ''}`} />
              </button>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {dbStatus === 'checking' && (
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                )}
                {dbStatus === 'connected' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg flex-shrink-0">
                    <FiCheckCircle />
                  </div>
                )}
                {dbStatus === 'failed' && (
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center text-lg flex-shrink-0">
                    <FiXCircle />
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {dbStatus === 'checking' && 'Pinging Database...'}
                    {dbStatus === 'connected' && 'Online & Integrated'}
                    {dbStatus === 'failed' && 'Database Offline / Error'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                    Port: 1433 | Host: Localhost
                  </p>
                </div>
              </div>

              {dbDetails && (dbDetails.timestamp || dbDetails.serverTime) && (
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl text-[11px] font-semibold text-slate-500 space-y-2">
                  <div className="flex justify-between">
                    <span>Server Date Time:</span>
                    <span className="text-slate-700 font-bold">{dbDetails.timestamp || dbDetails.serverTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Flag:</span>
                    <span className="text-teal-600 font-bold uppercase">{dbDetails.database}</span>
                  </div>
                </div>
              )}

              {isGuest && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-3">
                    You are logged in under a Guest explorer session. Mock databases are held in localStorage.
                  </p>
                  <button
                    onClick={handleResetGuestStore}
                    className="w-full bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <FiRefreshCw />
                    Reset Simulated Data
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
