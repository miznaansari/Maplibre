import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./drawer.css";
import LeftSideBar from "./UI/Navbar/LeftSideBar";
import AdminLogin from "./UI/AdminLogin/AdminLogin";
import Providers from "./Providers";
import { ToastProvider } from "./context/ToastProvider";
import { SidebarProvider } from "./context/SidebarContext";
import ContentWrapper from "./ContentWrapper";
import { requireAdmin } from "@/lib/requireAdmin";
import NextTopLoader from "nextjs-toploader";
import ClarityInit from "@/lib/ClarityInit";
import "../../node_modules/react-image-gallery/styles/image-gallery.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Samad Agency Admin",
  description: "Admin Dashboard",
};

export default async function RootLayout({ children }) {
  const adminToken = await  requireAdmin();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <SidebarProvider>
            <div className="bg-gray-50">
              {/* LEFT SIDEBAR */}
              {/* {adminToken && <LeftSideBar />} */}
  <ClarityInit />
              {/* RIGHT CONTENT AREA */}
                <ToastProvider>
            <NextTopLoader showSpinner={false} />

                    <main className="flex-1 p-0">
                      {children}
                    </main>
            
                </ToastProvider>
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
