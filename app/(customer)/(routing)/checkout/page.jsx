import { requireUser } from "@/lib/requireUser";
import { prisma } from "@/lib/prisma";
import CheckoutFlow from "./CheckoutFlow";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {

  const user = await requireUser();

  if (!user?.id) {
    redirect("/auth/login?redirect=/checkout");
  }

  const customer = await prisma.customer_list.findUnique({
    where: { id: user.id },
    select: {
      customer_group_id: true,
      price_tier: true,
    },
  });

  const addresses = await prisma.customer_address.findMany({
    where: {
      customer_list_id: user.id,
      is_deleted: false,
    },
    orderBy: { created_at: "desc" },
  });

  const cartData = await prisma.customer_cart.findMany({
    where: {
      customer_list_id: user.id,
      is_deleted: false,
    },
    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
  });

  const pricedCartData = cartData.map((item) => {

    const p = item.product;

    const price =
      p.sale_price ??
      p.regular_price;

    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        images: p.images,
        price: Number(price),
      },
    };
  });

  return (
    <CheckoutFlow
      addresses={addresses}
      cartData={pricedCartData}
    />
  );
}