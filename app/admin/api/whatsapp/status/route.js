import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    console.log('adminadmin')
  const status = await prisma.whatsAppSession.findUnique({
    where: { id: 1 },
  });

  return NextResponse.json(status);
}