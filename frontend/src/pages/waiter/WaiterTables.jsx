import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Bell, Users, CheckCircle2, Utensils } from 'lucide-react';

export default function WaiterTables() {
  const [tables, setTables] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [resTables, resOrders] = await Promise.all([
        api.get('/tables'),
        api.get('/orders'),
      ]);
      setTables(resTables.data.data);
      const orders = resOrders.data.data;
      setReadyOrders(orders.filter((o) => o.status_pesanan === 'Ready'));
      setActiveOrders(orders.filter((o) => o.status_pesanan !== 'Completed' && o.status_pesanan !== 'Cancelled'));
    } catch (err) {
      console.error('Error fetching waiter data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    setActionLoading(true);
    try {
      await api.put(`/orders/${orderId}`, { status_pesanan: 'Delivered' });
      toast.success('Pesanan ditandai sebagai disajikan!');
      fetchData();
      setSelectedTable(null);
    } catch (err) {
      toast.error('Gagal memperbarui status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/tables/${tableId}`, { status_meja: newStatus });
      toast.success(`Status ${selectedTable?.nama_meja} diperbarui`);
      fetchData();
      setSelectedTable(null);
    } catch (err) {
      toast.error('Gagal memperbarui status meja');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header bar matching Pelayan.png */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Waiter Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Monitor table availability and food delivery</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold shadow-xs">
          <Bell className="w-4 h-4 text-amber-600" />
          <span>{readyOrders.length} ready to serve</span>
        </div>
      </div>

      {/* Section 1: Ready to Serve matching Pelayan.png */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Ready to Serve</h2>
        </div>

        {readyOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs text-slate-400 text-center font-medium">
            Belum ada hidangan siap diantar dari dapur.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {readyOrders.map((ord) => (
              <div
                key={ord.id_pesanan}
                className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">#ORD-{ord.id_pesanan.toString().padStart(3, '0')}</h3>
                    <p className="text-xs text-slate-600 font-bold">{ord.nama_pelanggan} ({ord.meja?.nama_meja})</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-extrabold rounded-full border border-amber-200">
                    Ready
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5">
                  {ord.detail.map((d) => (
                    <p key={d.id_detail}>{d.jumlah}x {d.menu.nama_menu}</p>
                  ))}
                </div>

                <button
                  onClick={() => handleDeliverOrder(ord.id_pesanan)}
                  disabled={actionLoading}
                  className="w-full bg-[#C9A96E] hover:bg-[#B5955B] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Served</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Table Grid matching Pelayan.png (5 columns desktop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">Table</h2>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Occupied
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <Skeleton key={n} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tables.map((tbl) => {
              const activeOrd = tbl.pesanan && tbl.pesanan[0];
              const isOccupied = tbl.status_meja !== 'Available' || activeOrd;

              return (
                <div
                  key={tbl.id_meja}
                  onClick={() => setSelectedTable(tbl)}
                  className={`p-4 rounded-2xl border-2 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 relative ${
                    isOccupied
                      ? 'border-rose-400 text-rose-900'
                      : 'border-emerald-400 text-emerald-900'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-sm text-slate-900">{tbl.nama_meja}</h4>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold opacity-80">
                    <Users className="w-4 h-4" />
                    <span>{tbl.kapasitas} Seat</span>
                  </div>

                  <div className="pt-2 text-[11px] font-bold">
                    {activeOrd ? (
                      <span className="text-rose-600 block truncate">{activeOrd.nama_pelanggan}</span>
                    ) : (
                      <span className="text-emerald-600 block">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Order Tracker matching Pelayan.png */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">Order Tracker</h2>
        {activeOrders.length === 0 ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-400 text-center font-medium">
            Tidak ada transaksi pesanan aktif saat ini.
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((ord) => (
              <div
                key={ord.id_pesanan}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">#ORD-{ord.id_pesanan.toString().padStart(3, '0')}</h4>
                  <p className="text-slate-500 font-medium mt-0.5">
                    {ord.nama_pelanggan} • {ord.meja?.nama_meja} • {new Date(ord.tanggal_pesanan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {ord.detail.length} items
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Detail Modal */}
      {selectedTable && (
        <Modal isOpen={!!selectedTable} onClose={() => setSelectedTable(null)} title={`Detail ${selectedTable.nama_meja}`}>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold">Kapasitas Kursi</span>
              <span className="text-sm font-extrabold">{selectedTable.kapasitas} Seat</span>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase">Ubah Status Meja</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateTableStatus(selectedTable.id_meja, 'Available')}
                  className="py-2 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                >
                  Set Available
                </button>
                <button
                  onClick={() => handleUpdateTableStatus(selectedTable.id_meja, 'Dining')}
                  className="py-2 px-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer"
                >
                  Set Occupied (Dining)
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
