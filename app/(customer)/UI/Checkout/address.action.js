"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

function validate(data) {
  const errors = {};

  if (!data.first_name) errors.first_name = "First name is required";
  if (!data.last_name) errors.last_name = "Last name is required";
  if (!data.email) errors.email = "Email is required";
  if (!data.address_1) errors.address_1 = "Street address is required";
  if (!data.city) errors.city = "City is required";
  if (!data.state) errors.state = "State is required";
  if (!data.postal_code) errors.postal_code = "Postcode is required";
  if (!data.country) errors.country = "Country is required";

  return Object.keys(errors).length ? errors : null;
}


export async function saveAddress(prevState, formData) {
  try {
    const user = await requireUser();
    const id = formData.get("id");

const payload = {
  first_name: formData.get("first_name") || "",
  last_name: formData.get("last_name") || "",
  email: formData.get("email") || "",
  address_1: formData.get("address_1") || "",
  city: formData.get("city") || "",
  state: formData.get("state") || "",
  postal_code: formData.get("postal_code") || "",
  country: formData.get("country") || "",
};


    const errors = validate(payload);
    if (errors) {
      return { success: false, errors };
    }

    /* =========================
       SAFE UPDATE
    ========================= */
    if (id) {
      const existing = await prisma.customer_address.findFirst({
        where: {
          id: Number(id),
          customer_list_id: user.id,
        },
      });

      if (existing) {
        const updated = await prisma.customer_address.update({
          where: { id: existing.id },
          data: payload,
        });

        return { success: true, id: updated.id };
      }
    }

    /* =========================
       CREATE (fallback)
    ========================= */
    const created = await prisma.customer_address.create({
      data: {
        ...payload,
        customer_list_id: user.id,
      },
    });

    return { success: true, id: created.id };

  } catch (e) {
    console.error("saveAddress error:", e);
    return { success: false, error: "Something went wrong" };
  }
}
