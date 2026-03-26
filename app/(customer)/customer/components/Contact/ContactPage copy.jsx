"use client";

import Image from "next/image";
import ServiceHighlights from "../home/ServiceHighlights";
import { useActionState, useEffect, useState } from "react";
import { submitContact } from "./action";

const initialState = {
  success: false,
  errors: {},
  values: {},
};

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden py-10 bg-gradient-to-r from-[#0f0f0f] to-[#111827]">

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          
          <h1 className="text-4xl font-semibold text-white">
            Contact <span className="text-sky-400">Us</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-300">
            We pride ourselves on providing high quality products at competitive
            prices without losing sight of our clients individual needs
          </p>

        </div>
      </section>

      {/* ================= CONTENT ================= */}
    <section className="bg-gradient-to-b from-[#020617] via-[#0f0f0f] to-black py-12">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-10 lg:grid-cols-2">

            {/* LEFT COLUMN */}
         <div className="
  rounded-2xl 
  bg-gradient-to-br 
  from-[#111827] 
  via-[#0f172a] 
  to-[#020617]
  p-6
  shadow-[0_10px_40px_rgba(0,0,0,0.9)]
  border border-white/5
">


              <h2 className="mb-6 text-xl font-bold text-white">
                Our Address
              </h2>

              <ul className="mb-6 space-y-4 text-gray-300">

                <li>
                  <strong className="text-sky-400">Owner</strong><br />
                  Himanshi
                </li>

                <li>
                  <strong className="text-sky-400">Email</strong><br />
                  <a
                    href="mailto:info@samad-agency.com"
                    className="hover:text-sky-400"
                  >
                    info@samad-agency.com
                  </a>
                </li>

                <li>
                  <strong className="text-sky-400">Service Area</strong><br />
                  PAN India Delivery Available
                </li>

              </ul>

              {/* MAP */}
              <div className="h-64 w-full overflow-hidden rounded-xl border border-gray-800">
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps?q=India&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                />
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="rounded-2xl bg-[#111827] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">

              <form action={formAction} className="space-y-5">

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Full Name */}
                  <div>
                    <label className="text-sm text-gray-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="fullName"
                      required
                      defaultValue={state.values?.fullName || ""}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#347eb3]"
                    />

                    {state.errors?.fullName && (
                      <p className="mt-1 text-xs text-red-500">
                        {state.errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm text-gray-300">
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="email"
                      defaultValue={state.values?.email || ""}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#347eb3]"
                    />

                    {state.errors?.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {state.errors.email}
                      </p>
                    )}
                  </div>

                </div>

                {/* Company */}
                <div>
                  <label className="text-sm text-gray-300">
                    Company Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="companyName"
                    defaultValue={state.values?.companyName || ""}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#347eb3]"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm text-gray-300">
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="subject"
                    defaultValue={state.values?.subject || ""}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#347eb3]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm text-gray-300">
                    Your Message
                  </label>

                  <textarea
                    name="message"
                    rows="5"
                    defaultValue={state.values?.message || ""}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#347eb3]"
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-lg bg-[#347eb3] px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(14,165,233,0.6)] transition hover:bg-sky-400 disabled:opacity-60"
                >
                  {isPending ? "Sending..." : "Send Message →"}
                </button>

                {showSuccess && (
                  <p className="text-green-400">
                    Message sent successfully!
                  </p>
                )}

              </form>

            </div>

          </div>
        </div>
      </section>

   

      <ServiceHighlights />
    </>
  );
}
