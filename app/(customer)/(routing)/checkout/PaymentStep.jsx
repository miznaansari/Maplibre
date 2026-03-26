"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/admin/context/ToastProvider";

/* ===============================
   LOAD RAZORPAY SCRIPT
================================ */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PaymentStep() {
  const router = useRouter();
  const { showToast } = useToast();

  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const localOrderIdRef = useRef(null);

  /* ===============================
     RAZORPAY PAYMENT
  ================================ */
  const handleRazorpayPayment = async () => {
    try {
      const shippingAddressId = Number(
        localStorage.getItem("shipping_address_id")
      );
      const billingAddressId = Number(
        localStorage.getItem("billing_address_id")
      );

      if (!shippingAddressId || !billingAddressId) {
        showToast({
          type: "error",
          message: "Please select shipping and billing address",
        });
        return;
      }

      setLoading(true);

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        showToast({
          type: "error",
          message: "Failed to load Razorpay SDK",
        });
        setLoading(false);
        return;
      }

      /* CREATE ORDER */
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      localOrderIdRef.current = data.localOrderId;

      /* RAZORPAY OPTIONS */
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,

        name: "Samad Agency",
        description: "Order Payment",

        handler: async function (response) {
          await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...response,
              localOrderId: localOrderIdRef.current,
            }),
          });

          router.push(`/verify-order/${localOrderIdRef.current}`);
        },

        theme: {
          color: "#06b6d4",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showToast({
        type: "error",
        message: "Payment failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     CASH ON DELIVERY
  ================================ */
  const handleCODOrder = async () => {
    try {
      const shippingAddressId = Number(
        localStorage.getItem("shipping_address_id")
      );
      const billingAddressId = Number(
        localStorage.getItem("billing_address_id")
      );

      if (!shippingAddressId || !billingAddressId) {
        showToast({
          type: "error",
          message: "Please select shipping and billing address",
        });
        return;
      }

      setLoading(true);

      const res = await fetch("/api/order/create-cod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Order creation failed");
      }

      showToast({
        type: "success",
        message: "Order placed successfully",
      });

      /* REDIRECT TO ORDER PAGE */
      router.push(`/order/${data.orderId}`);
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to place order",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     BUTTON CLICK
  ================================ */
  const handlePlaceOrder = () => {
    if (method === "razorpay") {
      handleRazorpayPayment();
    }

    if (method === "cod") {
      handleCODOrder();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* TITLE */}
      <h2 className="text-lg font-semibold mb-6 text-black">
        SELECT PAYMENT METHOD
      </h2>

      {/* OPTIONS */}
      <div className="space-y-4">

        {/* RAZORPAY */}
        {/* Enable when ready */}
        {/*
        <label
          className={`flex justify-between border rounded-xl p-4 cursor-pointer transition
          ${
            method === "razorpay"
              ? "border-[#347eb3] bg-[#347eb3]/10"
              : "border-gray-200 hover:border-[#347eb3]/40"
          }`}
        >
          <div>
            <p className="font-semibold text-black">
              Razorpay
            </p>

            <p className="text-xs text-gray-500">
              UPI • Cards • Wallets • Net Banking
            </p>
          </div>

          <input
            type="radio"
            checked={method === "razorpay"}
            onChange={() => setMethod("razorpay")}
          />
        </label>
        */}

        {/* COD */}
        <label
          className={`flex justify-between border rounded-xl p-4 cursor-pointer transition
          ${
            method === "cod"
              ? "border-[#347eb3] bg-[#347eb3]/10"
              : "border-gray-200 hover:border-[#347eb3]/40"
          }`}
        >
          <div>
            <p className="font-semibold text-black">
              Cash on Delivery
            </p>

            <p className="text-xs text-gray-500">
              Pay when you receive
            </p>
          </div>

          <input
            type="radio"
            checked={method === "cod"}
            onChange={() => setMethod("cod")}
          />
        </label>
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full mt-6 bg-[#347eb3] hover:bg-[#0284c7] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "PLACE ORDER"}
      </button>
    </div>
  );
}