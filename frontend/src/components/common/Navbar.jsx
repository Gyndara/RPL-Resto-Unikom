import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu as MenuIcon, Bell, Sparkles } from 'lucide-react';

export default function Navbar({ onToggleSidebar, title }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-20 bg-white border-b border-[#C9A96E]/20 px-4 md:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Toggle Sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Resto Management Portal • Role: <span className="capitalize font-semibold text-[#C9A96E]">{user?.role}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F3E9] text-[#7A5C28] text-xs font-semibold border border-[#C9A96E]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span>Live Resto Operational</span>
        </div>

        <button className="relative p-2.5 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
