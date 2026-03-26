"use server";

import { prisma } from "@/lib/prisma";

export async function saveTierPricing(prevState, formData) {
  try {
    const productId = Number(formData.get("product_list_id"));

    if (!productId) {
      return { errors: { general: "Invalid product ID" } };
    }

    const data = {
      product_list_id: productId,
    };

    for (let i = 1; i <= 10; i++) {
      const value = formData.get(`tier_${i}_price`);
      data[`tier_${i}_price`] = value ? Number(value) : null;
    }

    await prisma.tier_product_pricing.upsert({
      where: { product_list_id: productId },
      update: data,
      create: data,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      errors: { general: "Failed to save tier pricing" },
    };
  }
}
