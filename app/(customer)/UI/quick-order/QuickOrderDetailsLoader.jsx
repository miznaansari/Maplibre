// UI/shop/QuickOrderDetailsLoader.jsx
"use client";

import { useEffect } from "react";
import { fetchQuickOrderDetails } from "@/lib/fetchQuickOrderDetails";

export default function QuickOrderDetailsLoader({ onResolve }) {
  const details = fetchQuickOrderDetails(); // ⛔ suspends here

  useEffect(() => {
    onResolve(details);
  }, [details, onResolve]);

  return null;
}
