// app/providers.jsx
"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function Providers({ children }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        components: "buttons",
        currency: "USD",
        intent: "capture",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
