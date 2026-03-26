import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }
    /* ================= CHECK STATUS ================= */


    /* ================= FIND ADMIN ================= */
    const admin = await prisma.admins.findUnique({
      where: { email },
    });

    if (!admin || !admin.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
        if (admin.status === false) {
  return NextResponse.json(
    { message: "Your account is inactive. Please contact admin." },
    { status: 403 }
  );
}


    /* ================= VERIFY PASSWORD ================= */
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= CREATE JWT ================= */
    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: "admin",
    });

    const tokenExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    /* ================= SAVE SESSION ================= */
    await prisma.admin_session.create({
      data: {
        admin_id: admin.id,
        token,
        token_expiry: tokenExpiry,
        is_expired: false,
      },
    });

    /* ================= RESPONSE ================= */
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 200 }
    );

    /* ================= SET HTTP-ONLY COOKIE ================= */
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
