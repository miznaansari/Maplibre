// app/api/shop/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product_list.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        sku: true,
        measure_unit: true,
        stepper_value: true,



        // images: {
        //   where: { is_primary: true },
        //   select: { image_url: true },
        //   take: 1,
        // },
      },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
       sku: p.sku,
       measure_unit: p.measure_unit,
       stepper_value: p.stepper_value,
      // mainImage: p.images?.[0]?.image_url ?? null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("❌ quick-order error", err);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
