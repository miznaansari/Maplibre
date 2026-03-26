import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { name, image, lat, lng } = body;

    if (!name || !lat || !lng) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe_list.create({
      data: {
        name,
        image,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    });

    return NextResponse.json({ success: true, cafe });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}