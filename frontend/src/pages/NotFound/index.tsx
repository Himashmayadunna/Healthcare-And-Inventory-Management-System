import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 custom-shadow">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-primary flex items-center justify-center text-3xl mx-auto mb-6 border border-teal-100 animate-bounce">
          <FiAlertCircle />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mt-2">Page Not Found</h2>
        <p className="text-sm text-slate-400 mt-3 font-medium leading-relaxed">
          The page you are looking for does not exist or has been moved to another section.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold py-3 px-6 rounded-2xl hover:bg-primary-600 transition-all shadow-md shadow-primary/20"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
