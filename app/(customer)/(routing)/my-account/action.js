"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { requireUser } from "@/lib/requireUser";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
export async function updateCustomerAction(prevState, formData) {
    console.log("---- updateCustomerAction START ----");

    const user = await requireUser();
    console.log("User:", user);

    if (!user || !user.email) {
        console.log("Unauthorized access");
        return {
            success: false,
            message: "Unauthorized access",
            errors: {},
        };
    }

    const id = Number(user.id);
    console.log("Customer ID:", id);

    if (!id || isNaN(id)) {
        console.log("Invalid customer ID");
        return {
            success: false,
            message: "Invalid customer",
            errors: {},
        };
    }

    const errors = {};

    const first_name = formData.get("first_name")?.trim();
    const last_name = formData.get("last_name")?.trim() || null;
    const phone = formData.get("phone")?.trim() || null;
    const whatsapp = formData.get("whatsapp")?.trim() || null;

    const imageUrlsRaw = formData.get("imageUrls");

    console.log("Form Values:", {
        first_name,
        last_name,
        phone,
        whatsapp,
        imageUrlsRaw,
    });

    /* ---------- VALIDATION ---------- */
    if (!first_name) {
        errors.first_name = "First name is required";
    }

    if (phone && !/^[0-9]{7,15}$/.test(phone)) {
        errors.phone = "Phone number must be 7–15 digits";
    }

    if (whatsapp && !/^[0-9]{7,15}$/.test(whatsapp)) {
        errors.whatsapp = "WhatsApp number must be 7–15 digits";
    }

    if (Object.keys(errors).length > 0) {
        console.log("Validation errors:", errors);
        return {
            success: false,
            message: "Please fix the errors below",
            errors,
        };
    }

    /* ---------- IMAGE HANDLING ---------- */
    let imageUrl = null;

    if (imageUrlsRaw) {
        try {
            const parsed = JSON.parse(imageUrlsRaw);
            console.log("Parsed imageUrls:", parsed);

            if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = parsed[0];
            }
        } catch (err) {
            console.log("Image parse error:", err);
            return {
                success: false,
                message: "Invalid image data",
                errors: {},
            };
        }
    }

    console.log("Final imageUrl:", imageUrl);

    /* ---------- DATABASE UPDATE ---------- */
    try {
        await prisma.$transaction(async (tx) => {
            let imageGalleryId = null;

            if (imageUrl) {
                console.log("Creating image_gallery record...");

                const image = await tx.image_gallery.create({
                    data: {
                        url: imageUrl,
                        is_primary: true,
                        is_published: true,
                    },
                });

                imageGalleryId = image.id;
                console.log("Created image_gallery_id:", imageGalleryId);
            }

            console.log("Updating customer...");

            await tx.customer_list.update({
                where: { id },
                data: {
                    first_name,
                    last_name,
                    phone,
                    whatsapp,
                    ...(imageGalleryId && {
                        image_gallery_id: imageGalleryId,
                    }),
                },
            });

            console.log("Customer updated successfully");
        });

        console.log("---- updateCustomerAction SUCCESS ----");

        return {
            success: true,
            message: "Account updated successfully",
            errors: {},
        };
    } catch (error) {
        console.error("Database error:", error);

        return {
            success: false,
            message: "Something went wrong. Please try again.",
            errors: {},
        };
    }
}


export async function saveUserImageAction(prevState, formData) {
    const user = await requireUser();
    // ✅ TOKEN EXPIRED → REDIRECT
    if (!user || !user.email) {
           return {
                success: false,
                message: "Unauthorized access",
            };
    }

    try {
        const imageUrlsRaw = formData.get("imageUrls");

        if (!imageUrlsRaw) {
            return {
                success: false,
                message: "No image provided",
            };
        }

        let imageUrls = [];

        try {
            imageUrls = JSON.parse(imageUrlsRaw);
        } catch {
            return {
                success: false,
                message: "Invalid image data",
            };
        }

        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return {
                success: false,
                message: "Please upload an image",
            };
        }

        const imageUrl = imageUrls[0]; // take first image only

        // OPTIONAL: get user/customer ID from session or form
        // Example assumes customerId is passed or available
        const customerId = Number(user.id);

        if (!customerId || isNaN(customerId)) {
            return {
                success: false,
                message: "Invalid customer",
            };
        }

        await prisma.customer_list.update({
            where: { id: customerId },
            data: {
                profile_image: imageUrl,
            },
        });

        return {
            success: true,
            message: "Profile image updated successfully",
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: "Failed to update image. Please try again.",
        };
    }
}


export async function changePasswordAction(prevState, formData) {
    const user = await requireUser();
    if (!user?.email) {
        return {
            success: false,
            message: "Unauthorized access",
            errors: {},
        };
    }
    const errors = {};

    const customerId = Number(user.id);
    const currentPassword = formData.get("current_password");
    const newPassword = formData.get("new_password");
    const confirmPassword = formData.get("confirm_password");

    // ---------- VALIDATION ----------
    if (!customerId || isNaN(customerId)) {
        return {
            success: false,
            message: "Invalid user",
            errors: {},
        };
    }

    if (!currentPassword) {
        errors.current_password = "Current password is required";
    }

    if (!newPassword || newPassword.length < 8) {
        errors.new_password = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
        errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: "Please fix the errors below",
            errors,
        };
    }

    try {
        const user = await prisma.customer_list.findUnique({
            where: { id: customerId },
            select: { password: true },
        });

        if (!user) {
            return {
                success: false,
                message: "User not found",
                errors: {},
            };
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return {
                success: false,
                message: "Current password is incorrect",
                errors: {
                    current_password: "Incorrect password",
                },
            };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.customer_list.update({
            where: { id: customerId },
            data: {
                password: hashedPassword,
            },
        });

        return {
            success: true,
            message: "Password changed successfully",
            errors: {},
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: "Something went wrong. Please try again.",
            errors: {},
        };
    }
}