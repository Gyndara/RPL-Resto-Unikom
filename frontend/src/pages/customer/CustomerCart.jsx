import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { ShoppingBag, Plus, Minus, Trash2, Send, UtensilsCrossed } from 'lucide-react';

import { getImageUrl } from '../../utils/imageUrl';

export default function CustomerCart() {
  const { customerSession, cart, updateCartQuantity, updateCartNotes, clearCart, cartTotal, cartItemCount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!customerSession) {
    navigate('/customer');
    return null;
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang Anda kosong');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_meja: customerSession.tableId,
        nama_pelanggan: customerSession.name,
        items: cart.map((item) => ({
          id_menu: item.id_menu,
          jumlah: item.jumlah,
          catatan: item.catatan || '',
        })),
      };

      await api.post('/orders', payload);
      toast.success('Pesanan berhasil dikirim ke dapur!');
      clearCart();
      navigate('/customer/status');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header matching Customer.png Screen 3 */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your cart</h1>
        <p className="text-sm text-slate-500 font-medium">Review your selections and place your order</p>
      </div>

      {cart.length === 0 ? (
        <EmptyState
          title="Keranjang Kosong"
          description="Anda belum menambahkan pesanan apapun ke keranjang."
          action={
            <Button onClick={() => navigate('/customer/menu')} variant="dark" size="md">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Lihat Menu</span>
            </Button>
          }
        />
      ) : (
        /* Split Layout 2:1 matching Customer.png Screen 3 */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id_menu}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={getImageUrl(item.gambar)}
                    alt={item.nama_menu}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{item.nama_menu}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Rp {item.harga.toLocaleString('id-ID')} each
                    </p>
                    <input
                      type="text"
                      value={item.catatan || ''}
                      onChange={(e) => updateCartNotes(item.id_menu, e.target.value)}
                      placeholder="Catatan..."
                      className="mt-2 text-xs px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                    <button
                      onClick={() => updateCartQuantity(item.id_menu, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-xs hover:bg-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs w-6 text-center">{item.jumlah}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id_menu, 1)}
                      className="w-7 h-7 rounded-lg bg-[#2A2725] text-white flex items-center justify-center font-bold shadow-xs hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => updateCartQuantity(item.id_menu, -item.jumlah)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: ORDER SUMMARY Card matching Customer.png */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-5">
            <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
              ORDER SUMMARY
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items</span>
                <span className="font-extrabold text-slate-900">{cartItemCount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-extrabold text-slate-900">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service</span>
                <span className="font-extrabold text-emerald-600">Include</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total</span>
                <span className="text-lg font-black text-slate-900">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full bg-[#2A2725] hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
