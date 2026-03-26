// app/admin/products/AddProductClient.jsx
"use client";

import { ToastProvider } from "@/app/admin/context/ToastProvider";
import AddProductForm from "./AddProduct";
import AddCategory from "./AddCategory";

export default function AddCategoryClient({ categories, searchParams }) {
  return (
    <ToastProvider>
      <AddCategory categories={categories} />
    </ToastProvider>
  );
}
