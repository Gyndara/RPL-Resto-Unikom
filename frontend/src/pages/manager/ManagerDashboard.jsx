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

  const monthlyChartData = [
    { month: 'Jan', revenue: 48 },
    { month: 'Feb', revenue: 38 },
    { month: 'Mar', revenue: 54 },
    { month: 'Apr', revenue: 46 },
    { month: 'Mei', revenue: 58 },
  ];

  const categoryPieData = [
    { name: 'Food', value: 65, color: '#2A2725' },
    { name: 'Drinks', value: 35, color: '#C9A96E' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sub Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview & Performance</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time revenue metrics and sales breakdown</p>
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

      {/* Top 4 KPI Summary Cards matching Manajer.png Screen 1 */}
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
                Rp. {(reportData?.summary?.totalRevenue || 40200000).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Total Revenue</p>
              <span className="text-[11px] font-bold text-emerald-600 block mt-1">+12.4% vs last week</span>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {reportData?.summary?.totalOrders || 289}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Total Orders</p>
              <span className="text-[11px] font-bold text-emerald-600 block mt-1">+12.4%</span>
            </div>
          </div>

          {/* Card 3: Avg Transaction */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Rp. {(reportData?.summary?.averageTransaction || 139100).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Avg Transaction</p>
              <span className="text-[11px] font-bold text-[#C9A96E] block mt-1">per Order</span>
            </div>
          </div>

          {/* Card 4: Customers */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A96E] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {reportData?.summary?.totalTransactions || 264}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Customers</p>
              <span className="text-[11px] font-bold text-emerald-600 block mt-1">+12.4%</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid matching Manajer.png Screen 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Revenue Trend</h3>
            <p className="text-xs text-slate-400 font-medium">Daily revenue this week</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  reportData?.revenueTrend?.length > 0
                    ? reportData.revenueTrend
                    : [
                        { date: 'Mon', revenue: 1500000 },
                        { date: 'Tue', revenue: 3800000 },
                        { date: 'Wed', revenue: 1800000 },
                        { date: 'Thu', revenue: 5600000 },
                        { date: 'Fri', revenue: 2400000 },
                        { date: 'Sat', revenue: 2100000 },
                        { date: 'Sun', revenue: 8900000 },
                      ]
                }
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [`Rp ${val.toLocaleString('id-ID')}`, 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9A96E"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#C9A96E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Monthly Revenue</h3>
            <p className="text-xs text-slate-400 font-medium">Revenue per month (H1 2026)</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [`${val} M`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#C9A96E" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Screen 2: Best Selling Items & Donut & Summary matching Manajer.png */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 5 Best Selling Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Best Selling Items</h3>
            <p className="text-xs text-slate-400 font-medium">Top 5 most ordered dishes</p>
          </div>

          <div className="space-y-4">
            {(
              reportData?.topSellingMenus?.length > 0
                ? reportData.topSellingMenus
                : [
                    { name: 'Wagyu Burger', quantity: 342 },
                    { name: 'Pan-Seared Salmon', quantity: 289 },
                    { name: 'Truffle Pasta', quantity: 256 },
                    { name: 'Matcha Latte', quantity: 198 },
                    { name: 'Caesar Salad', quantity: 175 },
                  ]
            ).map((item, idx) => (
              <div key={item.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>
                    {idx + 1}. {item.name}
                  </span>
                  <span>{item.quantity}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#C9A96E] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (item.quantity / 350) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Sales by Category</h3>
            <p className="text-xs text-slate-400 font-medium">Food Vs Drinks</p>
          </div>

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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs font-bold">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2A2725] inline-block" /> Food
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C9A96E] inline-block" /> Drinks
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Summary Cards Bottom matching Manajer.png */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Revenue Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block">Today</span>
            <h4 className="text-xl font-black text-slate-900 mt-1">Rp 6,800,000</h4>
            <span className="text-[11px] font-bold text-emerald-600 block mt-1">+8.2%</span>
          </div>

          <div className="bg-[#2A2725] text-white p-5 rounded-2xl shadow-md">
            <span className="text-xs font-bold text-amber-200/80 block">This Week</span>
            <h4 className="text-xl font-black text-white mt-1">Rp 40,200,000</h4>
            <span className="text-[11px] font-bold text-emerald-400 block mt-1">+12.4%</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block">This Month</span>
            <h4 className="text-xl font-black text-slate-900 mt-1">Rp 158,000,000</h4>
            <span className="text-[11px] font-bold text-emerald-600 block mt-1">+9.7%</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block">This Year</span>
            <h4 className="text-xl font-black text-slate-900 mt-1">Rp 1,890,000,000</h4>
            <span className="text-[11px] font-bold text-emerald-600 block mt-1">+21.3%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
