"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function saveProductPrices(formData) {
    console.log('================huittt============')
    const productId = Number(formData.get("product_id"));

    if (!productId) {
        throw new Error("Product ID missing");
    }

    const prices = [];

    for (const [key, value] of formData.entries()) {
        if (key.startsWith("price_")) {
            const customerGroupId = Number(key.replace("price_", ""));
            prices.push({
                customer_group_id: customerGroupId,
                price: Number(value),
            });
        }
    }

    try {
        for (const item of prices) {
            const { customer_group_id, price } = item;

            // ✅ Example (Prisma)
            await prisma.product_pricing.upsert({
    where: {
        product_list_id_customer_group_id: {
            product_list_id: Number(productId),
            customer_group_id: Number(customer_group_id),
        },
    },
    update: {
        price: Number(price),
    },
    create: {
        product_list_id: Number(productId),
        customer_group_id: Number(customer_group_id),
        price: Number(price),
    },
});



        }

        revalidatePath("/admin/product-prices");

        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to save prices");
    }
}
