"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Do you deliver across Pan India?",
    answer:
      "Yes! We deliver across Pan India with safe, reliable, and trackable shipping. Delivery timelines may vary depending on your location.",
  },
  {
    question: "What if I can’t find a product on your website?",
    answer:
      "No worries — you can contact our support team, and we’ll do our best to source or custom-create the product for you based on your requirements.",
  },
  {
    question: "How long will my order take to arrive?",
    answer:
      "Orders are usually dispatched within 24–48 hours. Delivery time depends on your city and courier partner, but most orders arrive within a few business days.",
  },
  {
    question: "Do you offer bulk or custom pricing?",
    answer:
      "Yes! If you’re placing bulk orders or need custom-designed apparel, reach out to us for special pricing and tailored solutions.",
  },
  {
    question: "Can I customize my T-shirt or shirt?",
    answer:
      "Absolutely! You can customize designs, prints, and styles. We focus on premium quality and never compromise on fabric or finish.",
  },
  {
    question: "How can I place an order?",
    answer: (
      <div className="space-y-3">
        <p>You can place your order in the following ways:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Online</strong> – Choose your product and customize it directly
            on our website.
          </li>
          <li>
            <strong>Support</strong> – Contact our team for help with bulk or custom
            orders.
          </li>
        </ul>
      </div>
    ),
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-b from-[#0f0f0f] to-[#111827] py-16">
      <div className="mx-auto max-w-5xl px-6">

        {/* HEADING */}
        <h2 className="mb-10 text-4xl font-extrabold text-white">
          We know you are curious!
        </h2>

        <div className="divide-y divide-white/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-6">

                {/* QUESTION */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="
                    flex w-full items-center justify-between
                    text-left text-lg font-semibold
                    text-gray-200
                    hover:text-sky-400
                    transition-colors
                  "
                >
                  {faq.question}

                  <span
                    className={`text-2xl font-light transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 text-sky-400"
                        : "text-gray-400"
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* ANSWER */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
