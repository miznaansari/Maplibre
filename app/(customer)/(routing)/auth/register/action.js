"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerAction(prevState, formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    // Check if user already exists
    const existingCustomer = await prisma.customer_list.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return { error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.customer_list.create({
      data: {
        email,
        password: hashedPassword,
        first_name: "Customer", // required field
        is_active: true,
      },
    });

    return { success: true };

  } catch (error) {
    console.error("Register action error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
