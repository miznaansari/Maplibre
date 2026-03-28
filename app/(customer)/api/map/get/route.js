import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const north = parseFloat(searchParams.get("north"));
    const south = parseFloat(searchParams.get("south"));
    const east = parseFloat(searchParams.get("east"));
    const west = parseFloat(searchParams.get("west"));

    // ❌ invalid params
    if (
      isNaN(north) ||
      isNaN(south) ||
      isNaN(east) ||
      isNaN(west)
    ) {
      return NextResponse.json({ cafes: [] });
    }

    // 🚀 FILTER IN DATABASE (NOT JS)
    const restaurants = await prisma.$queryRaw`
      SELECT 
        id,
        title,
        latitude,
        longitude,
        gallery
      FROM restaurant_detail_v2
      WHERE 
        latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND CAST(latitude AS DECIMAL(10,6)) BETWEEN ${south} AND ${north}
        AND CAST(longitude AS DECIMAL(10,6)) BETWEEN ${west} AND ${east}
      LIMIT 2820
    `;

    const cafes = restaurants.map((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      const image = item.gallery
        ? item.gallery.match(/https?:\/\/[^\s,"]+/)?.[0]
        : null;

      return {
        id: item.id.toString(),
        name: item.title,
        image,
        lat,
        lng,
      };
    });

    return NextResponse.json({ cafes });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}