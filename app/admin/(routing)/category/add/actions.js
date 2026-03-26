"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function addCategory(prevState, formData) {
    const values = Object.fromEntries(formData);
    const errors = {};

    try {
        const name = values.name?.trim();
        const slugInput = values.slug?.trim();
        const parent_id = values.parent_id || null;

        /* ================= VALIDATION ================= */
        if (!name) {
            errors.name = "Category name is required";
        }
         if (!values.meta_title?.trim()) {
            errors.meta_title = "Meta title is required";
        }

       
        if (Object.keys(errors).length > 0) {
            return { success: false, errors, values };
        }

        /* ================= AUTH ================= */
        const admin = await requireAdmin();
        if (!admin) {
            return {
                success: false,
                errors: { general: "Unauthorized. Please log in again." },
                values,
            };
        }

        /* ================= SLUG ================= */
        const slug =
            slugInput || name.toLowerCase().replace(/\s+/g, "-");

        /* ================= DUPLICATE CHECK ================= */
        const existingCategory = await prisma.product_category.findFirst({
            where: {
                slug,
                parent_id: parent_id ? Number(parent_id) : null,
            },
        });

        if (existingCategory) {
            return {
                success: false,
                errors: {
                    name: "Category already exists in this level",
                },
                values,
            };
        }

        let path = slug;

        /* ================= PARENT ================= */
        if (parent_id) {
            const parent = await prisma.product_category.findUnique({
                where: { id: Number(parent_id) },
                select: { path: true },
            });

            if (!parent) {
                return {
                    success: false,
                    errors: { parent_id: "Parent category not found" },
                    values,
                };
            }

            path = `${parent.path}/${slug}`;
        }

        /* ================= CREATE ================= */
        await prisma.product_category.create({
            data: {
                name,
                slug,
                path,
                description: values.description || "",
                parent_id: parent_id ? Number(parent_id) : null,
                seo:
                    values.meta_title ||
                    values.meta_description ||
                    values.focus_keyword
                        ? {
                              create: {
                                  meta_title: values.meta_title || "",
                                  meta_description:
                                      values.meta_description || "",
                                  focus_keyword:
                                      values.focus_keyword || "",
                              },
                          }
                        : undefined,
            },
        });

        return {
            success: true,
            errors: {},
            values: {},
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            errors: { general: "Category creation failed" },
            values,
        };
    }
}
