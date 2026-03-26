import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import EditAddressForm from "./EditAddressForm";
import MyAccountContent from "../../../MyAccountContent";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/requireUser";

export default async function EditAddressPage({ params }) {

  const p = await params;
  const payload = await requireUser();
  if (!payload?.id) {
    notFound();
  }

  const address = await prisma.customer_address.findFirst({
    where: {
      id: Number(p.id),
      customer_list_id: payload.id,
    },
  });

  if (!address) notFound();
  console.log('addressaddress',address)

  return (
    <div className="max-w-5xl mx-auto px-1">
      <MyAccountContent title="Edit Address" />
      <EditAddressForm address={address} />
    </div>
  );
}
