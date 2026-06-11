import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiLock,
  FiUser,
  FiActivity,
  FiAlertCircle,
} from 'react-icons/fi';

export const Login: React.FC = () => {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || 
        'Database connection failure or invalid credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans overflow-y-auto select-none relative">
      {/* Background Soft Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sky-500/[0.04] rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 flex flex-col my-8">
        {/* Logo Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary/20">
            <FiActivity />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base leading-none tracking-tight">MediLex</h1>
            <p className="text-[10px] text-teal-600 font-bold mt-1 uppercase tracking-wider">Healthcare & Inventory</p>
          </div>
        </div>

        {/* Credentials Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Clinical Portal Access</h2>
            <p className="text-xs text-slate-400 mt-2 font-semibold">
              Sign in using clinical staff credentials or email address.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2.5"
            >
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {/* Username/Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Username or Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FiUser className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. doctor, receptionist, or email@clinic.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Clinic Security Code (Passcode)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account security code"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white text-xs font-bold py-3.5 px-4 rounded-2xl hover:bg-primary-600 transition-all shadow-md shadow-primary/20 disabled:opacity-50 uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? 'Decrypting Security Token...' : 'Authorize Login'}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              New medical officer?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-primary hover:text-teal-600 font-bold transition-all underline ml-1 cursor-pointer"
              >
                Register Staff Account
              </button>
            </p>
          </div>
        </motion.div>

        {/* Guest fallback mode widget */}
        <div className="mt-8 border-t border-slate-200/80 pt-6 text-center space-y-4 max-w-sm mx-auto w-full">
          <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest">
            <span className="bg-slate-50 px-3 text-slate-400">Offline Simulation</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            If SQL Server is not active or you want to preview the system offline, bypass with:
          </p>
          <button
            onClick={handleGuestLogin}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold py-2.5 px-4 rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-premium"
          >
            Explore Sandbox as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
