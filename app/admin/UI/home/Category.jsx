import Image from "next/image";
import Link from "next/link";

const categories = [
    {
        title: "Nuts & Bolts",
        image: "/images/product/bolt.png",
        href: "/category/nuts-bolts",
    },
    {
        title: "Heat Shrink Tubing",
        image: "/images/categories/heat-shrink.png",
        href: "/category/heat-shrink-tubing",
    },
    {
        title: "Conduits and Fittings",
        image: "/images/categories/conduits.png",
        href: "/category/conduits-and-fittings",
    },
    {
        title: "RF Jumpers",
        image: "/images/categories/rf-jumpers.png",
        href: "/category/rf-jumpers",
    },
    {
        title: "Comm Cables",
        image: "/images/categories/comm-cables.png",
        href: "/category/comm-cables",
    },
    {
        title: "Green / Yellow Earth Cable - Rigid",
        image: "/images/categories/earth-cable.png",
        href: "/category/earth-cable-rigid",
    },
];

export default function Category() {
    return (
        <section className="w-full bg-[#f6fbfd] py-10">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="group relative flex items-center justify-between rounded bg-[#e9f7fb] p-6 transition hover:shadow-lg"
                        >
                            {/* LEFT CONTENT */}
                            <h3 className="text-base font-semibold font-bold text-gray-900 max-w-[70%]">
                                {item.title}
                            </h3>

                            {/* RIGHT IMAGE */}
                            <div className="relative h-30 w-30 shrink-0 mr-10">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            {/* ARROW BUTTON */}
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition group-hover:bg-gray-800">
                                →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
