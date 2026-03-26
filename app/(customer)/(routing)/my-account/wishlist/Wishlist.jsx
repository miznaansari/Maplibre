"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { markAsPublic, removeWishlist } from "./actions";
import { ShareIcon } from "@heroicons/react/24/outline";
import ShareWishlistLink from "./ShareWishlistLink";

export default function Wishlist({ wishlists }) {
    const [, startTransition] = useTransition();

    const [loadingId, setLoadingId] = useState(null);
    const [loadingType, setLoadingType] = useState(null);

    // optimistic public/private state per wishlist
    const [optimisticPublic, setOptimisticPublic] = useState({});

    const startAction = async (
        wishlistId,
        type,
        action,
        optimisticUpdate
    ) => {
        setLoadingId(wishlistId);
        setLoadingType(type);

        // apply optimistic UI immediately
        if (optimisticUpdate) {
            setOptimisticPublic((prev) => ({
                ...prev,
                [wishlistId]: optimisticUpdate(),
            }));
        }

        startTransition(async () => {
            try {
                await action();
            } finally {
                setLoadingId(null);
                setLoadingType(null);
            }
        });
    };

    return (
        <div className="mx-auto max-w-6xl ">
            <p className=" text-md text-gray-600 mb-4">
                Wishlists
                {/* <span className="mx-1 text-[#0172BC]">{">"}</span> */}
                {/* <span className="font-medium text-[#0172BC]">{title}</span> */}
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {wishlists.length === 0 ? (
        // ✅ EMPTY STATE
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Image
                src="/images/not-found.png"
                alt="No wishlist"
                width={200}
                height={200}
                className="mb-4 opacity-70"
            />
            <p className="text-lg font-semibold text-gray-700">
                No wishlists found
            </p>
            <p className="text-sm text-gray-500 mb-4">
                Create your first wishlist to save products
            </p>

            <Link
                href="/shop"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
            >
                Browse Products
            </Link>
        </div>
    ) : (
        wishlists.map((wishlist) => {

                    const isLoading = loadingId === wishlist.id;
                    const isPublic =
                        optimisticPublic[wishlist.id] ?? wishlist.is_public;

                    return (
                        <div
                            key={wishlist.id}
                            className={`relative rounded-md border border-gray-200 bg-white shadow-sm transition-opacity
                ${isLoading ? "opacity-60 pointer-events-none" : ""}
              `}
                        >
                            {/* CARD OVERLAY */}
                            {/* {isLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                </div>
                            )} */}

                            {/* IMAGES */}
                            <div className="flex items-center justify-center gap-0 p-3">
                                {wishlist.products.length === 0 ? (
                                    // ✅ NO PRODUCTS → FULL WIDTH DEFAULT IMAGE
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <Image
                                            src="/images/not-found.png"
                                            alt="No products"
                                            fill
                                            sizes="100vw"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    // ✅ PRODUCTS EXIST
                                    wishlist.products.slice(0, 3).map((wp, _, arr) => {
                                        const count = arr.length;

                                        const widthClass =
                                            count === 1
                                                ? "w-full"
                                                : count === 2
                                                    ? "w-1/2"
                                                    : "w-1/3";

                                        const imageSrc =
                                            wp.product?.images?.length > 0 &&
                                                wp.product.images[0]?.image_url
                                                ? wp.product.images[0].image_url
                                                : "/images/not-found.png";

                                        return (
                                            <div
                                                key={wp.id}
                                                className={`relative h-40 ${widthClass} overflow-hidden`}
                                            >
                                                <Image
                                                    src={imageSrc}
                                                    alt={wp.product?.name || "Product image"}
                                                    fill
                                                    sizes={
                                                        count === 1
                                                            ? "100vw"
                                                            : count === 2
                                                                ? "50vw"
                                                                : "33vw"
                                                    }
                                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>
                                        );
                                    })
                                )}
                            </div>



                            {/* CONTENT */}
                            <div className="px-3 pb-3">
                                <p className="text-sm font-semibold text-gray-900">
                                    {wishlist.title}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Total Items: <b className="text-black">{wishlist.products.length}</b>
                                </p>

                                <div className="my-2 border-t border-dashed border-gray-300" />

                                {/* FOOTER */}
                                <div className="flex items-center justify-between text-xs">
                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                startAction(
                                                    wishlist.id,
                                                    "remove",
                                                    () => removeWishlist(wishlist.id)
                                                )
                                            }
                                            className="text-blue-600 hover:underline"
                                        >
                                            Remove
                                        </button>

                                        <Link
                                            href={`/shop?wishlist=${wishlist.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                    {wishlist.slug &&
                                  <ShareWishlistLink wishlist={wishlist} />

                                    }
                                    {/* TOGGLE */}
                                    {/* <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Make it Private</span>

                                        <button
                                            onClick={() =>
                                                startAction(
                                                    wishlist.id,
                                                    "toggle",
                                                    () =>
                                                        markAsPublic(
                                                            wishlist.id,
                                                            !isPublic
                                                        ),
                                                    () => !isPublic
                                                )
                                            }
                                            className={`relative inline-flex h-5 w-9 rounded-full transition-colors
                        ${isPublic ? "bg-gray-300" : "bg-blue-600"}
                      `}
                                        >
                                            <span
                                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform
                          ${isPublic ? "left-0.5" : "translate-x-4"}
                        `}
                                            />
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    );
                }))}
            </div>
        </div>
    );
}
