import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, Calendar, Search, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ManagerReports() {
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: { period } });
      setReportData(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil laporan pendapatan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.transactions || reportData.transactions.length === 0) {
      toast.error('Tidak ada data transaksi untuk diexport');
      return;
    }

    const excelData = reportData.transactions.map((trx, idx) => ({
      No: idx + 1,
      ID_Pembayaran: `STR-${trx.id_pembayaran}`,
      Tanggal_Transaksi: new Date(trx.tanggal).toLocaleString('id-ID'),
      Nama_Pelanggan: trx.nama_pelanggan,
      Metode_Pembayaran: trx.metode,
      Total_Pembayaran_Rp: trx.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pendapatan');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const filename = `Laporan_Pendapatan_RESTO_UNIKOM_${period.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, filename);
    toast.success(`Laporan berhasil di-export ke ${filename}`);
  };

  const filteredTransactions = reportData?.transactions?.filter(
    (trx) =>
      trx.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
      trx.metode.toLowerCase().includes(search.toLowerCase()) ||
      trx.id_pembayaran.toString().includes(search)
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Laporan & Ekspor Pendapatan</h2>
          <p className="text-xs text-slate-500">Unduh data transaksi keuangan resto dalam format Excel (.xlsx).</p>
        </div>

        <Button onClick={handleExportExcel} variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700">
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export Excel (.xlsx)</span>
        </Button>
      </div>

      {/* Filter Period Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#C9A96E]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {[
            { key: 'daily', label: 'Laporan Harian' },
            { key: 'weekly', label: 'Mingguan' },
            { key: 'monthly', label: 'Bulanan' },
            { key: 'yearly', label: 'Tahunan' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-[#C9A96E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
          />
        </div>
      </div>

      {/* Transaction Records Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <EmptyState title="Tidak Ada Data Transaksi" description="Tidak ditemukan transaksi keuangan pada periode ini." />
      ) : (
        <div className="bg-white rounded-3xl border border-[#C9A96E]/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F3E9] text-[11px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-[#C9A96E]/20">
                  <th className="p-4">No. Struk</th>
                  <th className="p-4">Tanggal & Waktu</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Metode Bayar</th>
                  <th className="p-4 text-right">Total Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredTransactions.map((trx) => (
                  <tr key={trx.id_pembayaran} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-black text-slate-800">#STR-{trx.id_pembayaran}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(trx.tanggal).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{trx.nama_pelanggan}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-[#7A5C28] border border-[#C9A96E]/30">
                        {trx.metode}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900 text-sm">
                      Rp {trx.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
