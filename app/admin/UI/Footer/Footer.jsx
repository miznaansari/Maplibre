"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            {/* TOP FOOTER */}
            <div className="relative mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-12 md:grid-cols-5">

                    {/* LOGO + TEXT */}
                    <div className="md:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <Image
                                src="/images/page/footer.png"
                                alt="Samad Agency"
                                width={180}
                                height={40}
                            />
                        </div>

                        <p className="max-w-md text-sm text-gray-300 leading-relaxed">
                            We pride ourselves on providing high quality products at competitive
                            prices without losing sight of our clients individual needs
                        </p>
                    </div>

                    {/* CATEGORIES */}
                    <div>
                        <h4 className="mb-4 font-semibold">Categories</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="#">Consumables</Link></li>
                            <li><Link href="#">Labels</Link></li>
                            <li><Link href="#">RF</Link></li>
                            <li><Link href="#">Electrical</Link></li>
                            <li><Link href="#">Cable Support</Link></li>
                        </ul>
                    </div>

                    {/* INFORMATION */}
                    <div>
                        <h4 className="mb-4 font-semibold">Information</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/contact-us">Contact Us</Link></li>
                            <li><Link href="/about-us">About Us</Link></li>
                            <li><Link href="/my-account">My Account</Link></li>
                            <li><Link href="/orders">Orders</Link></li>
                        </ul>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h4 className="mb-4 font-semibold">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="#">Cable Ties</Link></li>
                            <li><Link href="#">Comms Cable</Link></li>
                            <li><Link href="#">Circuit Breakers</Link></li>
                            <li><Link href="#">Cable Accessories</Link></li>
                            <li><Link href="#">Tools</Link></li>
                        </ul>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <h4 className="mb-4 font-semibold">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li>
                                20 Steel St, Blacktown,<br />
                                NSW, 2148
                            </li>
                            <li>
                                <a href="mailto:sales@samad-agency.com">
                                    sales@samad-agency.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:0286252702">02 8625 2702</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* SCROLL TO TOP */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
                >
                    ↑
                </button>
            </div>

            {/* BOTTOM BAR */}
            <div className="bg-[#f6fbfd] text-black">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-sm">
                    <p>
                        Copyright © 2025{" "}
                        <span className="font-semibold">Samad Agency</span>. All Rights Reserved
                    </p>

                    <Image
                        src="/images/razorpay1.png"
                        alt="PayPal"
                        width={80}
                        height={20}
                    />
                </div>
            </div>
        </footer>
    );
}
