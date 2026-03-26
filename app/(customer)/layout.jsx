import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import "../../node_modules/react-image-gallery/styles/image-gallery.css";
import TopNavbar from "./customer/components/Navbar/TopNavbar";
import BNavbar from "./customer/components/Navbar/BNavbar";
import Footer from "./customer/components/Footer/Footer";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "../admin/context/ToastProvider";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../component/CartDrawer";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import TopNavbarClient from "./customer/components/Navbar/TopNavbarClient";
import { requireUser } from "@/lib/requireUser";
import { clientFetch } from "@/lib/clientFetch";
import ClarityInit from "@/lib/ClarityInit";

/* =========================
   FONTS
========================= */

// ✅ PRIMARY UI FONT
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ✅ OPTIONAL (if used anywhere)
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/* =========================
   METADATA
========================= */
export const metadata = {
  metadataBase: new URL("https://your-domain.com"),

  title: {
    default: "Find Cafes & Restaurants Near You | MyEats",
    template: "%s | MyEats",
  },

  description:
    "MyEats by MyEats Pvt Ltd helps you discover the best cafes and restaurants near you using an interactive MapLibre-powered map. Explore menus, locations, and get directions instantly.",

  keywords: [
    "MyEats",
    "cafes near me",
    "restaurants near me",
    "best cafe nearby",
    "food places near me",
    "coffee shop near me",
    "restaurant finder india",
    "MyEats map app",
  ],

  applicationName: "MyEats",

  authors: [{ name: "MyEats Pvt Ltd" }],
  creator: "MyEats Pvt Ltd",

  openGraph: {
    title: "Find Cafes & Restaurants Near You | MyEats",
    description:
      "Discover top-rated cafes and restaurants near your location with MyEats interactive map.",
    url: "https://your-domain.com",
    siteName: "MyEats",
    locale: "en_IN",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },

  // 🌍 GEO TAGS
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "26.4499;80.3319",
    ICBM: "26.4499, 80.3319",
  },
};
/* =========================
   ROOT LAYOUT
========================= */

  let category = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/first-categories`, {
      cache: "no-store",
    });

    // Check if response is okay before parsing JSON
    if (res.ok) {
      category = await res.json();
    } else {
      console.error("Failed to fetch categories:", res.status);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

export default async function RootLayout({ children }) {

  const isLoggedIn = await requireUser();
console.log('isLoggedInisLoggedIn',isLoggedIn)
  return (
    <html lang="en" className="mobile_mode">
      <body
        className={`
          ${poppins.className}
          ${inter.className}
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased 
        `}
      >
        <CartProvider isLoggedIn={isLoggedIn}>
  <ClarityInit />
          <ToastProvider>
            <CartDrawer isLoggedIn={isLoggedIn} />
            <NextTopLoader showSpinner={false} />
            <div className="">
              {children}</div>
          </ToastProvider>

          <Footer category={category} />
        </CartProvider>
      </body>
    </html>
  );
}
