"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar");
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("admin-sidebar", isOpen);
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
