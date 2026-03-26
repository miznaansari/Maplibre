import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    console.log("🔹 Forgot password API called");

    const { email } = await req.json();
    console.log("📩 Email received:", email);

    const user = await prisma.customer_list.findUnique({
      where: { email },
    });

    console.log("👤 User lookup result:", user ? "FOUND" : "NOT FOUND");

    if (!user) {
      console.log("⚠️ No user found for email:", email);
      return NextResponse.json(
        { message: "If account exists, reset email sent" },
        { status: 200 }
      );
    }

    // create reset token
    const token = crypto.randomBytes(32).toString("hex");
    console.log("🔑 Generated token:", token);

    const expiry = new Date(Date.now() + 1000 * 60 * 30);
    console.log("⏳ Token expiry:", expiry);

    await prisma.customer_session.create({
      data: {
        token,
        customer_list_id: user.id,
        token_expiry: expiry,
      },
    });

    console.log("💾 Token saved to DB for user:", user.id);

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;
    console.log("🔗 Reset link:", resetLink);

    const fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

    console.log("👤 Full name used in email:", fullName);

    console.log("📡 Sending email via Listmonk...");
    console.log("Listmonk URL:", process.env.LISTMONK_URL);
    console.log("Template ID:", 5);

    const response = await fetch(`${process.env.LISTMONK_URL}/api/tx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.LISTMONK_USER}:${process.env.LISTMONK_TOKEN}`
          ).toString("base64"),
      },
      body: JSON.stringify({
        subscriber_mode: "external",
        subscriber_emails: [email],
        template_id: 5,
        data: {
          name: fullName,
          reset_link: resetLink,
        },
      }),
    });

    const result = await response.text();

    console.log("📨 Listmonk response status:", response.status);
    console.log("📨 Listmonk response body:", result);

    return NextResponse.json({
      message: "If account exists, reset email sent",
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

