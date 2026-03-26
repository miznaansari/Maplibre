// app/admin/products/AddProductClient.jsx
"use client";

import { ToastProvider } from "@/app/admin/context/ToastProvider";
import EditProduct from "./EditProduct";

export default function EditProductClient({ categories, searchParams,product }) {
  return (
    <ToastProvider>
      <EditProduct categories={categories} searchParams={searchParams} product={product} />
    </ToastProvider>
  );
}
