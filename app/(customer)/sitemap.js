import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://samad-agency.vercel.app/";

  /* =========================
     🏠 STATIC PAGES
  ========================= */
  const staticPages = [
    {
      url: `${baseUrl}/`,
      priority: 1.0,
      changeFrequency: "daily",
    },
  
  ];

  /* =========================
     🔥 MAIN CATEGORIES (HIGH PRIORITY)
  ========================= */
  const mainCategories = await prisma.product_category.findMany({
    where: {
      is_active: true,
      is_deleted: false,
      parent_id: null, // ⭐ ONLY MAIN CATEGORY
    },
    select: {
      path: true,
      updated_at: true,
    },
    orderBy: {
      path: "asc",
    },
  });

  const categoryUrls = mainCategories.map((cat) => ({
  url: `${baseUrl}/product-category/${cat.path.replace(/^\/+/, "")}`,
    lastModified: cat.updated_at || new Date(),
    changeFrequency: "daily", // 🔥 IMPORTANT for ranking
    priority: 0.95, // ⭐ HIGH PRIORITY (after homepage)
  }));

  /* =========================
     🛍️ PRODUCTS
  ========================= */
  const products = await prisma.product_list.findMany({
    where: {
      is_active: true,
      is_deleted: false,
    },
    select: {
      slug: true,
      updated_at: true,
      category: {
        select: {
          path: true,
        },
      },
    },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updated_at || new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  /* =========================
     🧠 FINAL SITEMAP
  ========================= */
  return [
    ...staticPages.map((p) => ({
      url: p.url,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...categoryUrls,
    ...productUrls,
  ];
}