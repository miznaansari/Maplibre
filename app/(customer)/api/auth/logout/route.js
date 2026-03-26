import { NextResponse } from "next/server";

export async function GET(request) {
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") || "";

  console.log("redirectTo123", redirectTo);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theclevar.com";

  const loginUrl = new URL("/auth/login", baseUrl);
  loginUrl.searchParams.set("redirect", redirectTo);

  const res = NextResponse.redirect(loginUrl);

  res.cookies.delete("authToken");
  res.cookies.delete("customer");

  return res;
}

export async function POST(request) {
  const loginUrl = new URL("/", request.url);

  const res = NextResponse.redirect(loginUrl, 303); // 👈 FORCE GET

  res.cookies.delete("authToken");
  res.cookies.delete("customer");

  return res;
}