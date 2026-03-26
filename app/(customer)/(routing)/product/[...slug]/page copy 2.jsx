import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ProductDetailClient from "./ViewProductDetail";



const BASE_URL = 'https://newstaging.theclevar.com';

export async function generateMetadata({ params }) {




  const { slug } = await params;
  // console.log('slugslugslugslugslugslugslugslug',slug)
  if (!slug) notFound();

  const slugPath = slug[0] === "product"
    ? slug.slice(1).join("/")
    : slug.join("/");

  console.log("slugPath", slugPath);

  const product = await prisma.product_list.findUnique({
    where: { slug: slugPath },
    select: {
      name: true,
      seo: {
        select: {
          meta_title: true,
          meta_description: true,
          //   meta_image: true,
        },
      },
      images: {
        where: {
          is_primary: true,
        },
        take: 1,
      }
    },
  });
  console.log('mentatata', product)

  if (!product) return {};

  const title = product.seo?.meta_title || product.name;
  const description =
    product.seo?.meta_description ||
    "Check out this content on our website.";

  // ✅ IMAGE (ABSOLUTE URL REQUIRED)
  const image = product.images[0].image_url
    ? product.images.image_url
    : `${BASE_URL}/images/not-found.png`;

  const url = `${BASE_URL}/product/${slugPath}`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}


/* =========================
   PRODUCT PAGE (SERVER)
========================= */
export default async function Page({ params }) {
  const { slug } = await params;

  if (!slug || !Array.isArray(slug)) {
    notFound();
  }

  const slugPath = slug.join("/");

  /* =========================
     AUTH + CUSTOMER
  ========================= */
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  let isLoggedIn = false;
  let customerGroupId = null;
  let priceTier = null;

  if (token) {
    const payload = verifyToken(token);

    if (payload?.id) {
      const customer = await prisma.customer_list.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          customer_group_id: true,
          price_tier: true,
        },
      });

      if (customer) {
        isLoggedIn = true;
        customerGroupId = customer.customer_group_id;
        priceTier = customer.price_tier;
      }
    }
  }

  /* =========================
     FETCH PRODUCT
  ========================= */
  // console.log('slugPath', slugPath)
  const product = await prisma.product_list.findFirst({
    where: {
      slug: slugPath,
      is_deleted: false,
      is_active: true,
    },
    include: {
      images: {
        orderBy: { is_primary: "desc" },
      },
      category: true,

      pricing: customerGroupId
        ? {
          where: { customer_group_id: customerGroupId },
          take: 1,
        }
        : false,

      tier_product_pricing: isLoggedIn
        ? {
          select: {
            tier_1_price: true,
            tier_2_price: true,
            tier_3_price: true,
            tier_4_price: true,
            tier_5_price: true,
            tier_6_price: true,
            tier_7_price: true,
            tier_8_price: true,
            tier_9_price: true,
            tier_10_price: true,
          },
        }
        : false,
    },
  });
  // console.log('produ12ct', product)
  if (!product) notFound();

  /* =========================
     MAIN IMAGE
  ========================= */
  const mainImage =
    product.images.find((img) => img.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    "/images/not-found.png";

  /* =========================
     PRICE RESOLVER
  ========================= */
  const getTierPrice = (tierPricing, tier) => {
    if (!tierPricing || !tier) return null;

    const map = {
      TIER_1: tierPricing.tier_1_price,
      TIER_2: tierPricing.tier_2_price,
      TIER_3: tierPricing.tier_3_price,
      TIER_4: tierPricing.tier_4_price,
      TIER_5: tierPricing.tier_5_price,
      TIER_6: tierPricing.tier_6_price,
      TIER_7: tierPricing.tier_7_price,
      TIER_8: tierPricing.tier_8_price,
      TIER_9: tierPricing.tier_9_price,
      TIER_10: tierPricing.tier_10_price,
    };

    return map[tier] ?? null;
  };

  /* =========================
     FINAL PRICE
  ========================= */
  let finalPrice = product.sale_price ?? product.regular_price;
  let pricingSource = "DEFAULT_PRICE";

  if (isLoggedIn) {
    if (product.pricing?.length) {
      finalPrice = product.pricing[0].price;
      pricingSource = "GROUP_PRICE";
    } else if (product.tier_product_pricing?.length) {
      const tierPrice = getTierPrice(
        product.tier_product_pricing[0],
        priceTier
      );

      if (tierPrice !== null) {
        finalPrice = Number(tierPrice);
        pricingSource = `TIER_PRICE (${priceTier})`;
      }
    }
  }

  // console.log(
  //   `🛒 Product ${product.id} | ${product.name} → ${pricingSource} | Price = ${finalPrice}`
  // );

  /* =========================
     SEND SAFE DATA
  ========================= */
  return (
    <ProductDetailClient
      isLoggedIn={isLoggedIn}
      product={{
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: finalPrice,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        mainImage,
        category: product.category,
      }}
    />
  );
}
