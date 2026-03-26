import Link from "next/link";
import AddAddressForm from "./AddAddressForm";
import MyAccountContent from "../../MyAccountContent";

export default async function AddAddressPage({ searchParams }) {
  const p = await searchParams;
  const success = p?.success === "1";

  return (
    <div className="max-w-6xl mx-auto px-1">
      <div className="mb-5 flex items-center justify-between">

        <p className=" text-sm text-gray-600"><Link href={'/my-account/addresses'} className="font-medium ">  My
          Address </Link> <span className="mx-1 text-[#0172BC]">{">"}</span>
          <span className="font-medium text-[#0172BC]">Add Address</span>
        </p>

      </div>

      {success && (
        <div className="mb-6 rounded border border-green-200 bg-green-50 p-4 text-green-700
        ">
          ✅ Your address has been successfully added.
        </div>
      )}

      <AddAddressForm />
    </div>
  );
}
