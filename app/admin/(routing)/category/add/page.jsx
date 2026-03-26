import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import AddCategory from "./AddCategory";
import { ToastProvider } from "@/app/admin/context/ToastProvider";

export const metadata = {
  title: "Add Category | Admin",
};

async function getCategories() {
  const res = await serverFetch("/admin/api/categories");

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}


export default async function Page() {
  // ✅ SSR AUTH CHECK
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken")?.value;

  if (!adminToken) {
    redirect("/admin/login");
  }

  // ✅ SERVER FETCH
  const categories = await getCategories();

  // ✅ PASS DATA TO CLIENT
 return (
  <ToastProvider>
    <AddCategory categories={categories} />
  </ToastProvider>
);
}
