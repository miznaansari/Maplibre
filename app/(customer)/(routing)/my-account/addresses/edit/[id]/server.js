"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function updateAddress(addressId, prevState, formData) {
  const values = Object.fromEntries(formData);
  const errors = {};

  /* ---------- VALIDATION ---------- */
  if (!values.first_name?.trim()) errors.first_name = "First name is required";
  if (!values.address_1?.trim()) errors.address_1 = "Address is required";
  if (!values.email?.trim()) errors.email = "Email is required";
  if (!values.city?.trim()) errors.city = "City is required";
  if (!values.state?.trim()) errors.state = "State is required";
  if (!values.postal_code?.trim()) errors.postal_code = "Postal code is required";
  if (!values.country?.trim()) errors.country = "Country is required";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  /* ---------- AUTH ---------- */
  const c = await cookies();
  const token = c.get("authToken")?.value;
  if (!token) {
    return {
      success: false,
      errors: { general: "Unauthorized" },
      values,
    };
  }

  const payload = verifyToken(token);

  /* ---------- OWNERSHIP CHECK ---------- */
  const address = await prisma.customer_address.findFirst({
    where: {
      id: Number(addressId),
      customer_list_id: payload.id,
    },
  });

  if (!address) {
    return {
      success: false,
      errors: { general: "Address not found" },
      values,
    };
  }

  /* ---------- UPDATE ---------- */
  await prisma.customer_address.update({
    where: { id: Number(addressId) },
    data: {
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
      is_default: values.is_default === "on",
    },
  });

  redirect("/my-account/addresses?updated=1");
}
