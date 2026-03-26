"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { redirect } from "next/navigation";

/* ---------------- SLUG UTILITY ---------------- */
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/* ---------------- SERVER ACTION ---------------- */
export async function addProduct(prevState, formData) {
    const values = Object.fromEntries(formData.entries());

    const images = JSON.parse(values.images || "[]");
const variants = JSON.parse(values.variants || "[]");

    const errors = {};

    /* ---------------- VALIDATION ---------------- */
    if (!values.name?.trim()) {
        errors.name = "Product name is required";
    }
    if (!values.meta_title?.trim()) {
        errors.meta_title = "Meta title is required";
    }
    if (!values.meta_description?.trim()) {
        errors.meta_description = "Meta description is required";
    }
 





    let category_id;
    let category_path;

    if (!values.category?.trim()) {
        console.log('=======================no category===================');
        errors.category = "Category is required";
    } else {
        const [id, path] = values.category.split("||");

        if (!id || !path) {
            errors.category = "Invalid category selected";
        } else {
            category_id = Number(id);
            category_path = path;
        }
    }
    /* ---------------- SKU UNIQUE CHECK ---------------- */
    if (values.sku?.trim()) {
        const skuExists = await prisma.product_list.findUnique({
            where: { sku: values.sku },
        });

        if (skuExists) {
            errors.sku = "This SKU already exists";
        }
    }

 
  

    const stockQty = Number(values.stock_qty);
    const lowStockThreshold = Number(values.low_stock_threshold ?? 0);

    if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
        errors.low_stock_threshold =
            "Low stock threshold must be 0 or greater";
    }

 

    if (
        !errors.stock_qty &&
        !errors.low_stock_threshold &&
        stockQty < lowStockThreshold
    ) {
        errors.stock_qty =
            "Stock quantity cannot be less than low stock threshold";
    }


    // ❌ If validation fails
    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            errors,
            values,
        };
    }

    const admin = await requireAdmin();
    if (!admin) {
        console.log('user not authorized')
        return {
            success: false,
            errors: {
                general: "Unauthorized. Please log in again.",
            },
        };
    }
    console.log('==============sccuess=================')
    try {
        /* ---------------- UNIQUE SLUG ---------------- */
        const baseSlug = generateSlug(values.name);
        const addslug =   baseSlug;
        let slug = addslug;
        let counter = 1;

        while (
            await prisma.product_list.findUnique({
                where: { slug },
            })
        ) {
            slug = `${addslug}-${counter}`;
            counter++;
        }
        console.log('======================0===================')

        /* ---------------- CREATE PRODUCT ---------------- */
      const product = await prisma.product_list.create({
  data: {
    name: values.name,
    slug,
    sku: values.sku ? values.sku.toUpperCase() : null,

    low_stock_threshold: Number(values.low_stock_threshold) || null,
    stepper_value: Number(values.stepper_value) || null,

    description: values.description || null,
    regular_price: Number(values.regular_price) || 0,
    sale_price: values.sale_price ? Number(values.sale_price) : null,
    stock_qty: Number(values.stock_qty) || 0,

    is_active: true,

    category: {
      connect: {
        id: category_id,
      },
    },
  },
});
        console.log('======================1===================')

        /* ---------------- PRODUCT VARIANTS ---------------- */


        /* ---------------- PRODUCT IMAGE ---------------- */
        if (images.length > 0) {
            await prisma.product_images.createMany({
                data: images.map((img) => ({
                    product_list_id: product.id,
                    image_url: img.url,
                    is_primary: img.is_default,
                })),
            });
        }


        /* ---------------- SEO DATA ---------------- */
        await prisma.product_meta_data.create({
            data: {
                product_list_id: product.id,
                meta_title: values.meta_title,
                meta_description: values.meta_description,
                focus_keyword: values.focus_keyword,
            },
        });
        try {
            console.log('======================2===================')
            // redirect("/admin/products/add?success=1");

            return {
                success: true,
                productId: product.id,
            };
        } catch (err) {
            console.error("Add product error:", err)
        }


    } catch (error) {
        console.error("Add product error:", error);

        return {
            success: false,
            errors: {
                general: "Something went wrong. Please try again.",
            },
            values,
        };
    }
}
