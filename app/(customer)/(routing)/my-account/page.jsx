import { prisma } from "@/lib/prisma";
import EditMyAccount from "./EditMyAccount";
import { requireUser } from "@/lib/requireUser";
import { redirect } from "next/navigation";

export default async function MyAccountPage() {
  console.log("🚀 MyAccountPage rendered");

  // 🔐 Get logged-in user session
  const user = await requireUser();
  console.log("🛡️ Logged-in user:", user);

  if (!user) {
    console.warn("⚠️ User session not found, redirecting to logout");
    redirect("/auth/logout");
  }

  // 📦 Fetch customer directly from Prisma
  let customer = null;
  try {
    customer = await prisma.customer_list.findUnique({
      where: {
        email: user.email,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        user_name: true,
        phone: true,
        whatsapp: true,
        last_password_updated_at: true,
        
        // ✅ PROFILE IMAGE
        image_gallery: {
            select: {
                id: true,
                url: true,
            },
        },
      },
    });
    console.log("📦 Customer fetched from DB:", customer);
  } catch (err) {
    console.error("❌ Error fetching customer from DB:", err);
  }

  if (!customer) {
    console.error("❌ Customer not found for email:", user.email);
    return (
      <div className="text-sm text-red-600">
        Customer not found
      </div>
    );
  }

  console.log("✅ Rendering EditMyAccount component with customer data");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <EditMyAccount customer={customer} />
    </div>
  );
}
