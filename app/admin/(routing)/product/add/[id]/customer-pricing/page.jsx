import { prisma } from "@/lib/prisma";
import CustomerPricingForm from "./CustomerPricingForm";

async function getProduct(productId) {
  return prisma.product_list.findUnique({
    where: { id: Number(productId) },
    select: { id: true, name: true },
  });
}

async function getCustomerPricing(productId) {
  // Fetch all active customer groups
  const groups = await prisma.customer_groups.findMany({
    where: { is_active: true },
    orderBy: { id: "asc" },
  });

  // Fetch existing prices for this product
  const prices = await prisma.product_pricing.findMany({
    where: { product_list_id: Number(productId) },
  });

  // Map prices to group ids for easy lookup
  const priceMap = {};
  for (const p of prices) {
    priceMap[p.customer_group_id] = p.price.toString();
  }

  return groups.map((g) => ({
    id: g.id,
    group_name: g.group_name,
    price: priceMap[g.id] || "",
  }));
}

export default async function CustomerPricingPage({ params }) {
  const p = await params;
  const productId = Number(p.id);

  const [product, customerPricing] = await Promise.all([
    getProduct(productId),
    getCustomerPricing(productId),
  ]);

  if (!product) {
    return <div className="p-6 text-red-600">Product not found</div>;
  }

  return (
    <CustomerPricingForm
      productId={product.id}
      productName={product.name}
      customerPricing={customerPricing}
    />
  );
}
