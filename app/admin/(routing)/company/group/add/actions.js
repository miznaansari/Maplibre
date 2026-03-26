"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

/* ---------------- SERVER ACTION ---------------- */
export async function addCustomerGroup(prevState, formData) {
    const values = Object.fromEntries(formData);
    const errors = {};

    /* ---------------- VALIDATION ---------------- */
    if (!values.group_name?.trim()) {
        errors.group_name = "Customer group name is required";
    }

    /* ---------------- UNIQUE GROUP NAME CHECK ---------------- */
    if (values.group_name?.trim()) {
        const exists = await prisma.customer_groups.findFirst({
            where: {
                group_name: values.group_name.trim(),
            },
        });

        if (exists) {
            errors.group_name = "Customer group already exists";
        }
    }

    // ❌ If validation fails
    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            errors,
            values,
        };
    }

    /* ---------------- AUTH CHECK ---------------- */
    const admin = await requireAdmin();
    if (!admin) {
        return {
            success: false,
            errors: {
                general: "Unauthorized. Please log in again.",
            },
        };
    }

    /* ---------------- CREATE CUSTOMER GROUP ---------------- */
    try {
        await prisma.customer_groups.create({
            data: {
                group_name: values.group_name.trim(),
                is_active: values.is_active !== "false", // default true
            },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error("Add customer group error:", error);

        return {
            success: false,
            errors: {
                general: "Something went wrong. Please try again.",
            },
            values,
        };
    }
}
