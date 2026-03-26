"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ isLoggedIn, children }) {
    // console.log('isLoggedIn12', isLoggedIn)
  const [open, setOpen] = useState(false);
  useEffect(()=>{
console.log('open',open)
  },[open])
  const [cartItems, setCartItems] = useState([]);
  useEffect(()=>{
    console.log('cartItems',cartItems)
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
