import EditProductClient from "./EditProductClient";
import { prisma } from "@/lib/prisma";
import { serverFetch } from "@/lib/serverFetch";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getCategories() {
  const res = await serverFetch("/admin/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function getProduct(id) {
  const product = await prisma.product_list.findUnique({
    where: { id: Number(id) },
    include: {
      images: {
        where: { is_primary: true },
        take: 1,
      },
      seo: true,
      category: true,
    },
  });

  if (!product) notFound();

  // Normalize for form usage
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description,
    category: `${product.category_id}||${product.category.path}`,
    category_id: product.category_id,
    regular_price: product.regular_price,
    sale_price: product.sale_price,
    stock_qty: product.stock_qty,
    weight: product.weight,
    image_url: product.images[0]?.image_url || "",
    meta_title: product.seo?.meta_title || "",
    meta_description: product.seo?.meta_description || "",
    focus_keyword: product.seo?.focus_keyword || "",
  };
}
export default async function EditProductPage({ params }) {
  const idData = await params;
  console.log('idData',idData.id)


  const [categories, product] = await Promise.all([
    getCategories(),
    getProduct(idData.id),
  ]);
console.log('=================product',product)
  return (
    <EditProductClient
      categories={categories}
      product={product}
    />
  );
}
