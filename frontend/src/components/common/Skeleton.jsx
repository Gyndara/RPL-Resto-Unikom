import React from 'react';
import clsx from 'clsx';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'animate-pulse bg-slate-200/80';
  const variants = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return <div className={clsx(base, variants[variant], className)} />;
}
