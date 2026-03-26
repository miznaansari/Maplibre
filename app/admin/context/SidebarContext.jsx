"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(localStorage.getItem("sidebar-open") === "true" || false);

  // On mount, check localStorage and window width
  useEffect(() => {
    const width = window.innerWidth;

    if (width >= 768) {
      // md+
      const stored = localStorage.getItem("sidebar-open");
      if (stored === null) {
        setIsOpen(true); // default open if no stored value
      } else {
        setIsOpen(stored === "true"); // use stored value
      }
    } else {
      // mobile
      setIsOpen(false);
    }
  }, []);

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (window.innerWidth >= 768) {
        localStorage.setItem("sidebar-open", next); // store only for md+
      }
      return next;
    });
  };

  const setOpen = (val) => {
    setIsOpen(val);
    if (window.innerWidth >= 768) {
      localStorage.setItem("sidebar-open", val);
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider");
  return context;
};
