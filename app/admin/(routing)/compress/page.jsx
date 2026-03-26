"use client";

import { useEffect, useState } from "react";
import { getPendingImages, processOneImage } from "./action";
import { uploadBuffer } from "@/lib/uploadImageHelper";

export default function CompressPage() {
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getPendingImages();
      setImages(data);
    }
    load();
  }, []);

  async function startProcess() {
    if (!images.length) return;

    setRunning(true);

    for (let i = progress; i < images.length; i++) {
      const image = images[i];

      console.log("Processing image:", image.id);

      const result = await processOneImage(image.id);

      const uploadedUrls = {};

      await Promise.all(
        Object.entries(result.variants).map(async ([size, base64]) => {
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          const url = await uploadBuffer(
            bytes,
            `${result.id}_${size}.webp`,
            "productImage"
          );

          uploadedUrls[`url_${size}`] = url;
        })
      );

      await fetch("/admin/api/update-image-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: result.id,
          urls: uploadedUrls,
        }),
      });

      setProgress(i + 1);
    }

    setRunning(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">
        Pending Images: {images.length}
      </h1>

      <button
        onClick={startProcess}
        disabled={running}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
      >
        {running ? "Processing..." : "Start Compression"}
      </button>

      <div className="mt-4">
        Progress: {progress} / {images.length}
      </div>
    </div>
  );
}
