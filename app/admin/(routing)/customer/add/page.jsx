// app/(admin)/customers/add/page.jsx
import { prisma } from "@/lib/prisma";
import AddCustomer from "./AddCustomer";

export default async function Page() {
  const customerGroups = await prisma.customer_groups.findMany({
    where: { is_active: true },
    orderBy: { group_name: "asc" },
  });

  const groupOptions = customerGroups.map((group) => ({
    value: group.id,
    label: group.group_name,
  }));

  return (
    <div className="m-2 border border-gray-200  rounded bg-white">
      <h1 className="text-xl font-semibold px-6 py-3 mb-6 border-b border-gray-300 pb-3">Add Customer</h1>

      <AddCustomer customerGroups={groupOptions} />
    </div>
  );
}
