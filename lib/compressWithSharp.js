import sharp from "sharp";

const sizes = [64, 144, 240, 360, 480, 720, 1080];

export async function generateVariants(inputBuffer) {
  console.log("🟡 Starting variant generation...");
  console.log("Original size:", Math.round(inputBuffer.length / 1024), "KB");

  const startTime = Date.now();
  const results = {};

  await Promise.all(
    sizes.map(async (size) => {
      try {
        console.log(`➡️ Compressing ${size}px...`);

        const buffer = await sharp(inputBuffer)
          .resize(size)
          .webp({ quality: 80 })
          .toBuffer();

        const kb = Math.round(buffer.length / 1024);

        console.log(`✅ ${size}px done (${kb} KB)`);

        results[size] = buffer.toString("base64");
      } catch (err) {
        console.error(`❌ Failed at ${size}px`, err);
      }
    })
  );

  console.log(
    "🟢 Variant generation finished in",
    Date.now() - startTime,
    "ms"
  );

  return results;
}
