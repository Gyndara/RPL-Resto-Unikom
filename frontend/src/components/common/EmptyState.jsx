import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia saat ini.',
  icon: Icon = Inbox,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="w-16 h-16 rounded-2xl bg-[#F8F3E9] flex items-center justify-center text-[#C9A96E] mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
