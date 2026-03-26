import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.product_category.findMany({
      where: {
        is_active: true,
        is_deleted: false,
        parent_id: null, // ✅ ONLY top-level categories
      },
      select: {
        id: true,
        name: true,
        slug: true,
        path: true,
      },
      orderBy: {
        path: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
