import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fade-in overflow-y-auto">
      {/* Background Overlay (Darkened without blur) */}
      <div
        className="fixed inset-0 bg-slate-900/60"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Card Centered Perfectly */}
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#C9A96E]/20 z-10 flex flex-col my-auto overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8F3E9]/50 shrink-0">
            <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
