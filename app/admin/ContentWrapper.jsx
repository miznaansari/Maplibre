"use client";

import { useSidebar } from "./context/SidebarContext";
import AdminNavbar from "./UI/Navbar/AdminNavbar";

export default function ContentWrapper({ children, adminToken }) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={`flex flex-1 flex-col transition-all duration-300 ${
        adminToken ? (isOpen ? "md:ml-64" : "md:ml-0") : ""
      }`}
    >
      {adminToken && <AdminNavbar />}
      {children}
    </div>
  );
}
