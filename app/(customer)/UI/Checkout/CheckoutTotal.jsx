"use client";

import { useMemo, useRef, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/app/admin/context/ToastProvider";

const GST_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 250;
const SHIPPING_COST = 25;

/* Razorpay loader */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutTotal({ cartData = [] }) {
  const { showToast } = useToast();

  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [poNumber, setPoNumber] = useState("");
  const [poLoading, setPoLoading] = useState(false);
  const [rzpLoading, setRzpLoading] = useState(false);

  const localOrderIdRef = useRef(null);

  const { subTotal, gstAmount, shippingFee, totalPrice } = useMemo(() => {
    const subTotal = cartData.reduce((sum, item) => {
      const price =
        item.product.price ?? item.product.regular_price;
      return sum + price * (item.quantity || 1);
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

  /* =========================
     RAZORPAY
  ========================= */
  const handleRazorpayPayment = async () => {
    if (!agreeTerms) {
      showToast({ type: "error", message: "Please agree to terms" });
      return;
    }

    const shippingAddressId = Number(localStorage.getItem("shipping_address_id"));
    const billingAddressId = Number(localStorage.getItem("billing_address_id"));

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

    setRzpLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToast({ type: "error", message: "Razorpay SDK failed" });
      setRzpLoading(false);
      return;
    }

    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        delivery_method: shippingMethod === "delivery" ? 1 : 0,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast({ type: "error", message: "Failed to create order" });
      setRzpLoading(false);
      return;
    }

    localOrderIdRef.current = data.localOrderId;

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            localOrderId: localOrderIdRef.current,
          }),
        });

        window.location.href = `/order/${localOrderIdRef.current}`;
      },
      theme: { color: "#0ea5e9" },
    };

    new window.Razorpay(options).open();
    setRzpLoading(false);
  };

  return (
    <>
      {/* CART TOTALS */}
      <div className="max-w-5xl rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg text-gray-200">
        <h3 className="mb-2 text-lg font-semibold text-white">Cart Totals</h3>

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>₹{shippingFee.toFixed(2)}</span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Sub Total</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>GST</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-lg font-semibold mt-3">
          <span>Total Price</span>
          <span className="text-sky-400">₹{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="max-w-5xl mt-6">

  {/* CARD */}
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.4)] text-gray-200">

    <h3 className="text-xl font-semibold text-white mb-4">
      Payment Method
    </h3>

    {/* PAYMENT OPTIONS */}
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">

      {/* RAZORPAY */}
      <button
        onClick={() => setPaymentMethod("razorpay")}
        className={`p-4 rounded-xl border cursor-pointer transition-all text-left
        ${
          paymentMethod === "razorpay"
            ? "border-[#347eb3] bg-[#347eb3]/10 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
            : "border-white/10 hover:border-sky-400/40"
        }`}
      >
        <p className="font-medium text-white">Razorpay</p>
        <p className="text-xs text-gray-400">UPI • Cards • Net Banking</p>
      </button>

      {/* PURCHASE ORDER */}
      {/* <button
        onClick={() => setPaymentMethod("po")}
        className={`p-4 rounded-xl border cursor-pointer transition-all text-left
        ${
          paymentMethod === "po"
            ? "border-[#347eb3] bg-[#347eb3]/10 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
            : "border-white/10 hover:border-sky-400/40"
        }`}
      >
        <p className="font-medium text-white">Purchase Order</p>
        <p className="text-xs text-gray-400">Manual approval flow</p>
      </button> */}
    </div>

    {/* TERMS */}
    <label className="mt-5 flex items-start gap-3 cursor-pointer group">
      <div
        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all
        ${
          agreeTerms
            ? "bg-[#347eb3] border-[#347eb3]"
            : "border-white/20 group-hover:border-sky-400"
        }`}
      >
        {agreeTerms && (
          <span className="text-xs text-white">✓</span>
        )}
      </div>

      <input
        type="checkbox"
        checked={agreeTerms}
        onChange={(e) => setAgreeTerms(e.target.checked)}
        className="hidden"
      />

      <span className="text-xs text-gray-400 group-hover:text-gray-300">
        I agree to <span className="text-sky-400">terms & conditions</span>
      </span>
    </label>

    {/* ACTION AREA */}
    <div className="mt-6">

      {/* RAZORPAY */}
      {paymentMethod === "razorpay" && (
        <button
          onClick={handleRazorpayPayment}
          disabled={!agreeTerms || rzpLoading}
          className="w-full rounded-xl py-3 text-white font-medium
          bg-gradient-to-r from-[#347eb3] to-blue-600
          shadow-[0_0_20px_rgba(14,165,233,0.5)]
          hover:scale-[1.02] active:scale-[0.98]
          transition-all disabled:opacity-50"
        >
          {rzpLoading ? "Processing..." : "Pay Securely"}
        </button>
      )}

      {/* PURCHASE ORDER */}
      {paymentMethod === "po" && (
        <div className="space-y-3">

          <input
            type="text"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            placeholder="Enter PO number"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm
            focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
          />

          <button
            disabled={!agreeTerms || !poNumber || poLoading}
            className="w-full rounded-xl py-3 text-white font-medium
            bg-gradient-to-r from-[#347eb3] to-blue-600
            shadow-[0_0_20px_rgba(14,165,233,0.5)]
            hover:scale-[1.02] active:scale-[0.98]
            transition-all disabled:opacity-50"
          >
            {poLoading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      )}

      {/* PAYPAL */}
      {paymentMethod === "paypal" && agreeTerms && (
        <div className="mt-4 rounded-xl border border-white/10 p-3 bg-white/5">
          <PayPalButtons />
        </div>
      )}

    </div>
  </div>
</div>
          </>
  );
}
