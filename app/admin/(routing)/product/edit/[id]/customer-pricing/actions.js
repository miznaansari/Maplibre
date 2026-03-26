"use server";

import { prisma } from "@/lib/prisma";
export async function saveCustomerPricing(prevState, formData) {
  const data = Object.fromEntries(formData);
  const product_list_id = Number(data.product_list_id);

  const ops = [];

  for (const key in data) {
    if (key === "product_list_id") continue;

    const customer_group_id = Number(key);
    const raw = data[key];

    const price =
      raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : null;

    console.log(
      `➡️ group=${customer_group_id}, raw="${raw}", price=`,
      price
    );

    /* ------------------------------------
       If empty → DELETE pricing
    ------------------------------------ */
    if (price === null) {
      ops.push(
        prisma.product_pricing.deleteMany({
          where: {
            product_list_id,
            customer_group_id,
          },
        })
      );
      continue;
    }

    /* ------------------------------------
       If value → UPSERT pricing
    ------------------------------------ */
    ops.push(
      prisma.product_pricing.upsert({
        where: {
          product_list_id_customer_group_id: {
            product_list_id,
            customer_group_id,
          },
        },
        update: { price },
        create: {
          product_list_id,
          customer_group_id,
          price,
        },
      })
    );
  }

  console.log("📦 Prisma ops:", ops.length);

  try {
    await prisma.$transaction(ops);
    console.log("✅ Pricing saved successfully");
    return { success: true, errors: {} };
  } catch (err) {
    console.error("🔥 Pricing save failed:", err);
    return {
      success: false,
      errors: { general: "Failed to save customer pricing" },
    };
  }
}

