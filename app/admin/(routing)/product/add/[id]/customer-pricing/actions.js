"use server";

import { prisma } from "@/lib/prisma";

export async function saveCustomerPricing(prevState, formData) {
  const data = Object.fromEntries(formData);
  const product_list_id = Number(data.product_list_id);

  const entries = [];
  for (const key in data) {
    if (key === "product_list_id") continue;

    const price = parseFloat(data[key]);
    if (!isNaN(price) && price > 0) {
      entries.push({ customer_group_id: Number(key), price });
    }
  }

  try {
    await prisma.$transaction(
      entries.map((e) =>
        prisma.product_pricing.upsert({
          where: {
            product_list_id_customer_group_id: {
              product_list_id,
              customer_group_id: e.customer_group_id,
            },
          },
          update: { price: e.price },
          create: {
            product_list_id,
            customer_group_id: e.customer_group_id,
            price: e.price,
          },
        })
      )
    );

    return { success: true, errors: {} };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      errors: { general: "Failed to save customer pricing" },
    };
  }
}
