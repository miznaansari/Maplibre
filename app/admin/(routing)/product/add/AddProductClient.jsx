// app/admin/products/AddProductClient.jsx
"use client";

import { ToastProvider } from "@/app/admin/context/ToastProvider";
import AddProductForm from "./AddProduct";

export default function AddProductClient({ categories, searchParams }) {
  return (
    <ToastProvider>
      <AddProductForm categories={categories} searchParams={searchParams} />
    </ToastProvider>
  );
}
