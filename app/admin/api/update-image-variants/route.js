import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { imageId, urls } = await req.json();

  await prisma.product_images.update({
    where: { id: imageId },
    data: {
      ...urls,
      is_variant: true,
    },
  });

  return NextResponse.json({ success: true });
}
