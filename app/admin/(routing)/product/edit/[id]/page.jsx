import EditProductClient from "./EditProductClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

/* =========================
   GET CATEGORIES (SERVER)
========================= */
async function getCategoriesForAdmin() {
  const categories = await prisma.product_category.findMany({
    where: {
      is_active: true,
      is_deleted: false,
    },
    orderBy: { path: "asc" },
    include: {
      seo: {
        select: {
          meta_title: true,
          meta_description: true,
          focus_keyword: true,
        },
      },
      
      products: {
        where: {
          is_active: true,
          is_deleted: false,
        },
        include: {
          images: true,
          pricing: true,
          seo: true,
        },
      },
      _count: {
        select: {
          products: {
            where: {
              is_active: true,
              is_deleted: false,
            },
          },
        },
      },
    },
  });

  // normalize like API
  return categories.map((cat) => ({
    ...cat,
    product_count: cat._count.products,
  }));
}

/* =========================
   GET PRODUCT (SERVER)
========================= */
async function getProduct(id) {
  const product = await prisma.product_list.findUnique({
    where: { id },
    include: {
     images: {
      where: {
        is_deleted: false,
      },
    },
      seo: true,
      category: true,
    },
  });

  if (!product) notFound();

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description,
    category: `${product.category_id}||${product.category.path}`,
    category_id: product.category_id,
    regular_price: product.regular_price,
    sale_price: product.sale_price,
      measure_unit: product.measure_unit,
    stepper_value: product.stepper_value,
    stock_qty: product.stock_qty,
    weight: product.weight,
    low_stock_threshold: product.low_stock_threshold,
    image_url: product.images[0]?.image_url || "",
        // 👉 ALL PRODUCT IMAGES ADDED HERE
    product_images: product.images.map(img => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    meta_title: product.seo?.meta_title || "",
    meta_description: product.seo?.meta_description || "",
    focus_keyword: product.seo?.focus_keyword || "",
  };
}

/* =========================
   PAGE COMPONENT
========================= */
export default async function EditProductPage({ params }) {
  const p = await params;
  const id = Number(p.id);

  if (Number.isNaN(id)) notFound();

  const [categories, product] = await Promise.all([
    getCategoriesForAdmin(),
    getProduct(id),
  ]);

  return (
    <EditProductClient
      categories={categories || []}
      product={product}
    />
  );
}
