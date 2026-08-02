import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, UtensilsCrossed, Clock, ArrowLeft } from 'lucide-react';

export default function CustomerLayout() {
  const { customerSession, cartItemCount, cartTotal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMenuPage = location.pathname === '/customer/menu';
  const isCartPage = location.pathname === '/customer/cart';

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col text-slate-800 font-sans">
      {/* Customer Full Web Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isMenuPage && location.pathname !== '/customer' && (
              <button
                onClick={() => navigate('/customer/menu')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Menu</span>
              </button>
            )}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/customer/menu')}>
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">Resto Unikom</span>
              {isCartPage && <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">/ CUSTOMER</span>}
            </div>
          </div>

          {customerSession && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">
                Hello, <strong className="text-slate-900 font-bold">{customerSession.name}</strong> ({customerSession.tableName})
              </span>

              <button
                onClick={() => navigate('/customer/status')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F8F3E9] text-[#7A5C28] border border-[#C9A96E]/30 hover:bg-[#EFE5D3] transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Status Pesanan</span>
              </button>

              {/* Header Cart Icon */}
              <button
                onClick={() => navigate('/customer/cart')}
                className="relative p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                title="Lihat Keranjang"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Floating Bottom Bar for Mobile view */}
      {isMenuPage && cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => navigate('/customer/cart')}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold">{cartItemCount} Item Dipesan</span>
            </div>
            <span className="text-sm font-extrabold">Rp {cartTotal.toLocaleString('id-ID')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
