import Image from "next/image";
import Link from "next/link";

const products = [
    {
        title: "Marker Tag 316SS 10 x 89mm – fibre etched",
        image: "/images/product/Marker.png",
        price: "1.20",
        href: "/product/marker-tag-316ss",
    },
    {
        title: "Tinned Copper Grounding Bar Assembly 127mm Max Diameter",
        image: "/images/product/tinner.jpg",
        price: "45.60",
        href: "/product/tinned-copper-grounding-bar",
    },
    {
        title: "Stainless Steel Cable Tie 7.9 x 360mm – 316 (Pack of 100)",
        image: "/images/products/product3.png",
        price: "31.90",
        href: "/product/ss-cable-tie",
    },
    {
        title: "DC Cable (Twin) – Red/Blue 16mm",
        image: "/images/products/product4.png",
        price: "9.60",
        href: "/product/dc-cable-twin",
    },
];

export default function BestSellingProducts() {
    return (
        <section className="bg-[#f6fbfd] py-14">
            <div className="mx-auto max-w-7xl px-6">
                {/* HEADING */}
                <h2 className="mb-10 text-center text-3xl font-extrabold text-black">
                    Best Selling Products
                </h2>

                {/* GRID */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="rounded bg-white  shadow-sm transition hover:shadow-md"
                        >
                            {/* IMAGE */}
                            <Link href={product.href} className="block">
                                <div className="relative mb-4 h-72 w-full">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className="object-contain"
                                        priority={index === 0}
                                    />
                                </div>
                            </Link>
                            <div className="p-4">
                                {/* TITLE */}
                                <h3 className="mb-4 min-h-[48px] text-sm font-medium text-gray-800">
                                    {product.title}
                                </h3>

                                {/* PRICE + BUTTON */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold text-[#0071ce]">
                                            ${product.price}
                                        </p>
                                        <p className="text-xs text-gray-500">ex. GST</p>
                                    </div>

                                    <button className="rounded bg-[#0071ce] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005fa8]">
                                        Add to cart
                                    </button>
                                </div>
                            </div></div>
                    ))}
                </div>
            </div>
        </section>
    );
}
