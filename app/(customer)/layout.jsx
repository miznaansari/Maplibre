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
  metadataBase: new URL("https://samad-agency.vercel.app"),

  title: {
    default: "Samad Agency | Wholesale Mobile Accessories Supplier",
    template: "%s | Samad Agency",
  },

  description:
    "Samad Agency is a trusted wholesale supplier of mobile accessories including Airpods, Chargers, Data Cables, Handsfree, Neckbands, and Power Banks. High-quality products with reliable delivery across India.",

  applicationName: "Samad Agency",

  keywords: [
    "Samad Agency",
    "Wholesale Mobile Accessories",
    "Airpods Wholesale",
    "Mobile Charger Wholesale",
    "Data Cable Supplier",
    "Handsfree Wholesale",
    "Neckband Wholesale",
    "Power Bank Supplier",
    "Mobile Accessories Distributor India",
  ],

  authors: [{ name: "Samad Agency" }],
  creator: "Samad Agency",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },

  openGraph: {
    title: "Samad Agency | Wholesale Mobile Accessories Supplier",
    description:
      "Buy high-quality mobile accessories wholesale including Airpods, Chargers, Data Cables, Handsfree, Neckbands, and Power Banks. Trusted supplier across India.",
    url: "https://samad-agency.vercel.app",
    siteName: "Samad Agency",
    locale: "en_IN",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
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
          <BNavbar isLoggedIn={isLoggedIn?.id ? true : false} />
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
