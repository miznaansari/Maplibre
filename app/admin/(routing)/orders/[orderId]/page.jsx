import { requireAdmin } from "@/lib/requireAdmin";
import OrderDetailsClient from "./OrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }) {
  // 🔐 ADMIN AUTH (MANDATORY)
  await requireAdmin();

  const { orderId } = await params;

  return <OrderDetailsClient orderId={orderId} />;
}
