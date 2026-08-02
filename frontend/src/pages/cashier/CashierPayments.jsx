import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import {
  Search,
  Banknote,
  CreditCard,
  QrCode,
  CheckCircle2,
  Printer,
} from 'lucide-react';

export default function CashierPayments() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 1: Find Order Filters
  const [tableFilter, setTableFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Selected Order for Checkout
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashAmount, setCashAmount] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  // Payment Complete Screen State (Screen 3 of Kasir.png)
  const [completedPayment, setCompletedPayment] = useState(null);

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
    } catch (err) {
      console.error('Error fetching cashier orders', err);
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

      setCompletedPayment({
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

  // SCREEN 3: Payment Complete Screen matching Kasir.png Screen 3
  if (completedPayment) {
    const total = calculateTotal(completedPayment.order);

    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-4">
        {/* Title Header matching Kasir.png Screen 3 */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment complete</h1>
          <p className="text-sm text-slate-500 font-medium">Receipt ready to print.</p>
        </div>

        {/* Center Receipt Card matching Kasir.png Screen 3 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-slate-200/80 max-w-md mx-auto space-y-6 text-slate-800">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">Thank you!</h3>
            <p className="text-xs text-slate-500 font-medium">
              Order #{completedPayment.order.id_pesanan} . {completedPayment.order.meja?.nama_meja}
            </p>
          </div>

          <div className="border-t border-b border-dashed border-slate-200 py-4 space-y-2 text-xs">
            {completedPayment.order.detail.map((d) => (
              <div key={d.id_detail} className="flex justify-between">
                <span className="font-semibold text-slate-700">
                  {d.jumlah} x {d.menu.nama_menu}
                </span>
                <span className="font-extrabold text-slate-900">
                  Rp {d.subtotal.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
            <span>Total</span>
            <span className="text-base font-black">Rp {total.toLocaleString('id-ID')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setCompletedPayment(null)}
              className="py-3 px-4 rounded-xl bg-[#2A2725] hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              New Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1 & 2: Process Payment Screen matching Kasir.png Screen 1 & 2
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header matching Kasir.png */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Process Payment</h1>
        <p className="text-sm text-slate-500 font-medium">Find the order and complete checkout in three steps</p>
      </div>

      {/* 3-Step Process Layout matching Kasir.png */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step 1: Find Order Box (Left Column) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Find Order</h3>
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

            <button
              type="button"
              onClick={fetchActiveOrders}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Open Order</span>
            </button>
          </div>

          {/* List of Unpaid Order Cards matching Kasir.png with unclipped borders */}
          <div className="pt-2 pb-1 px-1 space-y-2.5 max-h-80 overflow-y-auto">
            {loading && activeOrders.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-14 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">Tidak ada pesanan aktif.</div>
            ) : (
              filteredOrders.map((ord) => {
                const total = calculateTotal(ord);
                const isSelected = selectedOrder?.id_pesanan === ord.id_pesanan;

                return (
                  <div
                    key={ord.id_pesanan}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between border-2 ${
                      isSelected
                        ? 'border-slate-900 bg-white shadow-xs font-bold'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">
                        #{ord.id_pesanan} . {ord.meja?.nama_meja}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">{ord.nama_pelanggan}</p>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Step 2 & 3 Container (Right Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 2: Order Details Box matching Kasir.png */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Order Details</h3>
            </div>

            {selectedOrder ? (
              <div className="space-y-4">
                <div className="text-xs space-y-0.5">
                  <h4 className="font-extrabold text-slate-900 text-sm">Order #{selectedOrder.id_pesanan}</h4>
                  <p className="text-slate-500 font-medium">
                    {selectedOrder.meja?.nama_meja}. {selectedOrder.nama_pelanggan}
                  </p>
                </div>

                {/* Table of items matching Kasir.png */}
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
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                Select an order to view details.
              </div>
            )}
          </div>

          {/* Step 3: Payment Method Box matching Kasir.png */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Payment Method</h3>
            </div>

            {/* 4 Icon Payment Option Cards in horizontal row matching Kasir.png with unclipped borders */}
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
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border-2 flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-slate-900 bg-amber-50/50 text-slate-900 font-extrabold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-slate-700" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Cash' && selectedOrder && (
              <div className="pt-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
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
    </div>
  );
}
