// middleware.js (Node.js runtime)

import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { prisma } from "./lib/prisma";
import { cookies } from "next/headers";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] Request: ${pathname}`);

  const c = await cookies();

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // =====================================================
  // 1️⃣ ADMIN ROUTES
  // =====================================================

  if (pathname.startsWith("/admin")) {
    console.log("[Middleware] Admin route");

    if (pathname === "/admin") {
      return NextResponse.next();
    }

    const publicAdminAPIs = [
      "/admin/api/auth/login",
      "/admin/api/auth/register",
    ];

    if (publicAdminAPIs.includes(pathname)) {
      return NextResponse.next();
    }

    const token = c.get("adminToken")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    const adminSession = await prisma.admin_session.findFirst({
      where: {
        token,
        is_expired: false,
        token_expiry: { gt: new Date() },
      },
    });

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  }

  // =====================================================
  // 2️⃣ CUSTOMER AUTH ROUTES (/my-account)
  // =====================================================

  if (pathname.startsWith("/my-account")) {
    const isCustomerAPI = pathname.startsWith("/my-account/api");
    const token = c.get("authToken")?.value;

    if (!token) {
      if (isCustomerAPI) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.redirect(new URL("/api/auth/logout", req.url));
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (isCustomerAPI) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      return NextResponse.redirect(new URL("/api/auth/logout", req.url));
    }

    const session = await prisma.customer_session.findFirst({
      where: {
        customer_list_id: decoded.id,
        token,
        is_expired: false,
        token_expiry: { gt: new Date() },
      },
    });

    if (!session) {
      if (isCustomerAPI) {
        return NextResponse.json(
          { error: "Session expired or invalid" },
          { status: 401 }
        );
      }

      return NextResponse.redirect(new URL("/api/auth/logout", req.url));
    }

    // 📊 Log route
    await prisma.customer_route_logs.create({
      data: {
        customer_list_id: session.customer_list_id,
        path: pathname,
        method: req.method,
        user_agent: req.headers.get("user-agent"),
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.next();
  }

  // =====================================================
  // 3️⃣ PUBLIC ROUTES
  // =====================================================

  const token = c.get("authToken")?.value;

  if (token) {
    try {
      const decoded = verifyToken(token);

      const session = await prisma.customer_session.findFirst({
        where: {
          customer_list_id: decoded.id,
          token,
          is_expired: false,
          token_expiry: { gt: new Date() },
        },
      });

      if (session) {
        await prisma.customer_route_logs.create({
          data: {
            customer_list_id: session.customer_list_id,
            path: pathname,
            method: req.method,
            user_agent: req.headers.get("user-agent"),
            ip_address: req.headers.get("x-forwarded-for") || "unknown",
          },
        });
      }
    } catch (err) {
      console.log("[Middleware] Public route token invalid");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/my-account/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
  runtime: "nodejs",
};