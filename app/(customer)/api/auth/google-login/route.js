import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { name, email, uid } = await req.json();

    /* ================= VALIDATION ================= */
    if (!email) {
      return NextResponse.json(
        { message: "Email required" },
        { status: 400 }
      );
    }

    /* ================= FIND CUSTOMER ================= */
    let customer = await prisma.customer_list.findUnique({
      where: { email },
    });

    /* ================= CREATE CUSTOMER IF NOT EXISTS ================= */
    if (!customer) {

      // Generate random password
      const randomPassword = crypto.randomBytes(16).toString("hex");

      // Hash password
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      customer = await prisma.customer_list.create({
        data: {
          email,
          first_name: name || "Google User",
          password: hashedPassword,
          google_uid: uid,
          is_active: true,
        },
      });

    } else {

      /* ================= GOOGLE UID CHECK ================= */

      if (customer.google_uid && customer.google_uid !== uid) {
        return NextResponse.json(
          { message: "Google account mismatch" },
          { status: 403 }
        );
      }

      /* ================= LINK GOOGLE ACCOUNT ================= */

      if (!customer.google_uid) {
        customer = await prisma.customer_list.update({
          where: { id: customer.id },
          data: { google_uid: uid },
        });
      }

    }

    /* ================= BLOCKED USER CHECK ================= */

    if (customer.is_blocked) {
      return NextResponse.json(
        { message: "Your account has been blocked. Please contact support." },
        { status: 403 }
      );
    }

    /* ================= INACTIVE USER CHECK ================= */

    if (!customer.is_active) {
      return NextResponse.json(
        { message: "Your account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    /* ================= CREATE JWT ================= */

    const token = signToken({
      id: customer.id,
      customer_group_id: customer.customer_group_id,
      email: customer.email,
      role: "customer",
    });

    const tokenExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    /* ================= SAVE SESSION ================= */

    await prisma.customer_session.create({
      data: {
        customer_list_id: customer.id,
        token,
        token_expiry: tokenExpiry,
        is_expired: false,
      },
    });

    /* ================= RESPONSE ================= */

    const response = NextResponse.json({
      message: "Google login successful",
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.first_name,
      },
    });

    // response.cookies.set("authToken", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   path: "/",
    //   maxAge: 60 * 60 * 24 * 30,
    // });
    response.cookies.set("authToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
});

    return response;

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}