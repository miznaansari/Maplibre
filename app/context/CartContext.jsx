"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ isLoggedIn, children }) {
  const [open, setOpen] = useState(false);
  useEffect(()=>{
  },[open])
  const [cartItems, setCartItems] = useState([]);
  useEffect(()=>{
  },[cartItems])
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD CART
  ========================= */
  const loadCart = async () => {
    setLoading(true);

    // 🔐 LOGGED IN → API / DB
    if (isLoggedIn) {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data || []);
    }
    // 👤 GUEST → localStorage
    else {
      const guestCart =
        JSON.parse(localStorage.getItem("guest_cart")) || {};
      setCartItems(Object.values(guestCart));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, [isLoggedIn]);

  return (
    <CartContext.Provider
      value={{
        open,
        setOpen,
        cartItems,
        setCartItems,
        reloadCart: loadCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
