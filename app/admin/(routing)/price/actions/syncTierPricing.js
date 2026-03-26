"use server";

import { prisma } from "@/lib/prisma";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function syncTierPricing() {
  let matched = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const logs = [];

  console.log("[syncTierPricing] Starting sync…");

  const syncProducts = await prisma.sking_sync_product_details.findMany({
    where: { is_processed: true },
  });

  console.log(
    `[syncTierPricing] Found ${syncProducts.length} sync records`
  );
  logs.push(`Found ${syncProducts.length} sync records`);

  for (let i = 0; i < syncProducts.length; i++) {
    const item = syncProducts[i];

    console.log(
      `[syncTierPricing] (${i + 1}/${syncProducts.length}) Processing SKU:`,
      item.product_code
    );
    logs.push(
      `(${i + 1}/${syncProducts.length}) Processing SKU ${item.product_code}`
    );

    const product = await prisma.product_list.findUnique({
      where: { sku: item.product_code },
      select: { id: true },
    });

    if (!product) {
      skipped++;
      console.warn(
        `[syncTierPricing] SKU not found, skipped:`,
        item.product_code
      );
      logs.push(`⏭️ SKU not found, skipped`);
      await sleep(200);
      continue;
    }

    matched++;

    const tierData = {
      tier_1_price: item.sellPriceTier1Value,
      tier_2_price: item.sellPriceTier2Value,
      tier_3_price: item.sellPriceTier3Value,
      tier_4_price: item.sellPriceTier4Value,
      tier_5_price: item.sellPriceTier5Value,
      tier_6_price: item.sellPriceTier6Value,
      tier_7_price: item.sellPriceTier7Value,
      tier_8_price: item.sellPriceTier8Value,
      tier_9_price: item.sellPriceTier9Value,
      tier_10_price: item.sellPriceTier10Value,
    };

    console.log(
      `[syncTierPricing] Tier data prepared for product ID ${product.id}`,
      tierData
    );

    const existing = await prisma.tier_product_pricing.findUnique({
      where: { product_list_id: product.id },
    });

    if (existing) {
      await prisma.tier_product_pricing.update({
        where: { product_list_id: product.id },
        data: tierData,
      });
      updated++;
      console.log(
        `[syncTierPricing] Updated tier pricing for product ID ${product.id}`
      );
      logs.push(`🔄 Updated tier pricing`);
    } else {
      await prisma.tier_product_pricing.create({
        data: {
          product_list_id: product.id,
          ...tierData,
        },
      });
      inserted++;
      console.log(
        `[syncTierPricing] Inserted tier pricing for product ID ${product.id}`
      );
      logs.push(`🆕 Inserted tier pricing`);
    }

    await sleep(30);
  }

  console.log("[syncTierPricing] Sync completed", {
    matched,
    inserted,
    updated,
    skipped,
    total: syncProducts.length,
  });

  logs.push("✅ Sync completed");

  return {
    matched,
    inserted,
    updated,
    skipped,
    total: syncProducts.length,
    logs,
  };
}
