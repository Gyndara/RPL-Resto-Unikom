import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Hide sidebar for all staff roles (pelayan, chef, kasir, manager)
  const hideSidebar = user?.role === 'pelayan' || user?.role === 'chef' || user?.role === 'kasir' || user?.role === 'manager';

  const getTitleByPath = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes('/waiter')) return 'Waiter Dashboard';
    if (path.includes('/chef')) return 'Chef Dashboard';
    if (path.includes('/cashier/reports')) return 'Kasir Laporan';
    if (path.includes('/cashier')) return 'Kasir';
    if (path.includes('/manager/register')) return 'Register Akun Pegawai';
    if (path.includes('/manager/reports')) return 'Manager Analytics';
    if (path.includes('/manager')) return 'Manager Analytics';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex text-slate-800 font-sans">
      {!hideSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className={`flex-1 ${hideSidebar ? 'pl-0' : 'md:pl-64'} flex flex-col min-w-0 transition-all duration-300`}>
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getTitleByPath()} hideSidebar={hideSidebar} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
