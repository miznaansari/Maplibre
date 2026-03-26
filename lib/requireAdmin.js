// lib/requireAdmin.js
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const c = await cookies();
  const token = c.get("adminToken")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.id) return null;

  const session = await prisma.admin_session.findFirst({
    where: {
      admin_id: payload.id,
      token,
      is_expired: false,
      token_expiry: { gt: new Date() },
    },
  });

  return session ? payload : null;
}
