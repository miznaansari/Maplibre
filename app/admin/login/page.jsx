
// app/admin/login/page.jsx (SERVER)

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogin from "../UI/AdminLogin/AdminLogin";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;

  // 🔥 If already logged in → go to dashboard
  // if (adminToken) {
  //   redirect("/");
  // }

  // ❌ No token → show login page
  return <AdminLogin />;
}
