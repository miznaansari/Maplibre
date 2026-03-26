
import { revalidatePath } from "next/cache";

export async function addProduct(formData) {
  const name = formData.get("name");
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const payload = {
    name,
    slug,
    sku: formData.get("sku"),
    category_id: formData.get("category_id"),
    regular_price: Number(formData.get("regular_price")),
    sale_price: Number(formData.get("sale_price")) || null,
    stock_qty: Number(formData.get("stock_qty")),
    weight: Number(formData.get("weight")) || null,
    description: formData.get("description"),
    image: formData.get("image_url")
      ? { url: formData.get("image_url"), alt_text: name }
      : null,
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to add product");
  }

  // 🔄 Revalidate admin product listing
  revalidatePath("/admin/products");
}
