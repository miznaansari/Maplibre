import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.time("TOTAL_LOGIN_TIME");

  try {
    console.time("PARSE_BODY");
    const { email, password } = await req.json();
    console.timeEnd("PARSE_BODY");

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      console.timeEnd("TOTAL_LOGIN_TIME");
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    /* ================= FIND CUSTOMER ================= */
    console.time("DB_FIND_CUSTOMER");
    const customer = await prisma.customer_list.findUnique({
      where: { email },
    });
    console.timeEnd("DB_FIND_CUSTOMER");

    if (!customer || !customer.password) {
      console.timeEnd("TOTAL_LOGIN_TIME");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= BLOCKED USER CHECK ================= */
    if (customer.is_blocked === true) {
      console.timeEnd("TOTAL_LOGIN_TIME");
      return NextResponse.json(
        { message: "Your account has been blocked. Please contact support." },
        { status: 403 }
      );
    }

    /* ================= BLOCKED USER CHECK ================= */
    if (customer.is_active === false) {
      return NextResponse.json(
        { message: "Your account is inactive. Please contact support." },

        { status: 403 }
      );
    }

    /* ================= VERIFY PASSWORD ================= */
    console.time("BCRYPT_COMPARE");
    const isMatch = await bcrypt.compare(password, customer.password);
    console.timeEnd("BCRYPT_COMPARE");

    if (!isMatch) {
      console.timeEnd("TOTAL_LOGIN_TIME");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= CREATE JWT ================= */
    console.time("JWT_SIGN");
    const token = signToken({
      id: customer.id,
      customer_group_id: customer.customer_group_id,
      email: customer.email,
      role: "customer",
    });
    console.timeEnd("JWT_SIGN");

    const tokenExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    /* ================= SAVE SESSION ================= */
    console.time("DB_CREATE_SESSION");
    await prisma.customer_session.create({
      data: {
        customer_list_id: customer.id,
        token,
        token_expiry: tokenExpiry,
        is_expired: false,
      },
    });
    console.timeEnd("DB_CREATE_SESSION");

    /* ================= RESPONSE ================= */
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: customer.id,
          email: customer.email,
          name: customer.first_name,
        },
      },
      { status: 200 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    console.timeEnd("TOTAL_LOGIN_TIME");
    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    console.timeEnd("TOTAL_LOGIN_TIME");

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
