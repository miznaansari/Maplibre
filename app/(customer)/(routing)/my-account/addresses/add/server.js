"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/requireUser";

export async function addAddress(prevState, formData) {
    console.log("🟢 addAddress called");

    const values = Object.fromEntries(formData);
    console.log("📥 Form values:", values);

    const errors = {};

    /* ---------------- VALIDATION ---------------- */
    console.log("🔍 Running validation");

    if (!values.first_name?.trim()) {
        errors.first_name = "First name is required";
    }

    if (!values.email?.trim()) {
        errors.email = "Email is required";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.email.trim())) {
            errors.email = "Enter a valid email address";
        }
    }

    if (!values.address_1?.trim()) {
        errors.address_1 = "Address is required";
    }

    if (!values.state?.trim()) {
        errors.state = "State is required";
    }

    if (!values.phone?.trim()) {
        errors.phone = "Phone number is required";
    }

    if (!values.city?.trim()) {
        errors.city = "City is required";
    }

    if (!values.postal_code?.trim()) {
        errors.postal_code = "Postal code is required";
    }

    if (!values.country?.trim()) {
        errors.country = "Country is required";
    }

    if (Object.keys(errors).length > 0) {
        console.warn("❌ Validation failed:", errors);
        return {
            success: false,
            errors,
            values,
        };
    }

    console.log("✅ Validation passed");

    /* ---------------- AUTH ---------------- */
    try {
        console.log("🔐 Checking user authentication");

        const payload = await requireUser();
        console.log("👤 Auth payload:", payload);

        if (!payload) {
            console.error("🚫 Unauthorized user");
            return {
                success: false,
                errors: { general: "Unauthorized" },
                values,
            };
        }

        /* ---------------- SAVE TO DB ---------------- */
        console.log("💾 Saving address to database");

        await prisma.customer_address.create({
            data: {
                customer_list_id: payload.id,
                first_name: values.first_name,
                last_name: values.last_name || null,
                company: values.company || null,
                address_1: values.address_1,
                address_2: values.address_2 || null,
                city: values.city,
                state: values.state || null,
                postal_code: values.postal_code,
                country: values.country,
                phone: values.phone || null,
                email: values.email || null,
            },
        });

        console.log("✅ Address saved successfully");

        /* ---------------- SUCCESS ---------------- */

     return {
            success: true,
            message: "Address added successfully",
            errors: {},
            values: {}, // ✅ IMPORTANT
        };

    } catch (error) {
        console.error("🔥 ERROR in addAddress:", error);

        return {
            success: false,
            errors: {
                general: "Something went wrong. Please try again.",
            },
            values,
        };
    }
}
