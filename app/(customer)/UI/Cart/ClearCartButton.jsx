"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function ClearCartButton({ isGuest }) {

  const router = useRouter();

  const clearCart = async () => {

    if (isGuest) {

      localStorage.removeItem("guest_cart");

      window.dispatchEvent(new Event("guestCartUpdated"));

      router.refresh();
      return;
    }

    /* DB CART */

    await fetch("/api/cart/clear", {
      method: "POST",
    });

    router.refresh();
  };

  return (
<button
  onClick={clearCart}
  className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
>
  <TrashIcon className="h-5 w-5" />

  {/* Mobile */}
  <span className="sm:hidden">Clear</span>

  {/* Desktop */}
  <span className="hidden sm:inline">Clear Cart</span>
</button>
  );
}