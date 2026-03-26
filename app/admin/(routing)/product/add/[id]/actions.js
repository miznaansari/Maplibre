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
export async function updateProduct(prevState, formData) {

    const values = Object.fromEntries(formData);
    const errors = {};
    const productId = Number(values.id);
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
    if (!values.focus_keyword?.trim()) {
        errors.focus_keyword = "Focus keyword is required";
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
        const skuExists = await prisma.product_list.findFirst({
            where: {
                sku: values.sku,
                NOT: { id: productId },
            },
        });

        if (skuExists) {
            errors.sku = "This SKU already exists";
        }
    }


    if (!values.regular_price || Number(values.regular_price) <= 0) {
        errors.regular_price = "Regular price must be greater than 0";
    }

    if (!values.stock_qty || Number(values.stock_qty) < 0) {
        errors.stock_qty = "Stock quantity is required";
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
        const addslug = `${category_path}/${baseSlug}`;

        let slug = addslug;
        let counter = 1;

        while (
            await prisma.product_list.findFirst({
                where: {
                    slug,
                    NOT: { id: productId },
                },
            })
        ) {
            slug = `${addslug}-${counter++}`;
        }

        console.log('======================0===================')

        /* ---------------- CREATE PRODUCT ---------------- */
        const product = await prisma.product_list.update({
            where: { id: productId },
            data: {
                name: values.name,
                slug,
                sku: values.sku || null,
                category_id,
                description: values.description || null,
                regular_price: Number(values.regular_price),
                sale_price: values.sale_price ? Number(values.sale_price) : null,
                stock_qty: Number(values.stock_qty),
                weight: values.weight ? Number(values.weight) : null,
            },
        });

        console.log('======================1===================')

        /* ---------------- PRODUCT IMAGE ---------------- */
        if (values.image_url) {
            const imageExists = await prisma.product_images.findFirst({
                where: {
                    product_list_id: productId,
                    image_url: values.image_url,
                },
            });

            if (!imageExists) {
                await prisma.product_images.create({
                    data: {
                        product_list_id: productId,
                        image_url: values.image_url,
                        is_primary: true,
                    },
                });
            }
        }



        /* ---------------- SEO DATA ---------------- */
        await prisma.product_meta_data.update({
            where: { product_list_id: productId },
            data: {
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
                 values,

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
