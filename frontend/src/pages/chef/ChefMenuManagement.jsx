import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, UtensilsCrossed, Image as ImageIcon } from 'lucide-react';

export default function ChefMenuManagement() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    nama_menu: '',
    deskripsi: '',
    kategori: 'Makanan',
    harga: '',
    jumlah_porsi: 20,
    gambar: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu');
      setMenus(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil daftar menu');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMenu(null);
    setFormData({
      nama_menu: '',
      deskripsi: '',
      kategori: 'Makanan',
      harga: '',
      jumlah_porsi: 20,
      gambar: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (menu) => {
    setEditingMenu(menu);
    setFormData({
      nama_menu: menu.nama_menu,
      deskripsi: menu.deskripsi || '',
      kategori: menu.kategori,
      harga: menu.harga,
      jumlah_porsi: menu.jumlah_porsi,
      gambar: menu.gambar || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!formData.nama_menu || !formData.harga) {
      toast.error('Nama menu dan harga harus diisi');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingMenu) {
        await api.put(`/menu/${editingMenu.id_menu}`, formData);
        toast.success('Menu berhasil diperbarui');
      } else {
        await api.post('/menu', formData);
        toast.success('Menu baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Menu berhasil dihapus');
      fetchMenus();
    } catch (err) {
      toast.error('Gagal menghapus menu');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header matching Chef.png */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Chef Dashboard</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => navigate('/chef')}
            className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Order Queue
          </button>
          <button
            onClick={() => navigate('/chef/menu')}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 shadow-xs cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Section Title & Add Button matching Chef.png */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Management</h2>
        <button
          onClick={openCreateModal}
          className="bg-[#2A2725] hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add food or drink</span>
        </button>
      </div>

      {/* 3-Column Grid of Menu Cards matching Chef.png Screen 2 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : menus.length === 0 ? (
        <EmptyState title="Menu Kosong" description="Belum ada data menu." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((item) => {
            const isAvailable = item.jumlah_porsi > 0 && item.status_menu === 'Available';

            return (
              <div
                key={item.id_menu}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Image Top with Edit & Delete Overlays */}
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src={item.gambar || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'}
                      alt={item.nama_menu}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(item.id_menu)}
                        className="w-8 h-8 rounded-full bg-rose-600/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Price Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{item.nama_menu}</h4>
                    <span className="font-extrabold text-xs text-[#C9A96E] whitespace-nowrap">
                      Rp {item.harga.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.deskripsi}</p>
                </div>

                {/* Available / Unavailable Toggle Badge matching Chef.png */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isAvailable ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'Unavailable'} ({item.jumlah_porsi} Porsi)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal matching Chef.png Screen 3 & 4 */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMenu ? 'Edit Item' : 'Add Item'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveMenu} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name</label>
              <input
                type="text"
                value={formData.nama_menu}
                onChange={(e) => setFormData({ ...formData, nama_menu: e.target.value })}
                placeholder="Wagyu Beef Burger"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                rows={3}
                placeholder="Premium wagyu patty, aged cheddar, truffle aioli..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (IDR)</label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  placeholder="165000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
                >
                  <option value="Makanan">Food</option>
                  <option value="Minuman">Drinks</option>
                  <option value="Camilan">Snack</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock for today</label>
                <input
                  type="number"
                  value={formData.jumlah_porsi}
                  onChange={(e) => setFormData({ ...formData, jumlah_porsi: e.target.value })}
                  placeholder="90"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL</label>
              <input
                type="text"
                value={formData.gambar}
                onChange={(e) => setFormData({ ...formData, gambar: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2.5 rounded-xl bg-[#2A2725] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-md"
              >
                Save Item
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
