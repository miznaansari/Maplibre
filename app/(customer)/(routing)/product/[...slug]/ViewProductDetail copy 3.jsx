"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { addToCartDB, deleteCartItem } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";
import Highlight from "./highlight";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import RelatedProduct from "./RelatedProduct";
import {
  getUserWishlists,
  createWishlist,
  addSingleItemToWishlist,
} from "./action";
import WishlistDropdown from "./WishlistDropdown";

export default function ProductDetailClient({
  product,
  isLoggedIn,
  relatedProducts,
}) {
  const { showToast } = useToast();
  const { cartItems, reloadCart } = useCart();

  const price = product.price ?? product.regular_price;
  const step = Number(product.stepper_value ?? 1);

  const [qty, setQty] = useState(step);
  const [draftQty, setDraftQty] = useState(step);
  const [qtyError, setQtyError] = useState("");

  const debounceRef = useRef(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  /* ================================
     ❤️ WISHLIST STATE
  ================================= */
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [userWishlists, setUserWishlists] = useState([]);
  const wishlistBtnRef = useRef(null);

  /* =====================================================
     🛒 CURRENT CART ITEM
  ===================================================== */
  const cartItem = useMemo(() => {
    return cartItems?.find(
      (item) =>
        item.product_list_id === product.id &&
        item.is_deleted === false
    );
  }, [cartItems, product.id]);

  /* =====================================================
     🔄 SYNC QTY FROM CART
  ===================================================== */
  useEffect(() => {
    if (cartItem?.quantity) {
      setQty(cartItem.quantity);
      setDraftQty(cartItem.quantity);
    } else {
      setQty(step);
      setDraftQty(step);
    }
  }, [cartItem, step]);

  /* =====================================================
     LOAD USER WISHLISTS
  ===================================================== */
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadWishlists = async () => {
      const data = await getUserWishlists();
      setUserWishlists(data || []);
    };

    loadWishlists();
  }, [isLoggedIn]);

  /* =====================================================
     QTY VALIDATION
  ===================================================== */
  const validateAndSetQty = (value) => {
    const val = Number(value);

    if (!val || val === 0) {
      setQty(step);
      setDraftQty(step);
      setQtyError("");
      return;
    }

    if (val < step) {
      setQtyError(`Minimum required ${step}`);
      return;
    }

    if (val % step !== 0) {
      setQtyError(`Quantity must be in multiples of ${step}`);
      return;
    }

    setQtyError("");
    setQty(val);
    setDraftQty(val);
  };

  const handleQtyChangeDebounced = (value) => {
    setDraftQty(value);
    setQtyError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      validateAndSetQty(value);
    }, 400);
  };

  /* =====================================================
     ADD / UPDATE CART
  ===================================================== */
  const handleAddToCart = async () => {
    if (isAdding || qtyError) return;
    setIsAdding(true);

    try {
      if (isLoggedIn) {
        await addToCartDB({ productId: product.id, qty });
        await reloadCart();

        showToast({
          type: "success",
          message: cartItem
            ? "Cart updated successfully"
            : "Product added to cart",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Failed to update cart",
      });
    } finally {
      setIsAdding(false);
    }
  };

  /* =====================================================
     REMOVE ITEM
  ===================================================== */
  const handleRemoveItem = async () => {
    if (!cartItem || isRemoving) return;
    setIsRemoving(true);

    try {
      await deleteCartItem({ cartItemId: cartItem.id });
      await reloadCart();

      showToast({
        type: "success",
        message: "Item removed from cart",
      });
    } catch {
      showToast({
        type: "error",
        message: "Failed to remove item",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  /* =====================================================
     WISHLIST ACTIONS
  ===================================================== */
  const onWishlistToggle = () => {
    setIsWishlistOpen((prev) => !prev);
  };

  const onWishlistSelect = async (wishlist, productId) => {
    try {
      await addSingleItemToWishlist({
        wishlistId: wishlist.id,
        productId,
      });

      setIsInWishlist(true);
      setIsWishlistOpen(false);

      showToast({
        type: "success",
        message: "Added to wishlist",
      });
    } catch {
      showToast({
        type: "error",
        message: "Wishlist failed",
      });
    }
  };

  const onCreateWishlist = async (name) => {
    const newWishlist = await createWishlist({ name });
    setUserWishlists((prev) => [...prev, newWishlist]);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 bg-white">
        {/* IMAGE */}
        <div className="flex items-center justify-center p-2 pr-0">
          <div className="relative aspect-square w-full max-w-sm">
            <img
              src={product.mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            <button
              ref={wishlistBtnRef}
              onClick={onWishlistToggle}
              className="absolute top-2 right-2 cursor-pointer "
            >
              {isInWishlist ? (
                <HeartSolid className="w-6 h-6 text-[#00AEEF]" />
              ) : (
                <HeartOutline className="w-6 h-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* DETAILS */}
        <div className="lg:col-span-2 mt-8 border-l border-gray-200 pl-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <div className="mt-3 flex items-center gap-4">
            <span className="text-3xl font-bold text-[#0172BC]">
              ${price}
            </span>
            <span className="text-sm text-gray-500">
              {product.measure_unit}
            </span>
          </div>

          <div className="mt-6 max-w-md space-y-2">
            <div className="flex gap-3">
              <input
                type="number"
                min={step}
                value={draftQty}
                onChange={(e) =>
                  handleQtyChangeDebounced(e.target.value)
                }
                className="h-11 w-24 rounded border text-center"
              />

           <button
  onClick={handleAddToCart}
  className="flex-1 rounded px-6 py-3 text-sm font-medium text-white bg-[#00AEEF] hover:bg-[#0095cc] transition-colors duration-200 cursor-pointer"
>
  {cartItem ? "Update Cart" : "Add to Cart"}
</button>

            </div>

            {cartItem && (
              <button
                onClick={handleRemoveItem}
                className="h-11 w-full rounded border border-red-500 text-red-600 cursor-pointer hover:bg-red-50 transition-colors duration-200"
              >
                Remove from Cart
              </button>
            )}
          </div>

          <div className="mt-8 rounded bg-gray-100 p-4">
            <Highlight />
          </div>
        </div>
      </div>

      <RelatedProduct relatedProducts={relatedProducts} />

      {isWishlistOpen && (
        <WishlistDropdown
          anchorRef={wishlistBtnRef}
          wishlists={userWishlists}
          onSelect={(wishlist) =>
            onWishlistSelect(wishlist, product.id)
          }
          onCreate={onCreateWishlist}
          onClose={() => setIsWishlistOpen(false)}
        />
      )}
    </section>
  );
}
