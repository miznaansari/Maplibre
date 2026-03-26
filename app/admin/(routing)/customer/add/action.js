// app/(admin)/customers/add/action.js
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import bcrypt from "bcryptjs";

export async function createCustomerAction(prevState, formData) {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, message: "Unauthorized Access" };
    }
  try {
    const values = {
      first_name: formData.get("first_name")?.trim() || "",
      last_name: formData.get("last_name")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      phone: formData.get("phone")?.trim() || "",
      customer_group_id: formData.get("customer_group_id") || "",
      price_tier: formData.get("price_tier") || "",
    };

    const password = formData.get("password");
    const errors = {};

    if (!values.first_name) errors.first_name = "First name is required";
    if (!values.email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      return { success: false, errors, values };
    }

    const existing = await prisma.customer_list.findUnique({
      where: { email: values.email },
    });

    if (existing) {
      return {
        success: false,
        message: "Email already exists",
        values,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.customer_list.create({
      data: {
        ...values,
        customer_group_id: values.customer_group_id
          ? Number(values.customer_group_id)
          : null,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
