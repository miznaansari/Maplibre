"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

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

    console.log("🟢 [updateProduct] Action Started");

    const values = Object.fromEntries(formData);
    const errors = {};
    const productId = Number(values.id);

    console.log("📦 Incoming Form Values:", values);
    console.log("🆔 Product ID:", productId);

    /* ---------------- VALIDATION ---------------- */

    if (!values.name?.trim()) errors.name = "Product name is required";
    if (!values.meta_title?.trim()) errors.meta_title = "Meta title is required";
    if (!values.meta_description?.trim()) errors.meta_description = "Meta description is required";

    let category_id;
    let category_path;

    if (!values.category?.trim()) {
        console.warn("⚠️ Category missing");
        errors.category = "Category is required";
    } else {
        const [id, path] = values.category.split("||");

        if (!id || !path) {
            console.warn("⚠️ Invalid category format:", values.category);
            errors.category = "Invalid category selected";
        } else {
            category_id = Number(id);
            category_path = path;
            console.log("📂 Category Parsed:", { category_id, category_path });
        }
    }

    /* ---------------- SKU UNIQUE CHECK ---------------- */
    if (values.sku?.trim()) {
        console.log("🔎 Checking SKU uniqueness:", values.sku);

        const skuExists = await prisma.product_list.findFirst({
            where: {
                sku: values.sku,
                NOT: { id: productId },
            },
        });

        if (skuExists) {
            console.warn("⚠️ Duplicate SKU Found");
            errors.sku = "This SKU already exists";
        }
    }

    /* ---------------- IMAGE PARSE ---------------- */
    let images = [];
    if (values.images) {
        try {
            images = JSON.parse(values.images);
            console.log("🖼 Parsed Images:", images);
        } catch (e) {
            console.error("❌ Invalid images JSON:", e);
            errors.images = "Invalid images data";
        }
    }

    /* ---------------- PRICE & STOCK ---------------- */



   const stockQty = values.stock_qty ? Number(values.stock_qty) : 0;
    const lowStockThreshold = values.low_stock_threshold
        ? Number(values.low_stock_threshold)
        : null;

    if (
        lowStockThreshold !== null &&
        (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0)
    ) {
        errors.low_stock_threshold = "Low stock threshold must be 0 or greater";
    }

    if (
        lowStockThreshold !== null &&
        stockQty >= 0 &&
        lowStockThreshold > stockQty
    ) {
        errors.low_stock_threshold =
            "Low stock threshold cannot be greater than stock quantity";
    }

    /* ---------------- RETURN IF VALIDATION FAILS ---------------- */

    if (Object.keys(errors).length > 0) {
        console.warn("❌ Validation Failed:", errors);
        return { success: false, errors, values };
    }

    /* ---------------- ADMIN CHECK ---------------- */

    console.log("🔐 Checking Admin Access...");
    const admin = await requireAdmin();

    if (!admin) {
        console.error("❌ Unauthorized Access Attempt");
        return {
            success: false,
            errors: { general: "Unauthorized. Please log in again." },
        };
    }

    console.log("✅ Admin Verified:", admin.id);

    try {
        /* ---- ------------ UNIQUE SLUG ---------------- */

        const baseSlug = generateSlug(values.name);
        let slug = baseSlug;
        let counter = 1;

        console.log("🔗 Generating slug from:", baseSlug);

        while (
            await prisma.product_list.findFirst({
                where: {
                    slug,
                    NOT: { id: productId },
                },
            })
        ) {
            slug = `${baseSlug}-${counter++}`;
        }

        console.log("✅ Final Slug:", slug);

        /* ---------------- UPDATE PRODUCT ---------------- */

        console.log("💾 Updating Product...");
        const product = await prisma.product_list.update({
            where: { id: productId },
            data: {
                name: values.name,
                slug,
                sku: values.sku || null,
category: {
  connect: { id: category_id }
},
                low_stock_threshold: lowStockThreshold,
                description: values.description || null,
                stepper_value: Number(values.stepper_value) || null,
                regular_price: Number(values.regular_price),
                sale_price: values.sale_price ? Number(values.sale_price) : null,
                stock_qty: stockQty,
            },
        });

        console.log("✅ Product Updated:", product.id);

        /* ---------------- IMAGE HANDLING ---------------- */

        if (!Array.isArray(images) || images.length === 0) {
            console.log("🧹 No images provided → soft deleting all");

            await prisma.product_images.updateMany({
                where: { product_list_id: productId },
                data: { is_deleted: true, is_primary: false },
            });
        } else {
            console.log("🖼 Processing Images...");

            const incomingUrls = [
                ...new Set(
                    images
                        .map(img => img?.image_url ?? img?.url)
                        .filter(url => typeof url === "string" && url.startsWith("http"))
                ),
            ];

            console.log("🔗 Normalized URLs:", incomingUrls);

            await prisma.product_images.updateMany({
                where: { product_list_id: productId },
                data: { is_deleted: true, is_primary: false },
            });

            await prisma.product_images.updateMany({
                where: {
                    product_list_id: productId,
                    image_url: { in: incomingUrls },
                },
                data: { is_deleted: false },
            });

            const existingImages = await prisma.product_images.findMany({
                where: {
                    product_list_id: productId,
                    image_url: { in: incomingUrls },
                    is_deleted: false,
                },
                distinct: ["image_url"],
                select: { image_url: true },
            });

            const existingUrls = existingImages.map(i => i.image_url);

            const newImages = incomingUrls
                .filter(url => !existingUrls.includes(url))
                .map(url => ({
                    product_list_id: productId,
                    image_url: url,
                    is_deleted: false,
                    is_primary: false,
                }));

            if (newImages.length) {
                console.log("➕ Inserting New Images:", newImages.length);
                await prisma.product_images.createMany({ data: newImages });
            }

            const primaryUrl =
                images.find(img => img.is_primary)?.image_url ||
                images.find(img => img.is_primary)?.url;

            if (primaryUrl) {
                console.log("⭐ Setting Primary Image:", primaryUrl);

                const primaryImage = await prisma.product_images.findFirst({
                    where: {
                        product_list_id: productId,
                        image_url: primaryUrl,
                        is_deleted: false,
                    },
                    orderBy: { id: "asc" },
                });

                if (primaryImage) {
                    await prisma.product_images.update({
                        where: { id: primaryImage.id },
                        data: { is_primary: true },
                    });
                }
            }
        }

        /* ---------------- SEO UPDATE ---------------- */

        console.log("🔍 Updating SEO Data...");

        await prisma.product_meta_data.update({
            where: { product_list_id: productId },
            data: {
                meta_title: values.meta_title,
                meta_description: values.meta_description,
                focus_keyword: values.focus_keyword,
            },
        });

        console.log("🎉 Product Update Completed Successfully");

        return { success: true, values };

    } catch (error) {
        console.error("💥 CRITICAL ERROR in updateProduct:", error);

        return {
            success: false,
            errors: {
                general: "Something went wrong. Please try again.",
            },
            values,
        };
    }
}