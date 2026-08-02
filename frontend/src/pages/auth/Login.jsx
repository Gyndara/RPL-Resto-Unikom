import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Lock, User, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, pegawai } = response.data.data;
      loginUser(pegawai, token);
      toast.success(`Selamat datang kembali, ${pegawai.nama_pegawai}!`);

      // Redirect based on role
      switch (pegawai.role) {
        case 'pelayan':
          navigate('/waiter');
          break;
        case 'chef':
          navigate('/chef');
          break;
        case 'kasir':
          navigate('/cashier');
          break;
        case 'manager':
          navigate('/manager');
          break;
        default:
          navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal login. Periksa username & password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleUsername) => {
    setUsername(roleUsername);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F8F3E9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#C9A96E]/20 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A96E]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C9A96E] text-white shadow-lg mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Portal Pegawai Resto</h2>
          <p className="text-xs text-amber-200/80 font-medium mt-1">RESTO UNIKOM Management System</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username Pegawai
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:bg-white transition-all"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} variant="primary" size="lg" className="w-full mt-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Masuk System</span>
            </Button>
          </form>

          {/* Quick Login Presets for Easy Demo */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Pilih Role Demo Pegawai</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Pelayan', user: 'pelayan', bg: 'hover:border-[#C9A96E] hover:bg-[#F8F3E9]' },
                { label: 'Chef', user: 'chef', bg: 'hover:border-amber-500 hover:bg-amber-50' },
                { label: 'Kasir', user: 'kasir', bg: 'hover:border-emerald-500 hover:bg-emerald-50' },
                { label: 'Manager', user: 'manager', bg: 'hover:border-sky-500 hover:bg-sky-50' },
              ].map((r) => (
                <button
                  key={r.user}
                  type="button"
                  onClick={() => handleQuickLogin(r.user)}
                  className={`p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white transition-all text-center cursor-pointer ${r.bg}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
