import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    const session = await prisma.customer_session.findFirst({
      where: {
        token,
        is_expired: false,
        token_expiry: {
          gte: new Date(),
        },
      },
      include: {
        customer: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Update password
    await prisma.customer_list.update({
      where: { id: session.customer_list_id },
      data: {
        password: hashedPassword,
        last_password_updated_at: new Date(),
      },
    });

    // ✅ Expire token
    await prisma.customer_session.update({
      where: { id: session.id },
      data: {
        is_expired: true,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}