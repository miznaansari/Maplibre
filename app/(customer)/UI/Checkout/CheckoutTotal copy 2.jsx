"use client";

import { useMemo, useRef, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/app/admin/context/ToastProvider";

const GST_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 250;
const SHIPPING_COST = 25;

export default function CheckoutTotal({ cartData = [] }) {
  const { showToast } = useToast();
  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const localOrderIdRef = useRef(null);
  const [poNumber, setPoNumber] = useState("");
  const [poLoading, setPoLoading] = useState(false);

  const { subTotal, gstAmount, shippingFee, totalPrice } = useMemo(() => {
    const subTotal = cartData.reduce((sum, item) => {
      const price =
        item.product.price ?? item.product.regular_price;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);

    const gstAmount = subTotal * GST_RATE;

    const shippingFee =
      shippingMethod === "delivery" && subTotal < FREE_SHIPPING_THRESHOLD
        ? SHIPPING_COST
        : 0;

    return {
      subTotal,
      gstAmount,
      shippingFee,
      totalPrice: subTotal + gstAmount + shippingFee,
    };
  }, [cartData, shippingMethod]);

  return (
    <>
      <div className="max-w-5xl rounded border border-gray-200 bg-white p-6 shadow-sm">
        <div className="w-full border-b border-gray-200">
          <h3 className="mb-2 text-lg font-semibold">Cart Totals</h3>
        </div>
        {/* Shipping Method */}
        <div className="mb-4 mt-2 space-y-2 text-sm">
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={shippingMethod === "delivery"}
                onChange={() => setShippingMethod("delivery")}
              />
              Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={shippingMethod === "pickup"}
                onChange={() => setShippingMethod("pickup")}
              />
              Pickup from store
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Free Freight on Orders over $250 Excluding GST
          </p>
        </div>
        <hr className="my-3 border-dashed border-gray-300" />

        {/* Totals */}
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>${shippingFee.toFixed(2)}</span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Sub Total</span>
          <span>${subTotal.toFixed(2)}</span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>GST (estimated for Australia)</span>
          <span>${gstAmount.toFixed(2)}</span>
        </div>

        <hr className="my-3 border-dashed border-gray-300" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total Price</span>
          <span className="text-blue-600">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="max-w-5xl rounded border border-gray-200 bg-white p-6 shadow-sm mt-4">

        {/* Payment */}
        <div className="w-full border-b border-gray-200">
          <h3 className="mb-2 text-lg font-semibold">Payment</h3>
        </div>

        <div className="space-y-2 text-sm mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
            />
            Paypal
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "po"}
              onChange={() => setPaymentMethod("po")}
            />
            Purchase order
          </label>
        </div>

        {/* Terms */}
        <label className="mt-4 flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span>
            I have read and agree to the website{" "}
            <a href="#" className="text-blue-600 underline">
              terms and conditions
            </a>
          </span>
        </label>

        {/* PayPal */}
        {paymentMethod === "paypal" && (
          <div className={`mt-4 ${!agreeTerms ? "pointer-events-none opacity-50" : ""}`}>
            <PayPalButtons
              disabled={!agreeTerms}

              createOrder={async () => {
                try {
                  const shippingAddressId = Number(
                    localStorage.getItem("shipping_address_id")
                  );
                  const billingAddressId = Number(
                    localStorage.getItem("billing_address_id")
                  );

                  // ❌ Invalid address
                  if (
                    !Number.isInteger(shippingAddressId) || shippingAddressId <= 0 ||
                    !Number.isInteger(billingAddressId) || billingAddressId <= 0
                  ) {
                    showToast({
                      type: "error",
                      message: "Please select shipping and billing address",
                    });

                    throw new Error("Address missing");
                  }

                  const res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      shipping_address_id: shippingAddressId,
                      billing_address_id: billingAddressId,
                      delivery_method: shippingMethod === "delivery" ? 1 : 0,
                    }),
                  });

                  // ❌ BACKEND ERROR HANDLING (IMPORTANT)
                  if (!res.ok) {
                    const err = await res.json().catch(() => null);

                    showToast({
                      type: "error",
                      message:
                        err?.message ||
                        "Unable to create order. Please review your cart.",
                    });

                    throw new Error(err?.message || "Create order failed");
                  }

                  const data = await res.json();
                  localOrderIdRef.current = data.localOrderId;

                  return data.orderId;
                } catch (err) {
                  // Stop PayPal flow
                  console.error("PayPal createOrder error:", err);
                  throw err;
                }
              }}

              onApprove={async (data) => {
                try {
                  const res = await fetch("/api/paypal/capture-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderID: data.orderID,
                      localOrderId: localOrderIdRef.current,
                    }),
                  });

                  if (!res.ok) {
                    const err = await res.json().catch(() => null);

                    showToast({
                      type: "error",
                      message:
                        err?.message ||
                        "Payment failed. Amount was not captured.",
                    });

                    return;
                  }

                  window.location.href = `/order/${localOrderIdRef.current}?paypalOrderId=${data.orderID}`;
                } catch (err) {
                  console.error("PayPal onApprove error:", err);

                  showToast({
                    type: "error",
                    message: "Payment failed. Please try again.",
                  });
                }
              }}
            />


          </div>
        )}

        {/* Place Order */}
        {/* Purchase Order */}
        {paymentMethod === "po" && (
          <div className="mt-4 space-y-3">
            {/* PO NUMBER INPUT */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Purchase Order Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Enter PO number"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#347eb3] focus:outline-none"
              />
            </div>

            {/* PLACE ORDER */}
            <button
              disabled={!agreeTerms || !poNumber || poLoading}
              className={`w-full rounded py-3 text-sm font-medium text-white
        ${agreeTerms && poNumber
                  ? "bg-[#347eb3] hover:bg-sky-600"
                  : "bg-gray-300 cursor-not-allowed"
                }
      `}
              onClick={async () => {
                const shippingAddressId = Number(
                  localStorage.getItem("shipping_address_id")
                );
                const billingAddressId = Number(
                  localStorage.getItem("billing_address_id")
                );

                if (
                  !Number.isInteger(shippingAddressId) ||
                  shippingAddressId <= 0 ||
                  !Number.isInteger(billingAddressId) ||
                  billingAddressId <= 0
                ) {
                  showToast({
                    type: "error",
                    message: "Please select shipping and billing address",
                  });
                  return;
                }

                if (!poNumber.trim()) {
                  showToast({
                    type: "error",
                    message: "Please enter purchase order number",
                  });
                  return;
                }

                try {
                  setPoLoading(true);

                  const res = await fetch("/api/purchase-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      order_number: poNumber,
                      shipping_address_id: shippingAddressId,
                      billing_address_id: billingAddressId,
                      delivery_method: shippingMethod === "delivery" ? 1 : 0,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    throw new Error(data?.message || "Failed to place order");
                  }

                  showToast({
                    type: "success",
                    message: "Purchase order placed successfully",
                  });

                  // redirect to order page
                  window.location.href = `/order/${data.localOrderId}`;
                } catch (err) {
                  showToast({
                    type: "error",
                    message: err.message || "Something went wrong",
                  });
                } finally {
                  setPoLoading(false);
                }
              }}
            >
              {poLoading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        )}


        {/* Request Quote */}
        {/* <button className="mt-3 w-full rounded border border-[#347eb3] py-3 text-sm font-medium text-[#347eb3] hover:bg-sky-50">
        Request a Quote
      </button> */}
      </div>
    </>
  );
}
