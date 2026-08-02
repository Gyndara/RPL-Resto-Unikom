import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid,
  BellRing,
  ChefHat,
  Menu as MenuIcon,
  CreditCard,
  BarChart3,
  LogOut,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logoutUser } = useAuth();

  if (!user) return null;

  const role = user.role;

  const roleMenus = {
    pelayan: [
      { name: 'Dashboard', path: '/waiter', icon: LayoutDashboard },
      { name: 'Status Meja', path: '/waiter/tables', icon: Grid },
      { name: 'Notifikasi Dapur', path: '/waiter/notifications', icon: BellRing },
    ],
    chef: [
      { name: 'Pesanan Dapur', path: '/chef', icon: ChefHat },
      { name: 'Kelola Menu', path: '/chef/menu', icon: MenuIcon },
    ],
    kasir: [
      { name: 'Pembayaran', path: '/cashier', icon: CreditCard },
      { name: 'Laporan Kasir', path: '/cashier/reports', icon: BarChart3 },
    ],
    manager: [
      { name: 'Dashboard Analytics', path: '/manager', icon: BarChart3 },
      { name: 'Laporan Pendapatan', path: '/manager/reports', icon: LayoutDashboard },
    ],
  };

  const navItems = roleMenus[role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#C9A96E]/20 shadow-xl transition-transform duration-300 flex flex-col justify-between overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand (Fixed Top) */}
          <div className="flex items-center gap-3 px-6 h-20 border-b border-[#F8F3E9] bg-[#F8F3E9]/40 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#2A2725] flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                RESTO <span className="text-[#C9A96E]">UNIKOM</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
                Management System
              </p>
            </div>
          </div>

          {/* Navigation Items (Scrollable Middle) */}
          <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/waiter` || item.path === `/chef` || item.path === `/cashier` || item.path === `/manager`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[#2A2725] text-white shadow-md font-semibold'
                        : 'text-slate-600 hover:bg-[#F8F3E9] hover:text-[#C9A96E]'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Footer Profile & Logout (Fixed Bottom) */}
          <div className="p-4 border-t border-slate-100 bg-[#F8F3E9]/30 shrink-0">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#C9A96E]/20 shadow-xs mb-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] font-bold text-sm flex items-center justify-center shrink-0">
                  {user.nama_pegawai ? user.nama_pegawai.charAt(0) : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.nama_pegawai}</p>
                  <span className="text-[10px] uppercase font-semibold text-[#C9A96E] tracking-wider block">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logoutUser}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar System</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
