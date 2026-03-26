import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function POST() {

  const user = await requireUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.customer_cart.updateMany({
    where: {
      customer_list_id: user.id,
      is_deleted: false
    },
    data: {
      is_deleted: true
    }
  });

  return Response.json({ success: true });
}