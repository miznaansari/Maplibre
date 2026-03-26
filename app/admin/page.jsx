
// app/admin/login/page.jsx (SERVER)

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogin from "./UI/AdminLogin/AdminLogin";
import { requireAdmin } from "@/lib/requireAdmin";

export default async function LoginPage() {
  const adminToken = requireAdmin();;

  // 🔥 If already logged in → go to dashboard
  // if (adminToken) {
  //   redirect("/admin/dashboard");
  // }

  // ❌ No token → show login page
  return <AdminLogin adminToken={adminToken} />;
}
