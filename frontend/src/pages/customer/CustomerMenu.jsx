import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Search, Plus, Minus } from 'lucide-react';

export default function CustomerMenu() {
  const { customerSession, addToCart, cart } = useAuth();
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!customerSession) {
      navigate('/customer');
      return;
    }
    fetchMenus();
  }, [activeCategory, customerSession, navigate]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu', {
        params: {
          category: activeCategory !== 'All' ? activeCategory : undefined,
        },
      });
      setMenus(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil daftar menu');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Makanan', 'Minuman', 'Camilan', 'Dessert'];

  const filteredMenus = menus.filter(
    (item) =>
      item.nama_menu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openDetailModal = (menuItem) => {
    if (menuItem.jumlah_porsi <= 0 || menuItem.status_menu === 'Unavailable') {
      toast.error('Porsi menu ini sedang habis');
      return;
    }
    setSelectedMenu(menuItem);
    setQuantity(1);
    setNotes('');
  };

  const handleAddToCart = (itemToCart, qty = 1) => {
    if (itemToCart.jumlah_porsi <= 0 || itemToCart.status_menu === 'Unavailable') {
      toast.error('Porsi menu ini sedang habis');
      return;
    }
    addToCart(itemToCart, qty, notes);
    toast.success(`${itemToCart.nama_menu} dimasukkan ke keranjang`);
    setSelectedMenu(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search & Category Filter Bar matching Customer.png */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar Left */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Menu..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 shadow-xs font-medium"
          />
        </div>

        {/* Category Pills Right */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#2A2725] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'Makanan' ? 'Food' : cat === 'Minuman' ? 'Drinks' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Grid of Menu Cards matching Customer.png Screen 2 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMenus.length === 0 ? (
        <EmptyState
          title="Menu Tidak Ditemukan"
          description="Cobalah mencari dengan kata kunci lain atau pilih kategori yang berbeda."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMenus.map((item) => {
            const isOutOfStock = item.jumlah_porsi <= 0 || item.status_menu === 'Unavailable';
            const itemInCart = cart.find((c) => c.id_menu === item.id_menu);

            return (
              <div
                key={item.id_menu}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden relative"
              >
                {itemInCart && (
                  <span className="absolute top-6 right-6 bg-[#C9A96E] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10 shadow-xs">
                    {itemInCart.jumlah}x di keranjang
                  </span>
                )}

                <div>
                  {/* Card Thumbnail Image */}
                  <div
                    onClick={() => openDetailModal(item)}
                    className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={item.gambar || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'}
                      alt={item.nama_menu}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        isOutOfStock ? 'grayscale opacity-60' : ''
                      }`}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          Habis
                        </span>
                      </div>
                    )}
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

                {/* Dark Full-Width Button matching Customer.png */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(item)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#2A2725] hover:bg-slate-800 text-white shadow-xs active:scale-98'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Menu Detail Modal */}
      {selectedMenu && (
        <Modal isOpen={!!selectedMenu} onClose={() => setSelectedMenu(null)} title="Detail Sajian Menu">
          <div className="space-y-4">
            <div className="h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={selectedMenu.gambar || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'}
                alt={selectedMenu.nama_menu}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider">
                  {selectedMenu.kategori}
                </span>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Porsi Tersedia: {selectedMenu.jumlah_porsi}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedMenu.nama_menu}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedMenu.deskripsi}</p>
              <p className="text-xl font-black text-slate-900 mt-2">
                Rp {selectedMenu.harga.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">Jumlah Porsi</span>
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-xs cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(selectedMenu.jumlah_porsi, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-[#2A2725] text-white flex items-center justify-center font-bold shadow-xs hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Porsi
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tidak pedas, sedikit es..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <button
              onClick={() => handleAddToCart(selectedMenu, quantity)}
              className="w-full bg-[#2A2725] hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Keranjang (Rp {(selectedMenu.harga * quantity).toLocaleString('id-ID')})</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
