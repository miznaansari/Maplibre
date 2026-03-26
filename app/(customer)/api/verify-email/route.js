import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token } = await req.json();

    const session = await prisma.customer_session.findFirst({
      where: {
        token,
        token_expiry: {
          gte: new Date(),
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    await prisma.customer_list.update({
      where: { id: session.customer_list_id },
      data: {
        email_verified: true,
      },
    });

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}