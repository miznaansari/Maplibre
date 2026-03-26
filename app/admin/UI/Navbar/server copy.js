"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (token) {
    try {
      const payload = verifyToken(token);

      // 🔒 Expire session in DB
      await prisma.customer_session.updateMany({
        where: {
          customer_list_id: payload.id,
          token: token,
          is_expired: false,
        },
        data: {
          is_expired: true,
        },
      });
    } catch (err) {
      // token invalid/expired → ignore
    }
  }

  // 🍪 Remove cookie (SERVER-SIDE, correct way)
  cookieStore.delete("authToken");

  // 🚀 Redirect to login/home
  redirect("/my-account");
}
