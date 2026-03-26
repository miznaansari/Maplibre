import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// 👇 Ensure Node runtime (important for Buffer + crypto)
export const runtime = "nodejs";

console.log("🚀 Upload API initialized");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

console.log("✅ S3 Client Config:", {
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  bucket: process.env.R2_BUCKET_NAME,
  publicUrl: process.env.R2_PUBLIC_URL,
});

export async function POST(req) {
  console.log("📥 POST /api/upload called");

  try {
    console.log("🧾 Reading formData...");
    const formData = await req.formData();

    const file = formData.get("file");
    const uploadType = formData.get("uploadType");

    console.log("📦 formData values:", {
      hasFile: !!file,
      uploadType,
      fileType: file?.type,
      fileName: file?.name,
      fileSize: file?.size,
    });

    if (!file || !uploadType) {
      console.error("❌ Missing file or uploadType");
      return NextResponse.json(
        { success: false, message: "File or uploadType missing" },
        { status: 400 }
      );
    }

    const allowedTypes = ["productImage", "userImage", "adminImage"];
    if (!allowedTypes.includes(uploadType)) {
      console.error("❌ Invalid uploadType:", uploadType);
      return NextResponse.json(
        { success: false, message: "Invalid uploadType" },
        { status: 400 }
      );
    }

    console.log("🔄 Converting file to buffer...");
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("✅ Buffer created, size:", buffer.length);

    const fileExt = file.name.split(".").pop();
    const fileName = `${uploadType}/${crypto.randomUUID()}.${fileExt}`;

    console.log("📝 Upload details:", {
      bucket: process.env.R2_BUCKET_NAME,
      key: fileName,
      contentType: file.type,
    });

    console.log("☁️ Uploading to Cloudflare R2...");
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    console.log("✅ Upload successful");

    const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    console.log("🌐 Public image URL:", imageUrl);

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("🔥 UPLOAD FAILED (FULL ERROR):");
    console.error(error?.name);
    console.error(error?.message);
    console.error(error?.stack);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
