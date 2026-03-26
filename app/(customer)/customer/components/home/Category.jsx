import Image from "next/image";
import Link from "next/link";

const categories = [
    {
        title: "Nuts & Bolts",
        image: "/images/product/bolt.png",
        href: "/product-category/consumables/fittings-fasteners",
    },
    {
        title: "Heat Shrink Tubing",
        image: "/images/stick.png",
        href: "/product-category/consumables/fittings-fasteners",
    },
    {
        title: "Conduits and Fittings",
        image: "/images/page/home/Conduits.png",
        href: "/product-category/electrical/conduits-and-fittings",
    },
    {
        title: "RF Jumpers",
        image: "/images/page/home/Jumpers.png",
        href: "/product-category/rf/rf-cables/rf-jumpers-ls-brand",
    },
    {
        title: "Comm Cables",
        image: "/images/page/home/Comm.png",
        href: "/product-category/consumables/comms-cable",
    },
    {
        title: "Green / Yellow Earth Cable - Rigid",
        image: "/images/page/home/green.png",
        href: "/product-category/electrical/cables/green-yellow-earth-cable-multistrand",
    },
];

export default function CategoryGrid() {
    return (
        <section className="w-full py-10">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="group relative flex items-center justify-between rounded bg-[#e9f7fb] p-6 transition hover:shadow-xl"
                        >
                            {/* LEFT TEXT */}
                            <h3 className="text-base font-semibold text-gray-900 max-w-[65%]">
                                {item.title}
                            </h3>

                            {/* RIGHT IMAGE */}
                            <div className="relative h-24 w-24 mr-10 rounded shrink-0">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-contain rounded"
                                />
                            </div>

                            {/* ARROW */}
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition group-hover:bg-gray-800">
                                <Image
                                    src="/images/page/home/Vector.svg"
                                    alt="arrow"
                                    height={10}
                                    width={10}
                                    className="object-contain"
                                />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
