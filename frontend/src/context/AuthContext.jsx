import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resto_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [customerSession, setCustomerSession] = useState(() => {
    const saved = localStorage.getItem('resto_customer');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('resto_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('resto_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('resto_user');
    }
  }, [user]);

  useEffect(() => {
    if (customerSession) {
      localStorage.setItem('resto_customer', JSON.stringify(customerSession));
    } else {
      localStorage.removeItem('resto_customer');
    }
  }, [customerSession]);

  useEffect(() => {
    localStorage.setItem('resto_cart', JSON.stringify(cart));
  }, [cart]);

  const loginUser = (userData, token) => {
    localStorage.setItem('resto_token', token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('resto_token');
    localStorage.removeItem('resto_user');
    setUser(null);
  };

  const setCustomer = (name, tableId, tableName) => {
    const sessionData = {
      name,
      tableId: parseInt(tableId),
      tableName,
      sessionStartTime: new Date().toISOString(),
    };
    setCustomerSession(sessionData);
  };

  const clearCustomer = () => {
    localStorage.removeItem('resto_customer');
    localStorage.removeItem('resto_cart');
    setCustomerSession(null);
    setCart([]);
  };

  const addToCart = (menuItem, quantity = 1, notes = '') => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id_menu === menuItem.id_menu);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].jumlah += quantity;
        if (notes) updated[existingIndex].catatan = notes;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id_menu: menuItem.id_menu,
            nama_menu: menuItem.nama_menu,
            harga: menuItem.harga,
            gambar: menuItem.gambar,
            jumlah: quantity,
            catatan: notes,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (id_menu, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id_menu === id_menu) {
            const newQty = item.jumlah + delta;
            return newQty > 0 ? { ...item, jumlah: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateCartNotes = (id_menu, notes) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id_menu === id_menu ? { ...item, catatan: notes } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('resto_cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,
        customerSession,
        setCustomer,
        clearCustomer,
        cart,
        addToCart,
        updateCartQuantity,
        updateCartNotes,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
