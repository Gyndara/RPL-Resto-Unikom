import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Search, Plus, Minus, Utensils, MessageSquare } from 'lucide-react';

export default function CustomerMenu() {
  const { customerSession, addToCart, cart } = useAuth();
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Menu Detail
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [catatan, setCatatan] = useState('');

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

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
    setCatatan('');
  };

  const handleAddToCartFromModal = () => {
    if (!selectedMenu) return;
    if (selectedMenu.jumlah_porsi <= 0 || selectedMenu.status_menu === 'Unavailable') {
      toast.error('Porsi menu ini sedang habis');
      return;
    }
    addToCart(selectedMenu, quantity, catatan);
    toast.success(`${selectedMenu.nama_menu} dimasukkan ke keranjang`);
    setSelectedMenu(null);
  };

  const handleQuickAdd = (e, itemToCart) => {
    e.stopPropagation();
    if (itemToCart.jumlah_porsi <= 0 || itemToCart.status_menu === 'Unavailable') {
      toast.error('Porsi menu ini sedang habis');
      return;
    }
    addToCart(itemToCart, 1, '');
    toast.success(`${itemToCart.nama_menu} dimasukkan ke keranjang`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar Left */}
        <div className="relative flex-1 max-w-xl">
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

      {/* Grid of Menu Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
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
          icon={Utensils}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMenus.map((item) => {
            const isOutOfStock = item.jumlah_porsi <= 0 || item.status_menu === 'Unavailable';
            const itemInCart = cart.find((c) => c.id_menu === item.id_menu);

            return (
              <div
                key={item.id_menu}
                onClick={() => openDetailModal(item)}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative cursor-pointer"
              >
                {itemInCart && (
                  <span className="absolute top-6 right-6 bg-[#C9A96E] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10 shadow-xs">
                    {itemInCart.jumlah}x di keranjang
                  </span>
                )}

                <div>
                  {/* Card Thumbnail Image */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src={getImageUrl(item.gambar)}
                      alt={item.nama_menu}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        isOutOfStock ? 'grayscale opacity-60' : ''
                      }`}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
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

                {/* Dark Full-Width Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    disabled={isOutOfStock}
                    onClick={(e) => handleQuickAdd(e, item)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#2A2725] hover:bg-slate-800 text-white shadow-xs active:scale-98'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Column Menu Detail Modal */}
      {selectedMenu && (
        <Modal
          isOpen={!!selectedMenu}
          onClose={() => setSelectedMenu(null)}
          title="Detail Sajian Menu"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            {/* Modal Image Header */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
              <img
                src={getImageUrl(selectedMenu.gambar)}
                alt={selectedMenu.nama_menu}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-[#2A2725] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                {selectedMenu.kategori}
              </span>
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Stok: {selectedMenu.jumlah_porsi} porsi
              </span>
            </div>

            {/* Menu Information */}
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-extrabold text-slate-900">{selectedMenu.nama_menu}</h3>
                <span className="text-lg font-black text-[#C9A96E]">
                  Rp {selectedMenu.harga.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedMenu.deskripsi}</p>
            </div>

            {/* Quantity Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jumlah Porsi</span>
              <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-sm w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(selectedMenu.jumlah_porsi, quantity + 1))}
                  className="w-7 h-7 rounded-lg bg-[#2A2725] hover:bg-slate-800 text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notes Input Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Catatan Khusus (Opsional)</span>
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Tanpa pedas, es sedikit..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            {/* Action Submit Button */}
            <button
              onClick={handleAddToCartFromModal}
              className="w-full bg-[#2A2725] hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Keranjang • Rp {(selectedMenu.harga * quantity).toLocaleString('id-ID')}</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
