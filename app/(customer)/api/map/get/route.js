import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ⚡ FAST image extractor (no heavy JSON try-catch loops)
function getImage(gallery) {
  if (!gallery) return null;

  const firstChar = gallery[0];

  if (firstChar === "[") {
    try {
      const parsed = JSON.parse(gallery);
      return parsed?.[0] || null;
    } catch {
      return null;
    }
  }

  const commaIndex = gallery.indexOf(",");
  return commaIndex === -1 ? gallery : gallery.slice(0, commaIndex);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const north = Number(searchParams.get("north"));
    const south = Number(searchParams.get("south"));
    const east = Number(searchParams.get("east"));
    const west = Number(searchParams.get("west"));
    const zoom = Number(searchParams.get("zoom") || 10);

    // ❌ invalid input guard
    if ([north, south, east, west].some(Number.isNaN)) {
      return NextResponse.json({ cafes: [] });
    }

    // 🎯 dynamic limit (tuned for maps)
    let take = 1200;
    if (zoom >= 15) take = 150;
    else if (zoom >= 13) take = 300;
    else if (zoom >= 11) take = 700;

    // 🚀 Prisma query (index-friendly)
    const restaurants = await prisma.restaurant_detail_v2.findMany({
      where: {
        latitude: {
          gte: south,
          lte: north,
        },
        longitude: {
          gte: west,
          lte: east,
        },
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        gallery: true,
      },
      take,
    });

    // ⚡ super fast mapping
    const len = restaurants.length;
    const cafes = new Array(len);

    for (let i = 0; i < len; i++) {
      const item = restaurants[i];

      cafes[i] = {
        id: String(item.id),
        name: item.title,
        image: getImage(item.gallery),
        lat: item.latitude,
        lng: item.longitude,
      };
    }

    return NextResponse.json(
      { cafes },
      {
        headers: {
          // 🔥 caching improves map performance A LOT
          "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    console.error("Map API Error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}