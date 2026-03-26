import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // ❌ Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    // 🔍 Check if email already exists
    const existingUser = await prisma.customer_list.findFirst({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Email already registered" }),
        { status: 409 }
      );
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await prisma.customer_list.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // ✅ Success response
    return new Response(
      JSON.stringify({
        message: "Signup successful",
        user: {
          id: user.id,
          email: user.email,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
