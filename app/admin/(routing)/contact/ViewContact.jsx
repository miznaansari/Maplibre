"use client";

import DataTable from "../../UI/common/DataTable";
import Pagination from "../../UI/common/Pagination";
import ProductSearch from "../product/ProductSearch";



export default function ViewContact({
  contacts,
  page,
  totalPages,
  searchParams,
}) {
  const columns = [
    {
      key: "sno",
      label: "S.No",
      align: "text-center",
      render: (_, index) => (page - 1) * (searchParams.limit || 10) + index + 1,
    },
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject" },
    { key: "companyName", label: "Company" },
    {
      key: "message",
      label: "Message",
      render: (row) => row.message.slice(0, 40) + "...",
    },
{
  key: "createdAt",
  label: "Date",
  render: (row) => {
    if (!row.createdAt) return "-";

    const d = new Date(row.createdAt);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  },
},



  ];

  return (
    <div className="bg-white m-2 ">
      <div className="px-3 py-2">
      <ProductSearch
        title="Contact Messages"
        searchPlaceholder="Search contacts..."
      />
</div>
      <DataTable columns={columns} data={contacts} />

      {/* ✅ PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
