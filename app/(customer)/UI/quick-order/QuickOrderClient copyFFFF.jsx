"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useDeferredValue,
  useMemo,
  useTransition,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";

import Image from "next/image";
import { ChevronDownIcon, ExclamationTriangleIcon, HeartIcon, HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import {
  getWishlists,
  getUserWishlists,
  createWishlist,
  addProductsToWishlist,
  addToCartAction,
  getWishlistForPrefill,
  getOrderForPrefill,
  addSingleItemToWishlist,
  getOrderList, addWishlistItems, addSingleItemRemoveToWishlist, AddtoYourWishlist
} from "./action";

import WishlistDropdown from "./WishlistDropdown";
import QuickOrderTopBar from "./QuickOrderTopBar";
import { useToast } from "@/app/admin/context/ToastProvider";
import { useCart } from "@/app/context/CartContext";
import BulkWishlistDropdown from "./BulkWishlistDropdown";
import ProductImageCell from "./ProductImageCell";
import Link from "next/link";
import QuickOrderNavbar from "./QuickOrderNavbar";

/* =========================
   ROW
========================= */
const ProductRow = React.memo(function ProductRow({
  setCreateWishlistLoader,
  createWishlistLoader,
  index, userWishlists, wishlistSelected,
  qtyRefs,
  product,
  quantity,
  isSelected,
  isWishlistOpen,
  isInWishlist, onCreateWishlist,
  loadingDetails,
  onQtyChange,
  onToggleSelect,
  onWishlistToggle,
  wishlists,
  onWishlistSelect,
  customerId,
}) {
  // console.log('productproduct',product)
  const wishlistBtnRef = useRef(null);

  const getCurrentQty = () => {
    const draft = draftQty[product.id];
    if (draft === undefined || draft === "") return quantity || 0;
    const n = Number(draft);
    return Number.isNaN(n) ? quantity || 0 : n;
  };



  const step = Number(product.stepper_value) || 1;
  // console.log('steppp',step)
  const [qtyErrors, setQtyErrors] = useState({});
  const [draftQty, setDraftQty] = useState({});
  const debounceRefs = useRef({});
  // console.log('productproduct',product)
  return (
    <tr className="border-b border-gray-300 odd:bg-white even:bg-[#F3F8FB]">
      <td className="border border-gray-300 px-2 text-center">
        <input type="checkbox"
          className="h-5 w-5 scale-80 cursor-pointer 
           accent-[#3170B7] 
           border-[#3170B7] 
           rounded"
          checked={isSelected} onChange={onToggleSelect} />
      </td>

      <td className="border border-gray-300 font-semibold px-3 text-[#181818]">{product.sku ?? "—"}</td>
      <td className="border border-gray-300 px-3 py-1  font-medium">
        <div className="flex items-center gap-2">
          <ProductImageCell
            src={product.mainImage?.["64"] || product.original}
            variant={product.mainImage?.["720"] || product.original}
            alt={product.name}
            loadingDetails={loadingDetails}
          />
          <Link href={`/product/${product.slug}`} className="text-[#4A4A4A] font-normal">{product.name}</Link>
        </div>
      </td>



      <td className="border border-gray-300 px-2 text-center">{product.measure_unit ?? "—"}</td>

      <td className="border border-gray-300 px-2  text-right font-semibold">
        {loadingDetails ? (
          <span className="inline-block h-5 w-10 bg-gray-200 animate-pulse rounded" />
        ) : (
          `$${(product.price ?? product.regular_price).toFixed(2)}`
        )}
      </td>


      <td className="h-8  px-0 w-20 max-w-20 text-center">
        <div className="relative group flex flex-col items-center h-full">
          <input
            ref={(el) => (qtyRefs.current[index] = el)}
            type="number"
            min="0"
            inputMode="numeric"
            value={draftQty[product.id] ?? quantity}

            onChange={(e) => {
              const rawVal = e.target.value;

              // allow typing freely
              setDraftQty((prev) => ({
                ...prev,
                [product.id]: rawVal,
              }));

              // clear old timer
              if (debounceRefs.current[product.id]) {
                clearTimeout(debounceRefs.current[product.id]);
              }

              // debounce validation
              debounceRefs.current[product.id] = setTimeout(() => {
                const val = Number(rawVal);

                setQtyErrors((prev) => ({
                  ...prev,
                  [product.id]: "",
                }));

                if (!val || val === 0) {
                  onQtyChange(product.id, 0);
                  return;
                }

                if (val < step) {
                  setQtyErrors((prev) => ({
                    ...prev,
                    [product.id]: `Minimum required ${step}`,
                  }));
                  return;
                }

                if (val % step !== 0) {
                  setQtyErrors((prev) => ({
                    ...prev,
                    [product.id]: `Quantity must be in multiples of ${step}`,
                  }));
                  return;
                }

                // ✅ valid
                onQtyChange(product.id, val);

                // sync draft with final value
                setDraftQty((prev) => ({
                  ...prev,
                  [product.id]: val,
                }));
              }, 400);
            }}

            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();

                const base = getCurrentQty();
                const next = Math.ceil(base / step) * step + step;

                onQtyChange(product.id, next);
                setDraftQty((p) => ({ ...p, [product.id]: next }));
                setQtyErrors((p) => ({ ...p, [product.id]: "" }));
              }

              if (e.key === "ArrowDown") {
                e.preventDefault();

                const base = getCurrentQty();
                const next = Math.max(
                  0,
                  Math.floor((base - 1) / step) * step
                );

                onQtyChange(product.id, next);
                setDraftQty((p) => ({ ...p, [product.id]: next }));
                setQtyErrors((p) => ({ ...p, [product.id]: "" }));
              }

              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                qtyRefs.current[index + 1]?.focus();
              }

              if (e.key === "Tab" && e.shiftKey) {
                e.preventDefault();
                qtyRefs.current[index - 1]?.focus();
              }
            }}

            onBlur={() => {
              // cleanup draft on blur if no error
              if (!qtyErrors[product.id]) {
                setDraftQty((prev) => {
                  const copy = { ...prev };
                  delete copy[product.id];
                  return copy;
                });
              }
            }}

            onWheel={(e) => e.currentTarget.blur()}

            className={`
        w-full text-base h-full py-0 text-center border
        focus:outline-none focus:border-[#3170B7]
        ${qtyErrors[product.id] ? "border-[#B73131]" : "border-white"}
      `}
          />

          {/* 🔴 ERROR TOOLTIP (hover only) */}
          {qtyErrors[product.id] && (
            <div
              className="
          absolute z-30 bottom-full mb-1
          px-2 py-1 text-xs text-white
          bg-[#B73131] rounded shadow
          opacity-0 group-hover:opacity-100
          group-focus-within:opacity-100
          transition-opacity duration-200
          pointer-events-none
          whitespace-nowrap
        "
            >
              {qtyErrors[product.id]}
            </div>
          )}
          {qtyErrors[product.id] && (
            <ExclamationTriangleIcon className="w-5 h-5 text-[#B73131] absolute right-3 top-2" />
          )}
        </div>
      </td>

      <td className="border border-gray-300 px-2 text-center relative">
        <div >
          <button ref={wishlistBtnRef} onClick={onWishlistToggle} className="cursor-pointer">
            {isInWishlist || isWishlistOpen ? (
              <HeartSolid className="w-5 h-5 text-[#00AEEF]" />
            ) : (
              <HeartOutline className="w-5 h-5 text-[#616161] hover:text-[#3170B7]" />
            )}
          </button>


          {isWishlistOpen && (
            <WishlistDropdown
              setCreateWishlistLoader={setCreateWishlistLoader}
              createWishlistLoader={createWishlistLoader}

              anchorRef={wishlistBtnRef}
              wishlists={userWishlists}
              onSelect={(wishlist) => {
                onWishlistSelect(wishlist, product.id);
                onWishlistToggle(null);
              }}
              onCreate={onCreateWishlist}
              onClose={() => onWishlistToggle(null)} // 👈 REQUIRED
            />
          )}
        </div>
      </td>

    </tr>
  );
});

