// app/admin/products/page.jsx
import AddProductClient from "./AddProductClient";
import { serverFetch } from "@/lib/serverFetch";

async function getCategories() {
  const res = await serverFetch("/admin/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default async function AddProductPage({ searchParams }) {
  const categories = await getCategories();

  return <AddProductClient categories={categories} searchParams={searchParams} />;
}
