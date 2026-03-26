"use server";

import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

export async function addAdmin(prevState, formData) {
  const user = await requireAdmin(); // 🔐 PROTECTION
  if (!user) {
    return { success: false, message: "Unauthorized access" };
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const imageUrl = formData.get("image_url"); // This should be the uploaded image URL
  const imageAlt = formData.get("image_alt") || null;

  const errors = {};

  if (!name) errors.name = "Name is required";
  if (!email) errors.email = "Email is required";
  if (!password || password.length < 6)
    errors.password = "Password must be at least 6 characters";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const exists = await prisma.admins.findUnique({
    where: { email },
  });

  if (exists) {
    return {
      success: false,
      errors: { email: "Admin already exists" },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let imageGalleryId = null;

  // 🔹 If imageUrl is provided, create an image_gallery record
  if (imageUrl) {
    const image = await prisma.image_gallery.create({
      data: {
        url: imageUrl,
        alt_text: imageAlt,
        is_primary: true,
      },
    });

    imageGalleryId = image.id;
    console.log("Image gallery created:", image);
  }

  const admin = await prisma.admins.create({
    data: {
      name,
      email,
      password: hashedPassword,
      image_gallery_id: imageGalleryId,
    },
  });

  console.log("Admin created:", admin);

  return { success: true };
}