/* =========================
   MAIN
========================= */

export default function QuickOrderClient({ products, customerId, menuData, isLoggedIn }) {
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  // const wishlistBtnRef = useRef(null);
  const { reloadCart } = useCart();
  const [wishlistSelected, setwishlistSelected] = useState('')
  const [isPending, startTransition] = useTransition();
  const [wishlistSelectLoader, setWishlistSelectLoader] = useState(false);
  const [bulkWishlistOpen, setBulkWishlistOpen] = useState(false);
  const [activeRowWishlist, setActiveRowWishlist] = useState(null);

  /* ---------- DATA ---------- */
  const [mergedProducts, setMergedProducts] = useState(products);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const [quantities, setQuantities] = useState(new Map());
  const [selected, setSelected] = useState({});
  useEffect(() => {
    console.log('selectedselected', selected)
  }, [selected])
  useEffect(() => {
    console.log('wishlistSelected ', wishlistSelected)
  }, [wishlistSelected])
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [wishlists, setWishlists] = useState([]);
  const [userWishlists, setUserWishlists] = useState([]);
  const [createWishlistLoader, setCreateWishlistLoader] = useState(false);

  const [orderLists, setOrderLists] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);

  const [activeWishlistFor, setActiveWishlistFor] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [shareSlug, setShareSlug] = useState(null);
  useEffect(() => {
    console.log('activeCategoryactiveCategory', activeCategory)
  }, [activeCategory])
  const qtyRefs = useRef([]);
  const [share, setShare] = useState(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    const wishlistId = searchParams.get("wishlist");

    if (wishlistId && wishlistId.startsWith("s")) {
      setShare(true);
      setShareSlug(wishlistId);
    } else {
      setShare(false);
    }

    if (!wishlistId) return;

    // prevent re-running
    setwishlistSelected(wishlistId);
    console.log('wishlistId', wishlistId)
    // prefill wishlist products
    handleWishlistPrefill(wishlistId);
  }, [searchParams, customerId]);

  /* =========================
     LOAD DETAILS (ONCE)
  ========================= */
  useEffect(() => {
    let alive = true;

    async function loadDetails() {
      try {
        const res = await fetch("/api/quick-order-detail", {
          credentials: "include",
        });
        const details = await res.json();

        const map = new Map(details.map((d) => [d.id, d]));

        if (!alive) return;

        setMergedProducts((prev) =>
          prev.map((p) => (map.has(p.id) ? { ...p, ...map.get(p.id) } : p))
        );
      } catch (e) {
        console.error("detail load failed", e);
      } finally {
        if (alive) setLoadingDetails(false);
      }
    }

    loadDetails();
    return () => (alive = false);
  }, []);

  /* =========================
     LOAD WISHLIST / ORDER
  ========================= */
  useEffect(() => {
    getWishlists().then(setWishlists);

    if (!customerId) return;
    getUserWishlists(customerId).then(setUserWishlists);
    getOrderList(customerId).then(setOrderLists);
  }, [customerId]);

  /* =========================
     FILTER
  ========================= */
  const finalProducts = useMemo(() => {
    let list = mergedProducts;
    // console.log('list',list)
    // console.log('liestee',list)
    // ✅ explicit null check
    if (activeCategory !== null) {
      const cat = activeCategory.toLowerCase();
      list = list.filter((p) =>
        p?.category?.path?.toLowerCase().includes(cat)
      );
    }

    if (activeCategory) {
      const cat = activeCategory.toLowerCase();
      console.log('cat', cat)

      list = list.filter((p) =>
        p?.category?.path?.toLowerCase().includes(cat)
      );
      console.log('listlistlist', list)
    }


    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (wishlistProductIds.length) {
      list = list.filter((p) => wishlistProductIds.includes(p.id));
    }

    return list;
  }, [mergedProducts, activeCategory, deferredSearch, wishlistProductIds]);


  /* =========================
     HANDLERS
  ========================= */
  const handleQtyChange = (id, val) =>
    setQuantities((m) => new Map(m).set(id, val));

  const toggleSelect = (id) =>
    setSelected((p) => ({ ...p, [id]: !p[id] }));

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  /* =========================
     CART
  ========================= */
  const handleAddToCart = () => {
    startTransition(async () => {
      /* -------------------------------
         Build payload from quantities
      -------------------------------- */
      const payload = {};
      quantities.forEach((q, id) => {
        if (q > 0) payload[id] = q;
      });

      if (!Object.keys(payload).length) {
        showToast({ type: "error", message: "Add quantity first" });
        return;
      }

      /* =======================
         GUEST USER → localStorage
      ======================== */
      if (!isLoggedIn) {
        const guestCart =
          JSON.parse(localStorage.getItem("guest_cart")) || {};

        Object.entries(payload).forEach(([productId, qty]) => {
          const pid = Number(productId);

          // find product from mergedProducts
          const product = mergedProducts.find((p) => p.id === pid);
          if (!product) return;

          if (guestCart[pid]) {
            guestCart[pid].quantity += qty;
          } else {
            console.log('productproewductproduct', product)
            guestCart[pid] = {
              product_id: pid,
              name: product.name,
          sku: product.sku,

              price: product.price ?? product.regular_price,
              image: product.mainImage?.["64"] || product.original,
              quantity: qty,
            };
          }
        });

        localStorage.setItem("guest_cart", JSON.stringify(guestCart));

        reloadCart();
        setQuantities(new Map());

        showToast({
          type: "success",
          message: "Added to cart.",
        });
        return;
      }

      /* =======================
         LOGGED IN USER → API
      ======================== */
      const res = await addToCartAction({
        customerId,
        quantities: payload,
      });

      if (res?.success) {
        reloadCart();
        setQuantities(new Map());
        showToast({ type: "success", message: "Added to cart" });
        return;
      }

      showToast({
        type: "error",
        message: res?.message || "Something went wrong",
      });
    });
  };


  /* =========================
     WISHLIST
  ========================= */
  const handleWishlistSelect = async (wishlist) => {
    if (wishlistSelected === '') {
      console.log('wishlist notselected')
      const newItems = selectedIds.map((id) => ({
        productId: Number(id),
        quantity: Number(quantities.get(Number(id))) || 1,
      }));
      await addWishlistItems(wishlist.id, newItems);
      showToast({
        type: "success",
        message: "Products added to wishlist",
      });

    } else {
      console.log('wishlist selected')

      const newItems = selectedIds.map((id) => ({
        productId: Number(id),
        quantity: Number(quantities.get(Number(id))) || 1,
      }));

      const previousWishList = await getWishlistForPrefill(
        wishlist.id,
        customerId
      );
      const prevItems = previousWishList?.items || [];

      const newMap = new Map(
        newItems.map((i) => [i.productId, i])
      );

      const prevMap = new Map(
        prevItems.map((i) => [i.product_list_id, i])
      );

      const finalItems = [];

      /* =========================
         NEW | EXISTING | MODIFIED
      ========================= */
      for (const [productId, item] of newMap) {
        const prevItem = prevMap.get(productId);

        if (!prevItem) {
          finalItems.push({
            productId,
            quantity: item.quantity,
            status: "new",
          });
        } else if (prevItem.qty !== item.quantity) {
          finalItems.push({
            productId,
            quantity: item.quantity,
            status: "modified",
          });
        } else {
          finalItems.push({
            productId,
            quantity: item.quantity,
            status: "existing",
          });
        }
      }

      /* =========================
         REMOVED
      ========================= */
      for (const [productId, item] of prevMap) {
        if (!newMap.has(productId)) {
          finalItems.push({
            productId,
            quantity: item.qty,
            status: "removed",
          });
        }
      }

      console.log("FINAL PAYLOAD", finalItems);

      /* =========================
         SAVE & HANDLE ERROR
      ========================= */
      const res = await addProductsToWishlist({
        wishlistId: wishlist.id,
        items: finalItems,
      });

      if (!res?.success) {
        showToast({
          type: "error",
          message: res?.message || "Failed to update wishlist",
        });
        return;
      }

      setActiveWishlistFor(null);

      showToast({
        type: "success",
        message: "Wishlist updated successfully",
      });
    }

  };


  const handleWishlistPrefill = async (id) => {
    setWishlistSelectLoader(true);
    if (!id) {
      setWishlistProductIds([]);
      setQuantities(new Map());
      setSelected({});
      setWishlistSelectLoader(false);

      return;
    }

    const wl = await getWishlistForPrefill(id, customerId);
    console.log('wl', wl)
    if(wl.success===false ){
      showToast({
        type: "error",
        message: wl.message || "Failed to load wishlist",
      });
      setWishlistSelectLoader(false);
      return;
    }
    const map = new Map();
    const ids = [];
    const selectedMap = {};

    wl.items.forEach((i) => {
      map.set(i.product_list_id, i.qty);
      ids.push(i.product_list_id);
      selectedMap[i.product_list_id] = true; // ✅ checkbox ON
    });

    setQuantities(map);
    setWishlistProductIds(ids);
    setSelected(selectedMap); // ✅ APPLY
    setWishlistSelectLoader(false);
  };

  const handleSingleItemWishlist = async (wishlist, productId) => {
    if (wishlistSelected === '') {


      const qty = Number(quantities.get(productId)) || 1;

      const res = await addSingleItemToWishlist({
        wishlistId: wishlist.id,
        productId,
        quantity: qty,
      });

      if (!res?.success) {
        showToast({
          type: "error",
          message: res?.message || "Failed to add product to wishlist",
        });
        return;
      }

      showToast({
        type: "success",
        message: res.message || "Product added to wishlist",
      });
    } else {
      const qty = Number(quantities.get(productId)) || 1;
      console.log("wishlistProductIds before:", wishlistProductIds, productId);

      setWishlistProductIds((prev) => {
        const updated = prev.filter((id) => id !== productId);
        console.log("wishlistProductIds after:", updated);
        return updated;
      });

      const res = await addSingleItemRemoveToWishlist({
        wishlistId: wishlist.id,
        productId,
        quantity: qty,
      });

      showToast({
        type: "success",
        message: res.message || "Product removed from wishlist",
      });

    }
  };


  const handleOrderPrefill = async (id) => {
    if (!id) {
      setWishlistProductIds([]);
      setQuantities(new Map());
      setSelected({});
      setWishlistSelectLoader(false);

      return;
    }


    const order = await getOrderForPrefill(id, customerId);
    const map = new Map();
    const ids = [];

    order.items.forEach((i) => {
      map.set(i.product_list_id, i.qty);
      ids.push(i.product_list_id);
    });

    setQuantities(map);
    setWishlistProductIds(ids);
    showToast({ type: "success", message: "Order loaded" });
  };
  const openWishlistForBulk = () => {
    if (selectedProductIds.length === 0) {
      showToast({ type: "error", message: "Select products first" });
      return;
    }
    setBulkWishlistOpen((p) => !p);
  };


  const bulkRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (bulkRef.current && !bulkRef.current.contains(e.target)) {
        setBulkWishlistOpen(false);
      }
    }

    if (bulkWishlistOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bulkWishlistOpen]);

  const handleCreateWishlist = async (name) => {
    console.log('testsasdets')
    setCreateWishlistLoader(true);

    const res = await createWishlist(name);

    if (!res?.success) {
      showToast({
        type: "error",
        message: res?.message || "Failed to create wishlist",
      });

      return;
    }
    console.log('testsets')
    // ✅ refetch wishlists
    const updated = await getWishlists(customerId);
    setWishlists(updated);
    getUserWishlists(customerId).then(setUserWishlists);
    showToast({
      type: "success",
      message: "Wishlist created successfully",
    });
    setCreateWishlistLoader(false);
  };


  /* =========================
     RENDER
  ========================= */

  const selectedProductIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]


  );

  const allVisibleSelected =
    finalProducts.length > 0 &&
    finalProducts.every((p) => selected[p.id]);

  const toggleSelectAllVisible = () => {
    const next = { ...selected };

    if (allVisibleSelected) {
      // unselect visible rows
      finalProducts.forEach((p) => {
        delete next[p.id];
      });
    } else {
      // select visible rows
      finalProducts.forEach((p) => {
        next[p.id] = true;
      });
    }

    setSelected(next);
  };
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollY && currentScroll > 100) {
        // scroll down (after some scroll)
        setShow(false);
      } else {
        // scroll up
        setShow(true);
      }

      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className=" mx-auto px-0  ">
      <div
        className={`md:sticky md:top-0 md:z-30 md:transition-transform md:duration-300 ${show ? "md:translate-y-0" : "md:-translate-y-full"
          }`}
      >
        <div className="shadow-sm md:bg-white">
          <QuickOrderNavbar
            setActiveCategory={setActiveCategory}
            menuData={menuData}
          />
        </div>
      </div>
      {/* // <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen overflow-y-scroll"> */}
      <div className="px-4 pt-4 max-w-7xl mx-auto min-h-screen ">
        {/* FILTER BAR */}
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap  ">
          <div className="flex gap-2  flex-wrap md:flex-nowrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for Products"
              className="border
              focus:border-[rgb(var(--inputFieldFocusBorder))]
      focus:outline-none
              border-[rgb(var(--inputField))]   focus:border-[rgb(var(--inputFieldFocusBorder))] w-full  lg:min-w-[350px] px-3 py-2 rounded"
            />



            <div className="relative flex-1 basis-0 min-w-[180px]  ">
              <select
                className="
           w-full
      appearance-none
      cursor-pointer
      rounded
      border
