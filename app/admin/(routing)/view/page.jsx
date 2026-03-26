import Link from "next/link";
import ProductSearch from "../product/ProductSearch";
import { getAdmins } from "./actions";
import ViewAdmins from "./ViewAdmin";

export default async function AdminsPage({ searchParams }) {
  const result = await getAdmins(searchParams);

  return (
    <div className="bg-white m-2 rounded-xl shadow">
      <div className="flex gap-2 items-center">
        <ProductSearch
          title="Admins"
          searchPlaceholder="Search admins..."
        />
        <Link
          href="/admin/view/add"
          className="flex items-center w-28 md:w-50 justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
        >
          <span className="md:hidden">+ Add</span>
          <span className="hidden md:inline">+ Add Admin</span>
        </Link>
      </div>

      <ViewAdmins
        data={result.data}
        page={result.page}
        totalPages={result.totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
