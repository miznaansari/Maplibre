import Image from "next/image";

export default function WhatWeDo() {
  const items = [
    {
      title: "ELECTRIC COMPONENTS AND CONSUMABLES",
      icon: "/images/page/Group.svg",
    },
    {
      title: "DATA CABLING, CONNECTIONS AND INFRASTRUCTURE",
      icon: "/images/page/cable.svg",
    },
    {
      title: "FAST HIGH QUALITY LABEL PRINTING (3–4 HOUR NOTIFICATION)",
      icon: "/images/page/tag.svg",
    },
    {
      title: "CUSTOM CABLE ASSEMBLIES",
      icon: "/images/page/charging-cable.svg",
    },
    {
      title:
        "PROJECT SUPPLY SUPPORT FOR COMMERCIAL AND INDUSTRIAL CLIENTS",
      icon: "/images/page/support.svg",
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
          {items.slice(0, 3).map((item, index) => (
            <Card key={index} item={item} />
          ))}
        </div>

        {/* BOTTOM ROW */}
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

function Card({ item }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center rounded border border-gray-200 px-6 text-center bg-[#F8F8F8]">
      <div className="mb-4 flex h-12 w-12 items-center bg-white rounded-full p-2 justify-center">
        <Image
          src={item.icon}
          alt="icon"
          width={42}
          height={42}
          className="object-contain"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-black">
        {item.title}
      </p>
    </div>
  );
}
