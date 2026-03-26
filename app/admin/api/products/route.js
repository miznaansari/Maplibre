import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
    let product = null;
    console.log('HITTING=-===================================')
    try {
        const body = await req.json();

        const {
            name,
            slug,
            sku,
            category_id,
            description,
            short_description,
            regular_price,
            sale_price,
            stock_qty,
            weight,
            image, // { url, alt_text }
        } = body || {};

        // 1️⃣ Manual validation
        if (!name || name.trim() === "") {
            return NextResponse.json(
                { message: "Product name is required", field: "name" },
                { status: 400 }
            );
        }

        if (!slug || slug.trim() === "") {
            return NextResponse.json(
                { message: "Slug is required", field: "slug" },
                { status: 400 }
            );
        }

        if (!category_id || isNaN(Number(category_id))) {
            return NextResponse.json(
                {
                    message: "Category ID is required and must be a number",
                    field: "category_id",
                },
                { status: 400 }
            );
        }

        if (!regular_price || isNaN(Number(regular_price))) {
            return NextResponse.json(
                {
                    message: "Regular price is required and must be a number",
                    field: "regular_price",
                },
                { status: 400 }
            );
        }

        if (stock_qty === undefined || isNaN(Number(stock_qty))) {
            return NextResponse.json(
                {
                    message: "Stock quantity is required and must be a number",
                    field: "stock_qty",
                },
                { status: 400 }
            );
        }

        if (image && (!image.url || typeof image.url !== "string")) {
            return NextResponse.json(
                {
                    message: "Image URL is required if image is provided",
                    field: "image.url",
                },
                { status: 400 }
            );
        }

        // ✅ 1.5️⃣ PRE-CHECK UNIQUE SLUG (UX improvement)
        const existingSlug = await prisma.product_list.findUnique({
            where: { slug: slug.trim() },
            select: { id: true },
        });
        // console.log('existingSlug', existingSlug)

        if (existingSlug) {
            return NextResponse.json(
                {
                    message: "Slug already exists. Please choose a different one.",
                    field: "slug",
                },
                { status: 409 }
            );
        }

        // 2️⃣ Create product inside transaction
        product = await prisma.$transaction(async (tx) => {
            return await tx.product_list.create({
                data: {
                    name: name.trim(),
                    slug: slug.trim(),
                    sku: sku?.trim() || null,
                    category_id: Number(category_id),
                    description: description?.trim() || null,
                    short_description: short_description?.trim() || null,
                    regular_price: Number(regular_price),
                    sale_price: sale_price ? Number(sale_price) : null,
                    stock_qty: Number(stock_qty),
                    weight: weight ? Number(weight) : null,
                    image_gallery: image
                        ? {
                            create: {
                                url: image.url,
                                alt_text: image.alt_text || null,
                                is_primary: true,
                            },
                        }
                        : undefined,
                },
            });
        });

        // 3️⃣ Success
        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        // 4️⃣ FINAL SAFETY NET (race condition protection)
        if (
            error?.code === "P2002" &&
            error?.meta?.target?.includes("slug")
        ) {
            return NextResponse.json(
                {
                    message: "Slug already exists. Please choose a different one.",
                    field: "slug",
                },
                { status: 409 }
            );
        }

        console.error("Product creation error:", error);

        return NextResponse.json(
            {
                message: "Product creation failed due to an internal server error.",
            },
            { status: 500 }
        );
    }
}



// export async function GET() {
//   try {
//   const products = await prisma.product_list.findMany({
//   orderBy: {
//     created_at: "desc",
//   },
//   include: {
//     category: {
//       include: {
//         seo: true,      // product_category_seo
//         parent: true,   // optional
//       },
//     },
//     images: true,
//     seo: true,
//     pricing: {
//       include: {
//         group: true, // customer_groups
//       },
//     },
//   },
// });


//     return NextResponse.json(products, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: "Failed to fetch products" },
//       { status: 500 }
//     );
//   }
// }


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const search = searchParams.get("search")?.trim() || "";
        const category = searchParams.get("category");
        const stock = searchParams.get("stock");

        const skip = (page - 1) * limit;

        // ✅ Build filters safely
        const andFilters = [];

        // Search (MySQL case-insensitive via collation)
        if (search) {
            andFilters.push({
                OR: [
                    { name: { contains: search } },
                    { sku: { contains: search } },
                ],
            });
        }

        // Category filter
        if (category) {
            andFilters.push({
                category_id: Number(category),
            });
        }

        // Stock filter
        if (stock === "in") {
            andFilters.push({
                stock_qty: { gt: 0 },
            });
        } else if (stock === "out") {
            andFilters.push({
                stock_qty: { lte: 0 },
            });
        }

        const where = {
            is_deleted: false,
            ...(andFilters.length > 0 && { AND: andFilters }),
        };

        const [products, total] = await Promise.all([
            prisma.product_list.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: "desc",
                },
                include: {
                    category: true,
                    images: true,
                },
            }),
            prisma.product_list.count({ where }),
        ]);

        return NextResponse.json({
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("PRODUCT LIST ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
