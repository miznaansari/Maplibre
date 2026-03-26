"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { requireUser } from "@/lib/requireUser";

export async function createAddress(data) {

    const user = await requireUser();
    if (!user) {
        return{ error: "Unauthorized"
    };

    }


  const address = await prisma.customer_address.create({
    data: {
      customer_list_id: user.id,
      first_name: data.first_name,
      last_name: data.last_name,
      address_1: data.address_1,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      phone: data.phone,
      email: data.email,
      country: data.country,
    },
  });

  return address;
}