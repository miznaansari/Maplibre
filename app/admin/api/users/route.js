import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST() {
  try {
    console.log('hitting')
    const users = await prisma.User.findMany({
      include: {
        addresses: true, // 👈 include address data
         posts: true     // ✅ THIS EXISTS
      },
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}