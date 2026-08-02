import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitleByPath = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes('/waiter/tables')) return 'Status Meja & Pelayanan';
    if (path.includes('/waiter/notifications')) return 'Notifikasi Dapur';
    if (path.includes('/waiter')) return 'Dashboard Pelayan';
    if (path.includes('/chef/menu')) return 'Manajemen Menu & Stok Porsi';
    if (path.includes('/chef')) return 'Pesanan Dapur (Kitchen Display)';
    if (path.includes('/cashier/reports')) return 'Laporan Transaksi Kasir';
    if (path.includes('/cashier')) return 'Kasir & Proses Pembayaran';
    if (path.includes('/manager/reports')) return 'Laporan & Analytics Pendapatan';
    if (path.includes('/manager')) return 'Dashboard Analytics Manajer';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F8F3E9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 transition-all duration-300">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getTitleByPath()} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
