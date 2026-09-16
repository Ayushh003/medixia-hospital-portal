import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    Scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
    'In-Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    doctor: 'bg-blue-50 text-blue-700 border-blue-200',
    receptionist: 'bg-teal-50 text-teal-700 border-teal-200',
    patient: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
