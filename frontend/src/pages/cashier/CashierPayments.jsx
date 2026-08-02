import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { CreditCard, QrCode, Banknote, Printer, CheckCircle2, Search, UtensilsCrossed } from 'lucide-react';

export default function CashierPayments() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 1 Find Order Filter State
  const [tableFilter, setTableFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Selected Order for Checkout (Step 2 & 3)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashAmount, setCashAmount] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const res = await api.get('/orders');
      const unpaid = res.data.data.filter(
        (o) => o.status_pesanan !== 'Completed' && o.status_pesanan !== 'Cancelled'
      );
      setActiveOrders(unpaid);
      if (unpaid.length > 0 && !selectedOrder) {
        setSelectedOrder(unpaid[0]);
      }
    } catch (err) {
      toast.error('Gagal mengambil daftar tagihan');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (order) => {
    if (!order || !order.detail) return 0;
    return order.detail.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleProcessPayment = async () => {
    if (!selectedOrder) {
      toast.error('Silakan pilih pesanan terlebih dahulu');
      return;
    }
    const total = calculateTotal(selectedOrder);

    if (paymentMethod === 'Cash' && cashAmount && parseFloat(cashAmount) < total) {
      toast.error('Uang tunai kurang dari total pembayaran');
      return;
    }

    setProcessLoading(true);
    try {
      const res = await api.post('/payments', {
        id_pesanan: selectedOrder.id_pesanan,
        metode_pembayaran: paymentMethod,
        total_pembayaran: total,
      });

      toast.success('Pembayaran berhasil diproses!');

      setReceiptData({
        payment: res.data.data,
        order: selectedOrder,
        cashPaid: paymentMethod === 'Cash' ? parseFloat(cashAmount || total) : total,
        change: paymentMethod === 'Cash' ? Math.max(0, parseFloat(cashAmount || total) - total) : 0,
      });

      setSelectedOrder(null);
      fetchActiveOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessLoading(false);
    }
  };

  const filteredOrders = activeOrders.filter((o) => {
    const matchTable = !tableFilter || o.meja?.nama_meja.toLowerCase().includes(tableFilter.toLowerCase());
    const matchCust = !customerFilter || o.nama_pelanggan.toLowerCase().includes(customerFilter.toLowerCase());
    return matchTable && matchCust;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header matching Kasir.png */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Process Payment</h1>
        <p className="text-sm text-slate-500 font-medium">Find the order and complete checkout in three steps</p>
      </div>

      {/* 3-Step Process Layout matching Kasir.png Screen 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step 1: Find Order Box (Left Column) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Find Order</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Table Number</label>
              <input
                type="text"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="e.g. 4"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Costumer Name</label>
              <input
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="e.g. Emma"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Unpaid Order List Cards */}
          <div className="pt-2 space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Tidak ada pesanan aktif.</div>
            ) : (
              filteredOrders.map((ord) => {
                const total = calculateTotal(ord);
                const isSelected = selectedOrder?.id_pesanan === ord.id_pesanan;

                return (
                  <div
                    key={ord.id_pesanan}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-xs">
                        #{ord.id_pesanan} . {ord.meja?.nama_meja}
                      </h4>
                      <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {ord.nama_pelanggan}
                      </p>
                    </div>
                    <span className={`font-extrabold text-xs ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Step 2 & 3 Right Container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 2: Order Details Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Order Details</h3>
            </div>

            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Order #{selectedOrder.id_pesanan}</h4>
                    <p className="text-slate-500 font-medium">
                      {selectedOrder.meja?.nama_meja}. {selectedOrder.nama_pelanggan}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-[#7A5C28] text-xs font-bold rounded-full border border-[#C9A96E]/30">
                    {selectedOrder.status_pesanan}
                  </span>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-2">ITEM</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Unit</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedOrder.detail.map((d) => (
                      <tr key={d.id_detail}>
                        <td className="py-2.5 text-slate-900 font-bold">{d.menu.nama_menu}</td>
                        <td className="py-2.5 text-center text-slate-700">{d.jumlah}</td>
                        <td className="py-2.5 text-right text-slate-500">Rp {d.harga.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 text-right text-slate-900 font-bold">
                          Rp {d.subtotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-sm">Total due</span>
                  <span className="font-black text-xl text-slate-900">
                    Rp {calculateTotal(selectedOrder).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Select an order to view details.
              </div>
            )}
          </div>

          {/* Step 3: Payment Method Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Payment Method</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'Cash', label: 'Cash', icon: Banknote },
                { key: 'Debit', label: 'Debit Card', icon: CreditCard },
                { key: 'Credit', label: 'Credit Card', icon: CreditCard },
                { key: 'QRIS', label: 'QRIS / Wallet', icon: QrCode },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-100 text-slate-900 font-extrabold ring-2 ring-slate-800/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-slate-700" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Cash' && selectedOrder && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Uang Tunai Diterima (Rp)
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder={`Nominal e.g. ${calculateTotal(selectedOrder)}`}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={processLoading || !selectedOrder}
              className="w-full bg-[#2A2725] hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>Process Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Complete Receipt Modal matching Kasir.png Screen 3 */}
      {receiptData && (
        <Modal isOpen={!!receiptData} onClose={() => setReceiptData(null)} title="Payment complete" maxWidth="max-w-md">
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Thank you!</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Order #{receiptData.order.id_pesanan} . {receiptData.order.meja?.nama_meja}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
              {receiptData.order.detail.map((d) => (
                <div key={d.id_detail} className="flex justify-between text-slate-700">
                  <span>{d.jumlah} x {d.menu.nama_menu}</span>
                  <span className="font-bold">Rp {d.subtotal.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total</span>
                <span>Rp {receiptData.payment.total_pembayaran.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="flex-1 py-3 bg-[#2A2725] hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                New Payment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
