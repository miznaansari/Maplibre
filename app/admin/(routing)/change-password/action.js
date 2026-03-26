"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import bcrypt from "bcryptjs";

/* -----------------------------------
   Password Validation
----------------------------------- */
function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function changePassword({ oldPassword, newPassword, confirmPassword }) {
  try {
    const user = await requireAdmin(); // 🔐 admin auth
    console.log('useruser',user)
    if (!user || !user.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { success: false, message: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "New passwords do not match" };
    }

    if (!isStrongPassword(newPassword)) {
      return {
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      };
    }

    const admin = await prisma.admins.findUnique({
      where: { id: user.id },
    });

    if (!admin) {
      return { success: false, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      return { success: false, message: "Old password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.admins.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Something went wrong" };
  }
}
