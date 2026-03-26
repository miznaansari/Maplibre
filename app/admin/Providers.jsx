"use client";

import { ToastProvider } from "./context/ToastProvider";


export default function Providers({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
