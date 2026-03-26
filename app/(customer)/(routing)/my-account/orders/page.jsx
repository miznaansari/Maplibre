// app/my-account/orders/page.jsx
import { Suspense } from "react";
import OrdersList from "./OrdersList";
import Loading from "./loading";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/requireUser";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  // 🔐 Not logged in
  if (!authToken) {
    redirect("/auth/login");
  }

  const tokenData = await requireUser();
  console.log('tokenData', tokenData)
  // 🔐 Invalid / expired token
  // if (!tokenData) {
  //   redirect("/api/auth/logout");
  // }

  const customerId = tokenData?.id;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Suspense fallback={<Loading />}>
        <OrdersList customerId={customerId} />
      </Suspense>
    </div>
  );
}
