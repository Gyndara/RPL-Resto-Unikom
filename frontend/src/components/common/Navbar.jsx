import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, UtensilsCrossed, LogOut } from 'lucide-react';

export default function Navbar({ onToggleSidebar, title, hideSidebar }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isChef = user?.role === 'chef';
  const isChefMenu = location.pathname.includes('/chef/menu');

  const isManager = user?.role === 'manager';
  const isManagerReports = location.pathname.includes('/manager/reports');

  return (
    <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200/80 px-6 md:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        {!hideSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-sm">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Center Tab Switcher for Chef in Header Navbar matching Chef.png */}
      {isChef && (
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => navigate('/chef')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              !isChefMenu
                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Order Queue
          </button>
          <button
            onClick={() => navigate('/chef/menu')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              isChefMenu
                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Menu
          </button>
        </div>
      )}

      {/* Center Tab Switcher for Manager in Header Navbar */}
      {isManager && (
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => navigate('/manager')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              !isManagerReports
                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dashboard Analytics
          </button>
          <button
            onClick={() => navigate('/manager/reports')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              isManagerReports
                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Laporan Pendapatan
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-slate-900 block">{user?.nama_pegawai}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A96E] block">
            {user?.role}
          </span>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] font-extrabold text-sm flex items-center justify-center border border-[#C9A96E]/30">
          {user?.nama_pegawai ? user.nama_pegawai.charAt(0) : 'U'}
        </div>

        {/* Header Logout Button */}
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer ml-1"
          title="Keluar System"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
