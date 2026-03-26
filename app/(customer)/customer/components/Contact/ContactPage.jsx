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
      {/* HERO */}
    <section className="py-14 bg-white border-b border-gray-200">

  <div className="mx-auto max-w-5xl px-6 text-center">

    {/* Title */}
    <h1 className="text-4xl font-semibold text-gray-900">
      Wholesale <span className="text-[#347eb3]">Mobile Accessories</span>
    </h1>

    {/* Description */}
    <p className="mx-auto mt-4 max-w-xl text-sm text-gray-600">
      Airpods, Chargers, Data Cables, Handsfree, Neckbands, Power Banks and
      many more accessories available at wholesale prices across India.
    </p>

    {/* Product Badges */}
    <div className="mt-6 flex flex-wrap justify-center gap-3">

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Airpods
      </span>

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Chargers
      </span>

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Data Cables
      </span>

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Handsfree
      </span>

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Neckband
      </span>

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Power Bank
      </span>

      <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm text-gray-700">
        Mix Items
      </span>

    </div>

  </div>

</section>


      {/* CONTENT */}
      <section className="bg-white py-14">

        <div className="mx-auto max-w-7xl px-2 md:px-6 ">

          <div className="grid gap-10 lg:grid-cols-2">

            {/* LEFT CARD */}
            <div className="
              rounded-xl
              bg-white
              p-6
              border border-gray-200
              shadow-sm
            ">

              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Our Address
              </h2>

              <ul className="mb-6 space-y-4 text-gray-700">

                <li>
                  <strong className="text-[#347eb3]">Owner</strong><br />
                  Samad Agency
                </li>

                <li>
                  <strong className="text-[#347eb3]">Email</strong><br />
                  <a
                    href="mailto:info@samad-agency.com"
                    className="hover:text-[#347eb3]"
                  >
                    info@samad-agency.com
                  </a>
                </li>

                <li>
                  <strong className="text-[#347eb3]">Service Area</strong><br />
                  PAN India Delivery Available
                </li>

              </ul>

              {/* MAP */}
              <div className="h-64 w-full overflow-hidden rounded-lg border border-gray-200">
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps?q=India&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                />
              </div>

            </div>

            {/* RIGHT CARD */}
            <div className="
              rounded-xl
              bg-white
              p-6
              border border-gray-200
              shadow-sm
            ">

              <form action={formAction} className="space-y-5">

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Full Name */}
                  <div>
                    <label className="text-sm text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="fullName"
                      required
                      defaultValue={state.values?.fullName || ""}
                      className="
                        mt-1 w-full rounded-lg
                        border border-gray-300
                        bg-white
                        px-3 py-2
                        text-gray-800
                        outline-none
                        focus:border-[#347eb3]
                        focus:ring-1 focus:ring-[#347eb3]
                      "
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="email"
                      defaultValue={state.values?.email || ""}
                      className="
                        mt-1 w-full rounded-lg
                        border border-gray-300
                        bg-white
                        px-3 py-2
                        text-gray-800
                        outline-none
                        focus:border-[#347eb3]
                        focus:ring-1 focus:ring-[#347eb3]
                      "
                    />
                  </div>

                </div>

                {/* Company */}
                <div>
                  <label className="text-sm text-gray-700">
                    Company Name
                  </label>

                  <input
                    name="companyName"
                    defaultValue={state.values?.companyName || ""}
                    className="
                      mt-1 w-full rounded-lg
                      border border-gray-300
                      bg-white
                      px-3 py-2
                      text-gray-800
                      outline-none
                      focus:border-[#347eb3]
                      focus:ring-1 focus:ring-[#347eb3]
                    "
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm text-gray-700">
                    Subject
                  </label>

                  <input
                    name="subject"
                    defaultValue={state.values?.subject || ""}
                    className="
                      mt-1 w-full rounded-lg
                      border border-gray-300
                      bg-white
                      px-3 py-2
                      text-gray-800
                      outline-none
                      focus:border-[#347eb3]
                      focus:ring-1 focus:ring-[#347eb3]
                    "
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm text-gray-700">
                    Your Message
                  </label>

                  <textarea
                    name="message"
                    rows="5"
                    defaultValue={state.values?.message || ""}
                    className="
                      mt-1 w-full rounded-lg
                      border border-gray-300
                      bg-white
                      px-3 py-2
                      text-gray-800
                      outline-none
                      focus:border-[#347eb3]
                      focus:ring-1 focus:ring-[#347eb3]
                    "
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="
                    w-full rounded-lg
                    bg-[#347eb3]
                    px-6 py-3
                    font-semibold text-white
                    transition
                    hover:bg-sky-600
                  "
                >
                  {isPending ? "Sending..." : "Send Message →"}
                </button>

              </form>

            </div>

          </div>
        </div>

      </section>

      <ServiceHighlights />
    </>
  );
}
