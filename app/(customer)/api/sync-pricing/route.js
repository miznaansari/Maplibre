import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    /*
      Fetch unprocessed rows
    */
    const rows = await prisma.sking_sync_product_price_details.findMany({
      where: { is_processed: true },
      take: 18002, // process batch
    });

    for (const row of rows) {
      /*
        FIND CUSTOMER GROUP
      */
      const group = await prisma.customer_groups.findFirst({
        where: {
          group_name: row.customer_code,
        },
      });

      if (!group) continue;

      /*
        FIND PRODUCT
      */
      const product = await prisma.product_list.findFirst({
        where: {
          sku: row.product_code,
        },
      });

      if (!product) continue;

      /*
        UPSERT PRICING
      */
      await prisma.product_pricing.upsert({
        where: {
          product_list_id_customer_group_id: {
            product_list_id: product.id,
            customer_group_id: group.id,
          },
        },
        update: {
          price: Number(row.customer_price ?? row.default_sell_price ?? 0),
        },
        create: {
          product_list_id: product.id,
          customer_group_id: group.id,
          price: Number(row.customer_price ?? row.default_sell_price ?? 0),
        },
      });

      /*
        MARK AS PROCESSED
      */
      await prisma.sking_sync_product_price_details.update({
        where: { id: row.id },
        data: { is_processed: false },
      });
    }

    return NextResponse.json({
      success: true,
      processed: rows.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
