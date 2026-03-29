import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔥 tile → bbox converter
function tileToBBOX(x, y, z) {
  // 🔢 Total number of tiles at this zoom level
  // Example: z=15 → 2^15 tiles in each direction
  const n = Math.pow(2, z);

  // 🌍 Convert tile X → longitude (left & right bounds)
  // x / n gives position in world (0 → 1)
  // multiply by 360 → full longitude range
  // subtract 180 → shift to [-180, +180]
  const lon_deg_min = (x / n) * 360 - 180;        // west
  const lon_deg_max = ((x + 1) / n) * 360 - 180;  // east

  // 🌍 Convert tile Y → latitude (top & bottom bounds)
  // Mercator projection is nonlinear, so we use sinh + atan

  // 🧮 Convert tile Y to latitude in radians
  const lat_rad_min = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * y) / n))
  );

  const lat_rad_max = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))
  );

  // 🔄 Convert radians → degrees
  const lat_deg_min = (lat_rad_max * 180) / Math.PI; // south
  const lat_deg_max = (lat_rad_min * 180) / Math.PI; // north

  // 📦 Return bounding box of this tile
  return {
    west: lon_deg_min,   // left longitude
    south: lat_deg_min,  // bottom latitude
    east: lon_deg_max,   // right longitude
    north: lat_deg_max,  // top latitude
  };
}

// ⚡ fast image extractor
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

// ✅ FINAL FIXED HANDLER
export async function GET(req, { params }) {
  try {
    // 🔥 THIS LINE FIXES YOUR ERROR
    const { z, x, y } = await params;

    const zoom = Number(z);
    const tileX = Number(x);
    const tileY = Number(y);

    if ([zoom, tileX, tileY].some(Number.isNaN)) {
      return NextResponse.json({ features: [] });
    }

    const bbox = tileToBBOX(tileX, tileY, zoom);

    let take = 300;
    if (zoom >= 15) take = 450;
    else if (zoom >= 13) take = 700;
    else if (zoom >= 11) take = 500;
    else if (zoom >= 9) take = 400;

    const restaurants = await prisma.restaurant_detail_v2.findMany({
      where: {
        latitude: {
          gte: bbox.south,
          lte: bbox.north,
        },
        longitude: {
          gte: bbox.west,
          lte: bbox.east,
        },
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        gallery: true,
      },
      orderBy: {
        id: "desc",
      },
      take,
    });

    const features = restaurants.map((r) => ({
      type: "Feature",
      properties: {
        id: String(r.id),
        name: r.title,
        image: getImage(r.gallery),
      },
      geometry: {
        type: "Point",
        coordinates: [r.longitude, r.latitude],
      },
    }));

    return NextResponse.json(
      {
        type: "FeatureCollection",
        features,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Tile API Error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}