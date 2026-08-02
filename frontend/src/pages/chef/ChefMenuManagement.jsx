import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Utensils, Image as ImageIcon } from 'lucide-react';

export default function ChefMenuManagement() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formData, setFormData] = useState({
    nama_menu: '',
    deskripsi: '',
    kategori: 'Food',
    harga: '',
    jumlah_porsi: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await api.get('/menu');
      setMenus(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil daftar menu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedMenu(null);
    setFormData({
      nama_menu: '',
      deskripsi: '',
      kategori: 'Food',
      harga: '',
      jumlah_porsi: '20',
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      nama_menu: menu.nama_menu,
      deskripsi: menu.deskripsi || '',
      kategori: menu.kategori,
      harga: menu.harga.toString(),
      jumlah_porsi: menu.jumlah_porsi.toString(),
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (menu) => {
    const newStatus = menu.status_menu === 'Available' ? 'Unavailable' : 'Available';
    const newStock = newStatus === 'Available' ? (menu.jumlah_porsi > 0 ? menu.jumlah_porsi : 10) : 0;

    try {
      await api.put(`/menu/${menu.id_menu}`, {
        status_menu: newStatus,
        jumlah_porsi: newStock,
      });
      toast.success(`Status ${menu.nama_menu} diubah ke ${newStatus}`);
      fetchMenus();
    } catch (err) {
      toast.error('Gagal merubah status menu');
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    try {
      await api.delete(`/menu/${menuId}`);
      toast.success('Menu berhasil dihapus');
      fetchMenus();
    } catch (err) {
      toast.error('Gagal menghapus menu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('nama_menu', formData.nama_menu);
      data.append('deskripsi', formData.deskripsi);
      data.append('kategori', formData.kategori);
      data.append('harga', formData.harga);
      data.append('jumlah_porsi', formData.jumlah_porsi);
      if (imageFile) {
        data.append('gambar', imageFile);
      }

      if (selectedMenu) {
        await api.put(`/menu/${selectedMenu.id_menu}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Menu berhasil diperbarui');
      } else {
        await api.post('/menu', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Menu baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Title & Add Button matching Chef.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Management</h2>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#2A2725] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add food or drink</span>
        </button>
      </div>

      {/* 3-Column Grid of Menu Cards matching Chef.png Screen 2 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      ) : menus.length === 0 ? (
        <EmptyState title="Belum Ada Menu" description="Klik tombol Tambah Menu untuk menambahkan hidangan." icon={Utensils} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((item) => {
            const isAvailable = item.status_menu === 'Available' && item.jumlah_porsi > 0;

            return (
              <div
                key={item.id_menu}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col justify-between group"
              >
                {/* Menu Image & Overlay Action Buttons matching Chef.png */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      item.gambar
                        ? item.gambar.startsWith('http')
                          ? item.gambar
                          : `http://localhost:3000${item.gambar}`
                        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.nama_menu}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_menu)}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details & Stock Toggle matching Chef.png */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-slate-900 text-base">{item.nama_menu}</h3>
                      <span className="font-extrabold text-slate-900 text-sm">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                      {item.deskripsi}
                    </p>
                  </div>

                  {/* Stock & Availability Status Badge */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">Stok: {item.jumlah_porsi} porsi</span>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
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
          title={selectedMenu ? 'Edit Item' : 'Add Item'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name</label>
              <input
                type="text"
                value={formData.nama_menu}
                onChange={(e) => setFormData({ ...formData, nama_menu: e.target.value })}
                placeholder="e.g. Wagyu Beef Burger"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Fresh beef patty with caramelized onion..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (IDR)</label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  placeholder="165000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-800"
                >
                  <option value="Food">Food</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Appetizer">Appetizer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock for today</label>
              <input
                type="number"
                value={formData.jumlah_porsi}
                onChange={(e) => setFormData({ ...formData, jumlah_porsi: e.target.value })}
                placeholder="20"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-[#2A2725] hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md disabled:opacity-50"
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
