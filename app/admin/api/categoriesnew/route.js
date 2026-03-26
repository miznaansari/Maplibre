import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    console.log("API QUERY →", { search, page, limit, skip });

    // search condition
    const whereCondition = {
      is_active: true,
      is_deleted: false,
      ...(search && {
        name: {
          contains: search,
          // mode: "insensitive",
        },
      }),
    };

    // total count for pagination
    const total = await prisma.product_category.count({
      where: whereCondition,
    });

    const categories = await prisma.product_category.findMany({
      where: whereCondition,
      orderBy: { path: "asc" },
      skip,
      take: limit,
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

    const formatted = categories.map((cat) => ({
      ...cat,
      product_count: cat._count.products,
    }));

    return NextResponse.json({
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