border-[rgb(var(--inputField))] 
      bg-white
      px-4
      py-2.5
      pr-10
      text-sm
      text-gray-800
      transition
      focus:border-[rgb(var(--inputFieldFocusBorder))]
      focus:outline-none
      hover:border-[rgb(var(--inputFieldFocusBorder))]
    "
                value={wishlistSelected}   // ✅ controlled
                onChange={(e) => {
                  setwishlistSelected(e.target.value);
                  handleWishlistPrefill(e.target.value);
                }}
              >
                <option value="">Select Wishlist</option>

                {wishlists.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>

              {/* Heroicon Arrow */}
              <ChevronDownIcon
                className="
      pointer-events-none
      absolute
      right-3
      top-1/2
      h-4
      w-4
      -translate-y-1/2
      text-gray-400
    "
              /></div>


            <div className="relative flex-1 basis-0 min-w-[180px]  ">
              <select
                className="
      appearance-none
      rounded
      w-full
      border
 border-[rgb(var(--inputField))] 
      bg-white
      px-4
      py-2.5
      cursor-pointer
      pr-10
      text-sm
      text-gray-800
      transition
      focus:border-[rgb(var(--inputFieldFocusBorder))]
      focus:outline-none
      hover:border-[rgb(var(--inputFieldFocusBorder))]
    "
                onChange={(e) => handleOrderPrefill(e.target.value)}
              >
                <option value="">Select Order</option>
                {orderLists.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>

              {/* Heroicon Arrow */}
              <ChevronDownIcon
                className="
      pointer-events-none
      absolute
      right-3
      top-1/2
      h-4
      w-4
      -translate-y-1/2
      text-gray-400
    "
              />
            </div>

          </div>
          <div className="flex gap-2 flex-1 md:flex-none ">
{shareSlug && (
  <button
    disabled={adding}
    onClick={async () => {
      if (adding) return;

      setAdding(true);

      try {
        const res = await AddtoYourWishlist(shareSlug);

        if (res?.success) {
          showToast({
            type: "success",
            message: res.message || "Wishlist added to your account",
          });
        } else {
          showToast({
            type: "error",
            message: res?.message || "Failed to add wishlist",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAdding(false);
      }
    }}
    className="flex items-center gap-2 rounded bg-[#3170B7] px-4 py-2 text-sm text-white hover:bg-[#2B65A3] disabled:opacity-60"
  >
    {adding && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
    )}

    {adding ? "Adding..." : "Add to your wishlist"}
  </button>
)}
            {/* ADD WISHLIST */}
            <div className="relative w-full sm:w-44" ref={bulkRef}>
              <button
                onClick={openWishlistForBulk}
                className="
                    cursor-pointer
        w-full
        flex items-center justify-between
        rounded
        border border-[#3170B7]
        bg-white
        p-2
        text-sm font-semibold
        text-[#3170B7]
        transition
   
        focus:outline-none focus:ring-2 focus:ring-white/40
      "
              >
                <span>Add Wishlist</span>
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className="
    pointer-events-none
    absolute
    right-3
    top-1/2
    h-4
    w-4
    -translate-y-1/2
    
  "
                />

              </button>

              {bulkWishlistOpen && (
                <div className="absolute right-0 z-50 mt-2 w-full">
                  <BulkWishlistDropdown
                    setCreateWishlistLoader={setCreateWishlistLoader}
                    createWishlistLoader={createWishlistLoader}
                    wishlists={userWishlists}
                    onSelect={(wishlist) => {
                      handleWishlistSelect(wishlist);
                      setBulkWishlistOpen(false);
                    }}
                    onCreate={handleCreateWishlist}
                  />
                </div>
              )}

            </div>
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className="
      w-full sm:w-44 cursor-pointer
      rounded
      bg-[#3170B7]
      border border-[#3170B7]
      p-2
      text-sm font-semibold
      text-white
      shadow-sm
      transition
   hover:bg-[#2B65A3]

      hover:text-white
      focus:outline-none focus:ring-2 focus:ring-[#3170B7]/40
      disabled:opacity-50 disabled:cursor-not-allowed
    "
            >
              {isPending ? "Adding..." : "Add to Cart"}
            </button>

          </div>
        </div>



        {wishlistSelected === ""
          ? (<>
            <div className="
  flex flex-col gap-3
  md:flex-row md:items-center md:justify-between
  mb-0
            md:sticky top-0

  bg-[#3170B7]
  z-30
"
              style={{ width: '100% !important' }}
            >
              {/* LEFT SIDE */}




            </div>
            <div className="w-full overflow-auto md:overflow-visible">

              <table className="w-full md:table-fixed border text-sm mt-0">
                <thead
                  className={`bg-gray-100 z-20 text-gray-800 md:sticky md:w-full
  transition-[top,transform] duration-300 ease-out
  ${lastScrollY < 190
                      ? "md:top-0 md:translate-y-0"
                      : show
                        ? "md:top-[58px] md:translate-y-0"
                        : "md:top-0 md:translate-y-0"
                    }`}
                ><tr>
                    <th className="border border-gray-300 px-2 py-2 text-center md:w-[50px]">
                      <input
                        type="checkbox"
                        className="h-5 w-5 scale-80 cursor-pointer 
           accent-[#3170B7] 
           border-[#3170B7] 
           rounded"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                      />
                    </th>

                    <th className="border border-gray-300 text-[#5F5F5F] font-normal px-3 py-2 text-left md:w-[170px]">
                      Product Code
                    </th>

                    {/* FLEX COLUMN */}
                    <th className="border border-gray-300 text-[#5F5F5F] font-normal px-3 py-2 text-left md:w-full">
                      Product Name
                    </th>

                    <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[90px]">
                      Unit
                    </th>

                    <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[160px]">
                      Unit Price (Ex GST)
                    </th>

                    <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[80px]">
                      QTY
                    </th>

                    <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[120px]">
                      Wishlist
                    </th>
                  </tr>
                </thead>



                <tbody className="">
                  {finalProducts.map((p, index) => (
                    <ProductRow
                      setCreateWishlistLoader={setCreateWishlistLoader}
                      createWishlistLoader={createWishlistLoader}
                      key={p.id}
                      index={index}
                      wishlistSelected={wishlistSelected}
                      product={p}
                      userWishlists={userWishlists}
                      quantity={quantities.get(p.id) ?? ""}
                      isSelected={!!selected[p.id]}
                      isInWishlist={wishlistProductIds.includes(p.id)}
                      isWishlistOpen={activeWishlistFor === p.id}      // dropdown only

                      loadingDetails={loadingDetails}
                      onQtyChange={handleQtyChange}
                      onToggleSelect={() => toggleSelect(p.id)}
                      onWishlistToggle={() =>
                        setActiveWishlistFor((prev) => (prev === p.id ? null : p.id))
                      }
                      wishlists={wishlists}
                      onWishlistSelect={handleSingleItemWishlist}   // 👈
                      customerId={customerId}
                      onCreateWishlist={handleCreateWishlist}
                      qtyRefs={qtyRefs}
                    />
                  ))}

                </tbody>
              </table>

            </div> </>)
          : Object.keys(selected || {}).length > 0
            ? (<>
              <div className="
  flex flex-col gap-3
  md:flex-row md:items-center md:justify-between
  mb-0
            md:sticky top-0

  bg-[#3170B7]
  z-30
"
                style={{ width: '100% !important' }}
              >
                {/* LEFT SIDE */}




              </div>
              <div className="w-full overflow-auto md:overflow-visible">

                <table className="w-full md:table-fixed border text-sm mt-0">
                  <thead
                    className={`bg-gray-100 z-20 text-gray-800 md:sticky md:w-full
  transition-[top,transform] duration-300 ease-out
  ${lastScrollY < 190
                        ? "md:top-0 md:translate-y-0"
                        : show
                          ? "md:top-[58px] md:translate-y-0"
                          : "md:top-0 md:translate-y-0"
                      }`}
                  ><tr>
                      <th className="border border-gray-300 px-2 py-2 text-center md:w-[50px]">
                        <input
                          type="checkbox"
                          className="h-5 w-5 scale-80 cursor-pointer 
           accent-[#3170B7] 
           border-[#3170B7] 
           rounded"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAllVisible}
                        />
                      </th>

                      <th className="border border-gray-300 text-[#5F5F5F] font-normal px-3 py-2 text-left md:w-[170px]">
                        Product Code
                      </th>

                      {/* FLEX COLUMN */}
                      <th className="border border-gray-300 text-[#5F5F5F] font-normal px-3 py-2 text-left md:w-full">
                        Product Name
                      </th>

                      <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[90px]">
                        Unit
                      </th>

                      <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[160px]">
                        Unit Price (Ex GST)
                      </th>

                      <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[80px]">
                        QTY
                      </th>

                      <th className="border border-gray-300 px-3 py-2 text-[#5F5F5F] font-normal text-center md:w-[120px]">
                        Wishlist
                      </th>
                    </tr>
                  </thead>



                  <tbody className="">
                    {finalProducts.map((p, index) => (
                      <ProductRow
                        setCreateWishlistLoader={setCreateWishlistLoader}
                        createWishlistLoader={createWishlistLoader}
                        key={p.id}
                        index={index}
                        wishlistSelected={wishlistSelected}
                        product={p}
                        userWishlists={userWishlists}
                        quantity={quantities.get(p.id) ?? ""}
                        isSelected={!!selected[p.id]}
                        isInWishlist={wishlistProductIds.includes(p.id)}
                        isWishlistOpen={activeWishlistFor === p.id}      // dropdown only

                        loadingDetails={loadingDetails}
                        onQtyChange={handleQtyChange}
                        onToggleSelect={() => toggleSelect(p.id)}
                        onWishlistToggle={() =>
                          setActiveWishlistFor((prev) => (prev === p.id ? null : p.id))
                        }
                        wishlists={wishlists}
                        onWishlistSelect={handleSingleItemWishlist}   // 👈
                        customerId={customerId}
                        onCreateWishlist={handleCreateWishlist}
                        qtyRefs={qtyRefs}
                      />
                    ))}

                  </tbody>
                </table>

              </div></>)
            : (<>

              {wishlistSelectLoader ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center min-h-[50dvh] w-[400px] mx-auto justify-center text-center ">
                  <img
                    src="/images/logo/wishlist.svg"
                    alt="No Address"
                    className="w-40 h-40 object-contain mb-6 opacity-80"
                  />

                  <h2 className="text-lg font-semibold text-gray-800">
                    No products found in this wishlist. Please choose another wishlist.
                  </h2>


                </div>
              )}

            </>)
        }

      </div>

    </div>
  );
}
