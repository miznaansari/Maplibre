import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant_detail_v2.findMany();


const cafes = restaurants
  .map((item) => {
    const lat = item.latitude ? parseFloat(item.latitude) : null;
    const lng = item.longitude ? parseFloat(item.longitude) : null;

    if (!lat || !lng) return null; // 🚀 skip invalid

    const image = item.gallery
      ? item.gallery.match(/https?:\/\/[^\s]+/)?.[0]
      : null;

    return {
      id: item.id.toString(),
      name: item.title,
      image,
      lat,
      lng,
      createdAt: item.created_at,
    };
  })
  .filter(Boolean); // 🚀 remove nulls

    return NextResponse.json({ cafes });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}