import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("📥 Request received at /api/extract-info");

    // Read incoming image
    const image = await req.arrayBuffer();
    console.log("🖼️ Image received. Size:", image.byteLength, "bytes");

    const apiUrl = "https://ai.theclevar.com/webhook/extract-info";
    console.log("🌐 Sending request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
      },
      body: image,
    });

    console.log("📡 Response status from AI API:", response.status);

    const data = await response.json();
    console.log("✅ AI API Response Data:", data);

    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Error in extract-info API:", error);

    return NextResponse.json(
      {
        status: "false",
        data: { message: "AI request failed" },
      },
      { status: 500 }
    );
  }
}