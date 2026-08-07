import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Users,
  Eye,
  EyeOff,
  ChefHat,
  CreditCard,
  UtensilsCrossed,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Lock,
  User,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';

export default function ManagerRegisterStaff() {
  const [formData, setFormData] = useState({
    nama_pegawai: '',
    username: '',
    password: '',
    role: 'pelayan',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      const res = await api.get('/auth/staff');
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal memuat daftar pegawai');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleKey) => {
    setFormData((prev) => ({ ...prev, role: roleKey }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_pegawai.trim()) {
      toast.error('Nama pegawai wajib diisi');
      return;
    }
    if (!formData.username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }
    if (!formData.password) {
      toast.error('Password wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        toast.success(`Akun ${res.data.data.nama_pegawai} (${res.data.data.role}) berhasil dibuat!`);
        setFormData({
          nama_pegawai: '',
          username: '',
          password: '',
          role: 'pelayan',
        });
        fetchStaffList();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal membuat akun pegawai';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (staff) => {
    setStaffToDelete(staff);
  };

  const handleCloseDeleteConfirm = () => {
    if (!deleting) {
      setStaffToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/auth/staff/${staffToDelete.id_pegawai}`);
      if (res.data.success) {
        toast.success(`Akun ${staffToDelete.nama_pegawai} berhasil dihapus`);
        setStaffToDelete(null);
        fetchStaffList();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus pegawai';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const roleOptions = [
    {
      key: 'pelayan',
      title: 'Pelayan (Waiter)',
      desc: 'Kelola pemesanan & layanan meja pelanggan',
      icon: UtensilsCrossed,
      color: 'border-amber-500 bg-amber-500/10 text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'kasir',
      title: 'Kasir (Cashier)',
      desc: 'Proses pembayaran & riwayat transaksi',
      icon: CreditCard,
      color: 'border-blue-500 bg-blue-500/10 text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'chef',
      title: 'Chef (Dapur)',
      desc: 'Terima antrean pesanan & kelola status menu',
      icon: ChefHat,
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
  ];

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'pelayan':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Pelayan</span>;
      case 'kasir':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Kasir</span>;
      case 'chef':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Chef</span>;
      case 'manager':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Manager</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{role}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Main Grid Layout: Form vs Staff List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form Card */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#C9A96E]" />
              Form Pembuatan Akun
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Lengkapi data credential pegawai di bawah ini
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Nama Pegawai */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                Nama Pegawai <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="nama_pegawai"
                  value={formData.nama_pegawai}
                  onChange={handleChange}
                  placeholder="e.g. Bisma Gyndara"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2A2725] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Field 2: Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. Bisma"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2A2725] focus:outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Username digunakan untuk login ke aplikasi</p>
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2A2725] focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 4: Role Selection Cards */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-extrabold text-slate-700 block">
                Pilih Role Pegawai <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.role === opt.key;
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => handleRoleSelect(opt.key)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                        isSelected
                          ? 'border-[#2A2725] bg-[#2A2725] text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-amber-400/20 text-[#C9A96E]' : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#C9A96E]" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold">{opt.title}</h4>
                        <p className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2A2725] hover:bg-[#1E1C1A] text-white font-extrabold text-xs tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-[#C9A96E]" />
                    <span>Buat Akun Pegawai</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Registered Staff List Side Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C9A96E]" />
                Daftar Pegawai
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Daftar akun pegawai yang terdaftar
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-black text-xs">
              {staffList.length} Akun
            </span>
          </div>

          {loadingStaff ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-xs font-semibold">Belum ada akun pegawai lain</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {staffList.map((st) => (
                <div
                  key={st.id_pegawai}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2A2725] text-white flex items-center justify-center font-black text-sm">
                      {st.nama_pegawai ? st.nama_pegawai.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{st.nama_pegawai}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">@{st.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(st.role)}
                    {st.role !== 'manager' && (
                      <button
                        onClick={() => handleOpenDeleteConfirm(st)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Pegawai"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Card Modal */}
      {staffToDelete && (
        <Modal
          isOpen={!!staffToDelete}
          onClose={handleCloseDeleteConfirm}
          title="Konfirmasi Hapus Akun"
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
            {/* Warning Header Box */}
            <div className="flex items-center gap-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Hapus Akun Pegawai?</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            {/* Staff Account Detail Card Preview */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-[#2A2725] text-white flex items-center justify-center font-black text-base shrink-0">
                {staffToDelete.nama_pegawai ? staffToDelete.nama_pegawai.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-extrabold text-slate-900 text-sm truncate">{staffToDelete.nama_pegawai}</h5>
                <p className="text-xs text-slate-400 font-medium">@{staffToDelete.username}</p>
              </div>
              <div className="shrink-0">
                {getRoleBadge(staffToDelete.role)}
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pegawai <strong className="text-slate-900 font-bold">{staffToDelete.nama_pegawai}</strong> (@{staffToDelete.username}) dari sistem?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
