import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  extra,
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-6 custom-shadow transition-all duration-300 ${
        hoverable ? 'hover:shadow-card hover:-translate-y-1 cursor-pointer' : ''
      } ${className}`}
    >
      {(title || subtitle || extra) && (
        <div className="flex justify-between items-start mb-5 gap-4">
          <div>
            {title && <h3 className="font-semibold text-lg text-slate-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {extra && <div className="flex-shrink-0">{extra}</div>}
        </div>
      )}
      <div className="text-slate-600">{children}</div>
    </div>
  );
};
