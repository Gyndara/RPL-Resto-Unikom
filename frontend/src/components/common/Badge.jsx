import React from 'react';
import clsx from 'clsx';

export default function Badge({ children, status, variant, className = '' }) {
  let styleClass = 'bg-slate-100 text-slate-700 border-slate-200';

  const key = status || variant;

  switch (key) {
    case 'Available':
    case 'Ready':
    case 'Completed':
    case 'Delivered':
    case 'success':
      styleClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      break;
    case 'Ordering':
    case 'Cooking':
    case 'warning':
      styleClass = 'bg-amber-50 text-amber-700 border-amber-200/80';
      break;
    case 'Dining':
    case 'Pending':
    case 'info':
      styleClass = 'bg-sky-50 text-sky-700 border-sky-200/80';
      break;
    case 'Unavailable':
    case 'Cancelled':
    case 'danger':
      styleClass = 'bg-rose-50 text-rose-700 border-rose-200/80';
      break;
    default:
      break;
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase',
        styleClass,
        className
      )}
    >
      {children || status}
    </span>
  );
}
