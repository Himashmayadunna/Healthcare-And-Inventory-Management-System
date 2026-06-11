import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiActivity,
  FiCalendar,
  FiFileText,
  FiArchive,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiMenu,
  FiX,
  FiPlus,
} from 'react-icons/fi';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/patients', label: 'Patients', icon: FiUsers },
    { to: '/doctors', label: 'Doctors', icon: FiActivity },
    { to: '/appointments', label: 'Appointments', icon: FiCalendar },
    { to: '/prescriptions', label: 'Prescriptions', icon: FiFileText },
    { to: '/inventory', label: 'Inventory', icon: FiArchive },
    { to: '/billing', label: 'Billing', icon: FiDollarSign },
    { to: '/analytics', label: 'Analytics', icon: FiTrendingUp },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const match = navLinks.find((link) => link.to === currentPath);
    return match ? match.label : 'Management System';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ==========================================
          DESKTOP SIDEBAR (FIXED)
          ========================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary/20">
            M
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-none">MediLex</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">Health & Inventory</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Upgrade Pro Widget */}
        <div className="p-4 mx-4 mb-3 bg-gradient-to-tr from-teal-50 to-teal-100/50 rounded-2xl border border-teal-100">
          <h4 className="text-xs font-bold text-teal-800">Upgrade to Pro</h4>
          <p className="text-[10px] text-teal-600 mt-1 font-medium leading-relaxed">
            Unlock advanced analytics, AI patient sorting, and PDF reports.
          </p>
          <button className="mt-3 w-full bg-primary text-white text-[11px] font-bold py-2 px-3 rounded-xl hover:bg-primary-600 transition-colors shadow-sm">
            Get Started
          </button>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Logout {isGuest && '(Guest)'}
          </button>
        </div>
      </aside>

      {/* ==========================================
          MOBILE NAVIGATION HEADER
          ========================================== */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <span className="font-bold text-slate-800 text-sm">MediLex</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
        >
          {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30"
        />
      )}

      {/* Mobile Sidebar Panel */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 ease-out flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="font-bold text-slate-800 text-base">MediLex</span>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === link.to
                    ? 'bg-primary text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Logout {isGuest && '(Guest)'}
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTAINER WRAPPER
          ========================================== */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 pt-16 lg:pt-0">
        {/* Sticky Header */}
        <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 z-20">
          {/* Header Left: Section name */}
          <div className="hidden md:block">
            <h2 className="font-bold text-slate-800 text-base tracking-wide">{getPageTitle()}</h2>
          </div>

          {/* Search bar inside header */}
          <div className="relative max-w-xs sm:max-w-md w-full md:mx-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search patients, doctors, medicines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-semibold text-slate-600 transition-all outline-hidden"
            />
          </div>

          {/* Header Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Quick action: Book appointment */}
            <button
              onClick={() => navigate('/appointments?book=true')}
              className="hidden sm:flex items-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-primary-600 shadow-sm transition-all"
            >
              <FiPlus className="w-4 h-4" />
              New Appointment
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 border border-gray-100 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun className="w-4 h-4 text-amber-500" /> : <FiMoon className="w-4 h-4" />}
            </button>

            {/* Notification alert bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 border border-gray-100 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative"
                aria-label="View notifications"
              >
                <FiBell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
              </button>

              {/* Notification drop menu */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl custom-shadow border border-gray-100 p-4 z-30 flex flex-col gap-2.5">
                    <h5 className="font-bold text-xs text-slate-800 border-b border-gray-100 pb-2">Notifications</h5>
                    <div className="text-[11px] text-slate-500 space-y-3">
                      <div className="p-1 hover:bg-slate-50 rounded-lg">
                        <p className="font-semibold text-slate-700">Stock Alert: Atorvastatin</p>
                        <p className="mt-0.5">Quantity is below reorder level (8 units left).</p>
                      </div>
                      <div className="p-1 hover:bg-slate-50 rounded-lg">
                        <p className="font-semibold text-slate-700">Billing generated: Bruce Wayne</p>
                        <p className="mt-0.5">Invoice #1 created for $250.00.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-3 border-l border-gray-100 pl-3">
              <div className="hidden xl:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.fullName || 'User Profile'}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-none">{user?.role || 'Guest'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary font-bold text-sm flex items-center justify-center border border-teal-100">
                {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content body with responsive sizing */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
