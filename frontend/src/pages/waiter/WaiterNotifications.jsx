import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { BellRing, Truck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function WaiterNotifications() {
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadyOrders();
    const interval = setInterval(fetchReadyOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchReadyOrders = async () => {
    try {
      const res = await api.get('/orders', {
        params: { status: 'Ready' },
      });
      setReadyOrders(res.data.data);
    } catch (err) {
      console.error('Error fetching ready orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status_pesanan: 'Delivered' });
      toast.success('Makanan berhasil diantar!');
      fetchReadyOrders();
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notifikasi Hidangan Siap Diantar</h2>
          <p className="text-xs text-slate-500">Daftar pesanan dari dapur yang sudah siap untuk diantarkan ke meja.</p>
        </div>
        <button
          onClick={fetchReadyOrders}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {readyOrders.length === 0 ? (
        <EmptyState
          title="Tidak Ada Hidangan Menunggu"
          description="Semua makanan dari dapur telah selesai diantarkan."
          icon={BellRing}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readyOrders.map((order) => (
            <div
              key={order.id_pesanan}
              className="bg-white p-5 rounded-3xl border border-[#C9A96E]/30 shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">ORDER #{order.id_pesanan}</span>
                  <h3 className="text-lg font-extrabold text-slate-800">{order.meja.nama_meja}</h3>
                  <p className="text-xs text-[#C9A96E] font-semibold">{order.nama_pelanggan}</p>
                </div>
                <Badge status="Ready" />
              </div>

              <div className="bg-[#F8F3E9]/50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                {order.detail.map((d) => (
                  <div key={d.id_detail} className="flex justify-between">
                    <span className="font-semibold text-slate-700">{d.jumlah}x {d.menu.nama_menu}</span>
                    {d.catatan && <span className="text-slate-400 italic">({d.catatan})</span>}
                  </div>
                ))}
              </div>

              <Button onClick={() => handleDeliver(order.id_pesanan)} variant="orange" size="md" className="w-full">
                <Truck className="w-4 h-4" />
                <span>Konfirmasi Hidangan Diantar</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
