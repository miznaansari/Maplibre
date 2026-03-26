import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ProductDetailClient from "./ViewProductDetail";
import { requireUser } from "@/lib/requireUser";



const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata({ params }) {




    const { slug } = await params;
    // console.log('slugslugslugslugslugslugslugslug',slug)
    if (!slug) notFound();

    const slugPath = slug[0] === "product"
        ? slug.slice(1).join("/")
        : slug.join("/");


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

    if (!product) return {};

    const title = product.seo?.meta_title || product.name;
    const description =
        product.seo?.meta_description ||
        "Check out this content on our website.";

    // ✅ IMAGE (ABSOLUTE URL REQUIRED)
    const image = product.images[0]?.image_url
        ? product.images[0].image_url
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
    let payload = null;
    if (token) {
        payload = await requireUser();
        console.log('==============asd======================', payload)


        if (payload?.id) {
            const customer = await prisma.customer_list.findUnique({
                where: { id: payload.id },
                select: {
                    id: true,
                    customer_group_id: true,
                    price_tier: true,
                },
            });
            console.log('===========customer', customer)

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

            // ✅ ADD THIS BLOCK
            variants: {
                where: {
                    is_deleted: false,
                },
                orderBy: {
                    size: "asc",
                },
            },
        },
    });


    let relatedProducts = [];

    if (product) {
        relatedProducts = await prisma.product_list.findMany({
            where: {
                category_id: product.category_id, // same category
                id: { not: product.id }, // exclude current product
                is_deleted: false,
                is_active: true,
            },
            include: {
                images: {
                    orderBy: { is_primary: "desc" },
                    take: 1,
                },
            },
            take: 8, // limit results
        });
    }

    //   console.log('productproductproductproductproduct', product)
    if (!product) notFound();

    /* =========================
       MAIN IMAGE
    ========================= */
    console.log('product.imagesproduct.images', product.images)
    const images =
        product.images?.map((img) => ({
            url: img.image_url,
            isPrimary: img.is_primary,
        })) || [];


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
    console.log('finalPricefinalPricefinalPricefinalPrice', product)
    let pricingSource = "DEFAULT_PRICE";

    if (isLoggedIn) {
        if (product?.pricing?.length) {
            console.log('product.pricing?.length', product.pricing?.length)
            finalPrice = product.pricing[0].price;
            pricingSource = "GROUP_PRICE";
        } else if (product?.tier_product_pricing) {
            const tierPrice = getTierPrice(
                product.tier_product_pricing, // ✅ OBJECT
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
    const headersList = await headers();

    const ip =
        headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        "unknown";

    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.page_views.create({
        data: {
            page_type: "PRODUCT",
            product_list_id: product.id,
            customer_id: payload?.id || null,
            ip_address: ip,
            user_agent: userAgent,
        },
    });
const views = await prisma.page_views.count({
  where: {
    page_type: "PRODUCT",
    product_list_id: product.id
  }
})
    return (
        <ProductDetailClient
            isLoggedIn={isLoggedIn}
            relatedProducts={relatedProducts}
            product={{
                id: product.id,
                name: product.name,
                sku: product.sku,
                views: views,
                description: product.description,
                price: finalPrice,
                regular_price: product.regular_price,
                sale_price: product.sale_price,
                stepper_value: product.stepper_value,
                measure_unit: product.measure_unit,
                mainImage: images,
                category: product.category,
                variants: product.variants, // ✅ PASS VARIANTS
            }}
        />
    );
}

