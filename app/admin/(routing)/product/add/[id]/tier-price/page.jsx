// app/admin/product/[id]/tier-pricing/page.jsx
import TierPricingForm from "./TierPricingForm";
import { prisma } from "@/lib/prisma";

async function getProduct(productId) {
  return prisma.product_list.findUnique({
    where: { id: Number(productId) },
    select: {
      id: true,
      name: true,
    },
  });
}

async function getTierPricing(productId) {
  const pricing = await prisma.tier_product_pricing.findUnique({
    where: {
      product_list_id: Number(productId),
    },
  });

  if (!pricing) return null;

  // ✅ Convert Decimal → string
  const serialized = {
    id: pricing.id,
    product_list_id: pricing.product_list_id,
  };

  for (let i = 1; i <= 10; i++) {
    const key = `tier_${i}_price`;
    serialized[key] = pricing[key]
      ? pricing[key].toString()
      : "";
  }

  return serialized;
}

export default async function TierPricingPage({ params }) {
  const p = await params;

  const productId = Number(p.id);

  const [product, tierPricing] = await Promise.all([
    getProduct(productId),
    getTierPricing(productId),
  ]);

  if (!product) {
    return <div className="p-6 text-red-600">Product not found</div>;
  }

  return (
    <TierPricingForm
      productId={product.id}
      productName={product.name}
      tierPricing={tierPricing}
    />
  );
}
