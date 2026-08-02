import React from 'react';
import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#C9A96E] hover:bg-[#B5955B] text-white focus:ring-[#C9A96E] shadow-sm hover:shadow-md',
    secondary: 'bg-[#F8F3E9] text-[#7A5C28] hover:bg-[#EFE5D3] focus:ring-[#C9A96E] border border-[#C9A96E]/30',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400 shadow-sm',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-700',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-400 bg-white',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
