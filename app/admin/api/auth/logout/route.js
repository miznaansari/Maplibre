import { NextResponse } from "next/server";

export async function GET(request) {
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") || "/shop";

  console.log("redirectTo", redirectTo);

  const loginUrl = new URL("/admin", request.url);
  loginUrl.searchParams.set("redirect", redirectTo);

  const res = NextResponse.redirect(loginUrl);

  res.cookies.delete("adminToken");

  return res;
}
