export async function uploadBuffer(buffer, fileName, uploadType = "productImage") {
  const blob = new Blob([buffer], { type: "image/webp" });
  const file = new File([blob], fileName, { type: "image/webp" });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadType", uploadType);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error("Upload failed");
  }

  return data.imageUrl;
}
