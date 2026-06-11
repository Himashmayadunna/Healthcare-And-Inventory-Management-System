import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiLock,
  FiActivity,
  FiAlertCircle,
  FiCpu,
  FiCheck,
  FiMail,
  FiChevronLeft,
} from 'react-icons/fi';

export const Signup: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Doctor' | 'Pharmacist' | 'Receptionist' | 'Admin'>('Doctor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Diagnostic states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Register through AuthContext (DB registration, fallback to Sandbox local memory)
      await registerUser(username, password, email, fullName, role);

      setIsSuccess(true);
      await new Promise((r) => setTimeout(r, 2000));
      navigate('/login');
    } catch (err: unknown) {
      console.error('Registration failed', err);
      const error = err as { message?: string };
      setError(error.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans overflow-y-auto select-none relative">
      {/* Background Soft Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sky-500/[0.04] rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 flex flex-col my-8">
        {/* Logo Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            <FiActivity />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base leading-none tracking-tight">MediLex</h1>
            <p className="text-[10px] text-teal-600 font-bold mt-1 uppercase tracking-wider">Healthcare & Inventory</p>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider mb-6 cursor-pointer self-start transition-all"
        >
          <FiChevronLeft className="text-base" />
          Back to login
        </button>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="signup-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Create Staff Account</h2>
                <p className="text-xs text-slate-400 mt-2 font-semibold">
                  Set up clinical credentials and register your account.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2.5"
                >
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <FiUser className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Jane Doe"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <FiMail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@medilex.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Username ID */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Username ID *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <FiCpu className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="jane_doe"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Security Passcode */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Security Passcode *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <FiLock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Security code"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Professional Clinical Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Doctor' | 'Pharmacist' | 'Receptionist' | 'Admin')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Doctor">Doctor (Clinical Diagnostics)</option>
                    <option value="Pharmacist">Pharmacist (Supply & Dispensary)</option>
                    <option value="Receptionist">Receptionist (Admissions & Booking)</option>
                    <option value="Admin">Administrator (Operations & Billing)</option>
                  </select>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white text-xs font-bold py-3.5 px-4 rounded-2xl hover:bg-primary-600 transition-all shadow-md shadow-primary/20 disabled:opacity-50 uppercase tracking-wider cursor-pointer"
                >
                  {isLoading ? 'Creating Staff Account...' : 'Generate Access Token'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-white border border-slate-100 rounded-3xl max-w-md mx-auto space-y-4 shadow-premium"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
                <FiCheck />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Account Created Successfully</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Your credentials have been registered in our database. Redirecting to the secure clinical auth portal...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
