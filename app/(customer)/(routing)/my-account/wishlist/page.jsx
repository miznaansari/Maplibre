// app/wishlist/page.jsx
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import Wishlist from "./Wishlist";

export default async function WishlistPage() {
  const user = await requireUser();

  const wishlists = await prisma.wishlist.findMany({
    where: {
      customer_list_id: user.id,
      is_deleted: false,
    },
    include: {
      products: {
        where: { is_deleted: false },
        include: {
          product: {
            include: {
              images: {
                orderBy: { is_primary: "desc" }, // primary first
              },
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return <Wishlist wishlists={wishlists} />;
}
