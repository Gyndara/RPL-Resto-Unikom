import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ManagerDashboard() {
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: { period } });
      setReportData(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil data analytics dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatGrowth = (val) => {
    if (val === undefined || val === null) return '0%';
    const num = Number(val);
    const prefix = num >= 0 ? '+' : '';
    return `${prefix}${num}%`;
  };

  const getGrowthClass = (val) => {
    const num = Number(val);
    if (num > 0) return 'text-emerald-600';
    if (num < 0) return 'text-rose-600';
    return 'text-slate-400';
  };

  const summary = reportData?.summary || {};
  const revenueSummary = reportData?.revenueSummary || {};
  const topSellingMenus = reportData?.topSellingMenus || [];
  const categoryPieData = reportData?.categoryPieData || [];
  const revenueTrend = reportData?.revenueTrend || [];
  const monthlyRevenue = reportData?.monthlyRevenue || [];

  const maxBestSellerQty = topSellingMenus.length > 0
    ? Math.max(...topSellingMenus.map((i) => i.quantity))
    : 1;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sub Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview & Performance</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time revenue metrics and sales breakdown from database</p>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { key: 'daily', label: 'Hari Ini' },
            { key: 'weekly', label: 'Mingguan' },
            { key: 'monthly', label: 'Bulanan' },
            { key: 'yearly', label: 'Tahunan' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-[#2A2725] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Dynamic KPI Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Rp {(summary.totalRevenue || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Total Revenue</p>
              <span className={`text-[11px] font-bold block mt-1 ${getGrowthClass(summary.revenueGrowth)}`}>
                {formatGrowth(summary.revenueGrowth)} vs periode lalu
              </span>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {(summary.totalOrders || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Total Orders</p>
              <span className={`text-[11px] font-bold block mt-1 ${getGrowthClass(summary.ordersGrowth)}`}>
                {formatGrowth(summary.ordersGrowth)} vs periode lalu
              </span>
            </div>
          </div>

          {/* Card 3: Avg Transaction */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Rp {(summary.averageTransaction || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Avg Transaction</p>
              <span className="text-[11px] font-bold text-[#C9A96E] block mt-1">per Transaksi</span>
            </div>
          </div>

          {/* Card 4: Customers */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {(summary.totalTransactions || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Customers</p>
              <span className={`text-[11px] font-bold block mt-1 ${getGrowthClass(summary.customersGrowth)}`}>
                {formatGrowth(summary.customersGrowth)} vs periode lalu
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Revenue Trend</h3>
            <p className="text-xs text-slate-400 font-medium">Tren pendapatan real-time ({period})</p>
          </div>

          <div className="h-60 w-full pt-2">
            {revenueTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                Belum ada transaksi pendapatan pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(val) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Revenue']} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C9A96E"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#C9A96E' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Monthly Revenue ({new Date().getFullYear()})</h3>
            <p className="text-xs text-slate-400 font-medium">Pendapatan bulanan tahun {new Date().getFullYear()} dari DB</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#C9A96E" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best Selling Items & Donut & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 5 Best Selling Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Best Selling Items</h3>
            <p className="text-xs text-slate-400 font-medium">Top 5 menu terlaris dipesan pelanggan</p>
          </div>

          {topSellingMenus.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Belum ada transaksi menu pada periode ini
            </div>
          ) : (
            <div className="space-y-4">
              {topSellingMenus.map((item, idx) => (
                <div key={item.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>
                      {idx + 1}. {item.name} <span className="text-[10px] text-slate-400 font-normal">({item.category})</span>
                    </span>
                    <span className="font-extrabold text-[#C9A96E]">{item.quantity} porsi</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#C9A96E] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (item.quantity / maxBestSellerQty) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales by Category Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Sales by Category</h3>
            <p className="text-xs text-slate-400 font-medium">Proporsi Penjualan per Kategori</p>
          </div>

          {categoryPieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-medium">
              Belum ada data kategori
            </div>
          ) : (
            <>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} Porsi`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs font-bold pt-2">
                {categoryPieData.map((c) => (
                  <span key={c.name} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-700">{c.name} ({c.value})</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Revenue Summary Cards Bottom */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">Revenue Summary</h3>
          <p className="text-xs text-slate-400 font-medium">Ringkasan total pendapatan kumulatif dari database</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block">Today</span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              Rp {(revenueSummary.today || 0).toLocaleString('id-ID')}
            </h4>
            <span className={`text-[11px] font-bold block mt-1 ${getGrowthClass(revenueSummary.todayGrowth)}`}>
              {formatGrowth(revenueSummary.todayGrowth)}
            </span>
          </div>

          <div className="bg-[#2A2725] text-white p-5 rounded-2xl shadow-md">
            <span className="text-xs font-bold text-amber-200/80 block">This Week</span>
            <h4 className="text-xl font-black text-white mt-1">
              Rp {(revenueSummary.thisWeek || 0).toLocaleString('id-ID')}
            </h4>
            <span className="text-[11px] font-bold text-emerald-400 block mt-1">
              {formatGrowth(revenueSummary.thisWeekGrowth)}
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block">This Month</span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              Rp {(revenueSummary.thisMonth || 0).toLocaleString('id-ID')}
            </h4>
            <span className={`text-[11px] font-bold block mt-1 ${getGrowthClass(revenueSummary.thisMonthGrowth)}`}>
              {formatGrowth(revenueSummary.thisMonthGrowth)}
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block">This Year</span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              Rp {(revenueSummary.thisYear || 0).toLocaleString('id-ID')}
            </h4>
            <span className={`text-[11px] font-bold block mt-1 ${getGrowthClass(revenueSummary.thisYearGrowth)}`}>
              {formatGrowth(revenueSummary.thisYearGrowth)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
