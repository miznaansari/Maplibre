// lib/requireUser.js

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function requireUser() {

  // get cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) return null;

  // verify JWT
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return null;
  }

  if (!payload?.id) return null;

  // check session in database
  const session = await prisma.customer_session.findUnique({
    where: {
      token,
    },
    select: {
      customer_list_id: true,
      token_expiry: true,
      is_expired: true,
      customer: {
        select: {
          id: true,
          is_active: true,
          is_blocked: true,
        },
      },
    },
  });

  if (!session) return null;

  // check user match
  if (session.customer_list_id !== payload.id) return null;

  // check token expiry
  if (session.is_expired) return null;

  if (session.token_expiry < new Date()) return null;

  // check user status
  if (!session.customer?.is_active) return null;

  if (session.customer?.is_blocked) return null;

  // valid user
  return {
    id: session.customer.id,
  };
}