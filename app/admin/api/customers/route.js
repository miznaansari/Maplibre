// /api/customers/route.js

import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer_list.findMany({
    where: {
      is_deleted: false,
      is_active: true,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
    },
  });

  return Response.json(
    customers.map((c) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name || ""}`,
      email: c.email,
    }))
  );
}