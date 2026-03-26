"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

const GST_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 250;
const SHIPPING_COST = 15;

export default function CheckoutTotal({ cartData = [] }) {
  const [shippingMethod, setShippingMethod] = useState("delivery");

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
  const localOrderIdRef = useRef(null);
  return (
    <div className="w-full max-w-sm rounded border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Cart Totals</h3>

      {/* Totals UI (unchanged) */}
      <div className="flex justify-between text-sm">
        <span>Sub Total</span>
        <span>${subTotal.toFixed(2)}</span>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <span>Shipping</span>
        <span>
          {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
        </span>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <span>GST</span>
        <span>${gstAmount.toFixed(2)}</span>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span className="text-blue-600">
          ${totalPrice.toFixed(2)}
        </span>
      </div>

      {/* =========================
         PAYPAL BUTTON
      ========================= */}
      <div className="mt-5">

        <PayPalButtons
          createOrder={async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
            });
            const data = await res.json();
            localOrderIdRef.current = data.localOrderId;
            return data.orderId;
          }}
          onApprove={async (data) => {
            // ✅ CAPTURE PAYMENT
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, localOrderId: localOrderIdRef.current }),
            });

            const result = await res.json();

            if (!res.ok) {
              alert("Payment failed");
              return;
            }

            // ✅ Now webhook WILL fire
            window.location.href = `/order/${localOrderIdRef.current}?paypalOrderId=${data.orderID}`;
          }}
        />

        {/* </PayPalScriptProvider> */}
      </div>

      {/* Optional */}
      <button className="mt-3 w-full rounded border border-[#347eb3] py-3 text-sm font-medium text-[#347eb3] hover:bg-sky-50">
        Request Quote
      </button>
    </div>
  );
}
