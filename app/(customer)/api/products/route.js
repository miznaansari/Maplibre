import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const minimal = searchParams.get("minimal");

    const products = await prisma.product_list.findMany({
      where: {
        is_deleted: false,
        is_active: true,
      },
      orderBy: {
        created_at: "desc",
      },

      ...(minimal
        ? {
          // 🚀 minimal payload (VERY FAST)
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            regular_price: true,
            sale_price: true,
            stock_qty: true,
          },
        }
        : {
          include: {
            category: {
              include: {
                seo: true,
                parent: true,
              },
            },
            images: true,
            seo: true,
            pricing: {
              include: {
                group: true,
              },
            },
          },
        }),
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
