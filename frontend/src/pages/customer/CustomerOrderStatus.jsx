import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, ChefHat, Truck, Utensils, Plus, RefreshCw } from 'lucide-react';

export default function CustomerOrderStatus() {
  const { customerSession } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerSession) {
      navigate('/customer');
      return;
    }

    fetchTableOrders();
    const interval = setInterval(fetchTableOrders, 5000); // Polling status updates every 5 sec
    return () => clearInterval(interval);
  }, [customerSession, navigate]);

  const fetchTableOrders = async () => {
    try {
      const res = await api.get('/orders', {
        params: {
          tableId: customerSession.tableId,
        },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error('Error fetching status', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Cooking':
        return 2;
      case 'Ready':
        return 3;
      case 'Delivered':
      case 'Completed':
        return 4;
      default:
        return 1;
    }
  };

  const activeOrder = orders.find((o) => o.status_pesanan !== 'Cancelled' && o.status_pesanan !== 'Completed') || orders[0];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Status Pesanan Meja</h2>
          <p className="text-xs text-slate-500">
            {customerSession?.tableName} • Pemesan: <span className="font-semibold text-[#C9A96E]">{customerSession?.name}</span>
          </p>
        </div>
        <button
          onClick={fetchTableOrders}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : !activeOrder ? (
        <EmptyState
          title="Belum Ada Pesanan Aktif"
          description="Anda belum memiliki pesanan aktif di meja ini."
          action={
            <Button onClick={() => navigate('/customer/menu')} variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Buat Pesanan Baru</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {/* Status Timeline Box */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9A96E]/30 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Order ID</span>
                <h4 className="font-black text-slate-800 text-sm">#ORD-{activeOrder.id_pesanan.toString().padStart(4, '0')}</h4>
              </div>
              <Badge status={activeOrder.status_pesanan} />
            </div>

            {/* Step Progress Visualizer */}
            <div className="relative flex items-center justify-between px-2">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
              <div
                className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#C9A96E] transition-all duration-500 -z-0"
                style={{
                  width: `${((getStatusStep(activeOrder.status_pesanan) - 1) / 3) * 100}%`,
                }}
              />

              {[
                { step: 1, label: 'Pending', icon: Clock },
                { step: 2, label: 'Dimasak', icon: ChefHat },
                { step: 3, label: 'Siap', icon: Utensils },
                { step: 4, label: 'Diantar', icon: Truck },
              ].map((s) => {
                const Icon = s.icon;
                const isCurrent = getStatusStep(activeOrder.status_pesanan) === s.step;
                const isDone = getStatusStep(activeOrder.status_pesanan) >= s.step;

                return (
                  <div key={s.step} className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-[#C9A96E] text-white shadow-md ring-4 ring-amber-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold ${isCurrent ? 'text-[#C9A96E]' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Item Details List */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Rincian Item Pesanan</h4>
            <div className="divide-y divide-slate-100">
              {activeOrder.detail.map((d) => (
                <div key={d.id_detail} className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{d.menu.nama_menu}</h5>
                    <p className="text-xs text-slate-500">
                      {d.jumlah}x @ Rp {d.harga.toLocaleString('id-ID')}
                      {d.catatan && <span className="block text-[11px] text-amber-600 font-medium italic mt-0.5">Catatan: {d.catatan}</span>}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    Rp {d.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-700 text-sm">Total Bayar</span>
              <span className="font-black text-[#C9A96E] text-lg">
                Rp {activeOrder.detail.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Action Button for Additional Order */}
          <Button
            onClick={() => navigate('/customer/menu')}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pesanan Tambahan</span>
          </Button>
        </div>
      )}
    </div>
  );
}
