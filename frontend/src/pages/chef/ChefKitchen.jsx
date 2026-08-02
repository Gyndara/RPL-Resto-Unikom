import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { ChefHat, Flame, CheckCircle2, Clock, UtensilsCrossed } from 'lucide-react';

export default function ChefKitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const res = await api.get('/orders', {
        params: { status: 'Pending,Cooking,Ready' },
      });
      setOrders(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil pesanan dapur');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status_pesanan: newStatus });
      toast.success(`Status pesanan #${orderId} diubah ke ${newStatus}`);
      fetchKitchenOrders();
    } catch (err) {
      toast.error('Gagal memperbarui status pesanan');
    }
  };

  const pendingCount = orders.filter((o) => o.status_pesanan === 'Pending').length;
  const cookingCount = orders.filter((o) => o.status_pesanan === 'Cooking').length;
  const readyCount = orders.filter((o) => o.status_pesanan === 'Ready').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header matching Chef.png */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Chef Dashboard</h1>
        </div>

        {/* Navigation Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => navigate('/chef')}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 shadow-xs cursor-pointer"
          >
            Order Queue
          </button>
          <button
            onClick={() => navigate('/chef/menu')}
            className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Section Title & Status Counts matching Chef.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Incoming Orders</h2>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> {pendingCount} Pending
          </span>
          <span className="flex items-center gap-1.5 text-sky-600">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> {cookingCount} Cooking
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> {readyCount} Ready
          </span>
        </div>
      </div>

      {/* 2-Column Grid of Order Cards matching Chef.png Screen 1 */}
      {loading && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-60 w-full rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="Antrean Dapur Bersih" description="Tidak ada pesanan masuk saat ini." icon={ChefHat} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => {
            const isCooking = order.status_pesanan === 'Cooking';
            const isPending = order.status_pesanan === 'Pending';
            const isReady = order.status_pesanan === 'Ready';

            return (
              <div
                key={order.id_pesanan}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Order Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">#ORD-{order.id_pesanan.toString().padStart(3, '0')}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {order.nama_pelanggan} - {order.meja?.nama_meja}
                      </p>
                    </div>
                    <Badge status={order.status_pesanan} />
                  </div>

                  {/* Item List with price on right */}
                  <div className="py-4 space-y-2 text-xs">
                    {order.detail.map((d) => (
                      <div key={d.id_detail} className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800">
                          {d.jumlah} x {d.menu.nama_menu}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          Rp {d.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Time & Action Button matching Chef.png */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(order.tanggal_pesanan).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => handleUpdateStatus(order.id_pesanan, 'Cooking')}
                      className="px-5 py-2.5 bg-[#C9A96E] hover:bg-[#B5955B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Star Cooking
                    </button>
                  )}

                  {isCooking && (
                    <button
                      onClick={() => handleUpdateStatus(order.id_pesanan, 'Ready')}
                      className="px-5 py-2.5 bg-[#2A2725] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Ready to Serve</span>
                    </button>
                  )}

                  {isReady && (
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                      Awaiting Pickup
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
