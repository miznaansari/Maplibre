import { prisma } from "@/lib/prisma";
import MyCart from "../../UI/Cart/MyCart";
import CartTotal from "../../UI/Cart/CartTotal";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { requireUser } from "@/lib/requireUser";
import ClearCartButton from "../../UI/Cart/ClearCartButton";

export default async function Page() {

  let pricedCartData = [];
  let isGuest = false;
  let user;
  try {
    user = await requireUser();

    if (!user?.id) {
      isGuest = true;
    } else {

      const customer = await prisma.customer_list.findUnique({
        where: { id: user.id },
        select: {
          customer_group_id: true,
          price_tier: true,
        },
      });


      const customerGroupId = customer.customer_group_id;
      const priceTier = customer.price_tier;

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

      pricedCartData = cartData.map((item) => ({
        ...item,
        finalPrice: item.product.sale_price ?? item.product.regular_price,
      }));
    }

  } catch (e) {
    isGuest = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-3 md:pb-8 pt-0">

      <div className="py-3 sticky top-14 md:top-18 bg-white z-10 flex items-center justify-between border-b border-gray-200">

        <div className="flex items-center gap-3 justify-between">

          {/* LEFT */}
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#347eb3] transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />

            <span className="hidden sm:inline">
              Continue Shopping
            </span>
          </Link>

          {/* CENTER */}
          <h1 className="text-sm sm:text-base md:text-lg font-semibold tracking-wide text-black">

            <span className="sm:hidden">Cart</span>
            <span className="hidden sm:inline">Your Cart</span>

            <span className="ml-1 text-[#347eb3]">
              ({isGuest ? "" : pricedCartData.length})
            </span>

          </h1>

          {/* RIGHT placeholder */}
          <div className="w-[28px]" />

        </div>

        {/* RIGHT - CLEAR CART */}
        <ClearCartButton isGuest={isGuest} />

      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-1">

        <div className="lg:col-span-2">
          <MyCart
            cartData={pricedCartData}
            isGuest={user?.id ? false : true}
          />

        </div>

        {/* <div className="lg:col-span-1">
        <CartTotal
          cartData={pricedCartData}
          isGuest={isGuest}
        />
      </div> */}
 <Link
        href={`/checkout`}
        className="w-full mt-6 bg-[#347eb3] hover:bg-[#0284c7] text-white font-semibold text-center p-3 rounded-lg transition"
      >
        CONTINUE TO CHECKOUT
      </Link>
      </div>

    </div>
  );
}