import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { User, ArrowRight } from 'lucide-react';

export default function CustomerLanding() {
  const [searchParams] = useSearchParams();
  const tableFromUrl = searchParams.get('table') || '1';

  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(tableFromUrl);
  const [customerName, setCustomerName] = useState('');
  const { setCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await api.get('/tables');
        setTables(res.data.data);
      } catch (err) {
        console.error('Error fetching tables', err);
      }
    };
    fetchTables();
  }, []);

  const handleStartOrder = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Silakan masukkan nama Anda');
      return;
    }

    const tableObj = tables.find((t) => t.id_meja === parseInt(selectedTableId)) || {
      id_meja: parseInt(selectedTableId),
      nama_meja: `Meja ${selectedTableId.toString().padStart(2, '0')}`,
    };

    setCustomer(customerName.trim(), tableObj.id_meja, tableObj.nama_meja);
    toast.success(`Selamat datang ${customerName}! Silakan pilih menu Anda.`);
    navigate('/customer/menu');
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-left space-y-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome</h1>
        <p className="text-sm text-slate-500 font-medium">Tell us a little about yourself to get started</p>
      </div>

      {/* Centered White Card matching Customer.png Screen 1 */}
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-slate-200/80 max-w-md mx-auto space-y-6 text-slate-800">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <User className="w-10 h-10" />
          </div>
        </div>

        <form onSubmit={handleStartOrder} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Burhan"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Table Number (Optional)
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all font-medium"
            >
              {tables.length > 0
                ? tables.map((t) => (
                    <option key={t.id_meja} value={t.id_meja}>
                      {t.nama_meja} ({t.kapasitas} Kursi)
                    </option>
                  ))
                : [1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      Meja {num.toString().padStart(2, '0')}
                    </option>
                  ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2A2725] hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
