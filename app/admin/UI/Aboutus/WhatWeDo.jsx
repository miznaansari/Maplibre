export default function WhatWeDo() {
  const items = [
    {
      title: "ELECTRIC COMPONENTS AND CONSUMABLES",
      icon: (
        <path d="M13 3l-8 8h6l-1 10 8-8h-6l1-10z" />
      ),
    },
    {
      title: "DATA CABLING, CONNECTIONS AND INFRASTRUCTURE",
      icon: (
        <>
          <path d="M6 3v18" />
          <path d="M12 3v18" />
          <path d="M18 3v18" />
          <path d="M3 8h6" />
          <path d="M15 8h6" />
        </>
      ),
    },
    {
      title: "FAST HIGH QUALITY LABEL PRINTING (3–4 HOUR NOTIFICATION)",
      icon: (
        <rect x="5" y="7" width="14" height="10" rx="2" />
      ),
    },
    {
      title: "CUSTOM CABLE ASSEMBLIES",
      icon: (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
        </>
      ),
    },
    {
      title: "PROJECT SUPPLY SUPPORT FOR COMMERCIAL AND INDUSTRIAL CLIENTS",
      icon: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 00-14 0" />
        </>
      ),
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-black">What we Do</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            Samad Agency is one Stop shop for all things electrical and
            telecommunications. We offer a complete range of products and
            services including.
          </p>
        </div>

        {/* GRID */}
        <div className="grid gap-8 md:grid-cols-3">

          {/* TOP ROW (3) */}
          {items.slice(0, 3).map((item, index) => (
            <Card key={index} item={item} />
          ))}
        </div>

        {/* BOTTOM ROW (2 CENTERED) */}
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:justify-center">
          {items.slice(3).map((item, index) => (
            <div key={index} className="md:w-[32%]">
              <Card item={item} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ---------- CARD COMPONENT ---------- */
function Card({ item }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center rounded border border-gray-300 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-6 w-6 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {item.icon}
        </svg>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-black">
        {item.title}
      </p>
    </div>
  );
}
