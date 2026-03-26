"use client";

import { useState } from "react";

import CheckoutSteps from "./CheckoutSteps";
import AddressStep from "./AddressStep";
import ReviewStep from "./ReviewStep";

import CheckoutTotal from "./CheckoutTotal";
import PaymentStep from "./PaymentStep";

export default function CheckoutFlow({ addresses, cartData }) {

  const [step, setStep] = useState(1);
return (
  <div className="min-h-screen max-w-6xl mx-auto bg-white text-black">

    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 hover:text-[#347eb3]"
        >
          ← BACK TO CART
        </button>

        <h1 className="text-xl font-semibold tracking-wide">
          SECURE CHECKOUT
        </h1>

        <div />
      </div>

      {/* STEPS */}
      <CheckoutSteps step={step} />

      {/* LAYOUT */}
      <div className="grid lg:grid-cols-1 gap-8 mt-8">

        {/* LEFT */}
        <div className="lg:col-span-2">
  {step === 1 && (
              <AddressStep
                addresses={addresses}
                onNext={() => setStep(2)}
              />
            )}
          {step === 2 && (
            <ReviewStep
              cartData={cartData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <PaymentStep
              onBack={() => setStep(2)}
            />
          )}

        </div>

        {/* RIGHT */}
        {/* <CheckoutTotal cartData={cartData} /> */}

      </div>

    </div>
  </div>
);
}