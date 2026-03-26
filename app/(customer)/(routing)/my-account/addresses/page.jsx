import Link from "next/link";
import MyAccountContent from "../MyAccountContent";
import ViewAddress from "./ViewAddress";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/requireUser";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {


  const user = await requireUser();
  if (!user?.id) {
    return null;
  }

  const addresses = await prisma.customer_address.findMany({
    where: {
      customer_list_id: user.id,
      is_deleted: false,
    },
    orderBy: { created_at: "desc" },
  });
  console.log('address', addresses)
  return (
    <div className="max-w-6xl mx-auto px-1">
      <div className="mb-5 flex items-center justify-between">


             <p className=" text-sm text-gray-600 font-semibold">
                Address
                 {/* <span className="mx-1 text-[#0172BC]">{">"}</span> */}
                {/* <span className="font-medium text-[#0172BC]">{title}</span> */}
            </p>
        <Link
          href="/my-account/addresses/add"
          className="rounded border border-[#00AEEF] px-3 py-1.5 text-sm font-medium text-[#00AEEF] hover:bg-blue-50"
        >
          + Add New Address
        </Link>
      </div>

      <ViewAddress addresses={addresses} />
    </div>
  );
}
