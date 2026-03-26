import Link from "next/link";

export default function LetsWorkTogether() {
  return (
    <section className="bg-[#00AEEF] py-16">
      <div className="mx-auto max-w-4xl px-6 text-center text-white">
        
        {/* HEADING */}
        <h2 className="text-2xl font-bold md:text-3xl">
          Let’s Work Together
        </h2>

        {/* SUBTEXT */}
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/90">
          Need a quote? Working on a project? Just have a few questions?
          <br />
          Get in touch today — we’re here to help you find the right products, fast.
        </p>

        {/* BUTTON */}
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded bg-white px-6 py-3 text-sm font-semibold text-[#00AEEF] transition hover:bg-gray-100"
        >
          Contact us →
        </Link>

      </div>
    </section>
  );
}
