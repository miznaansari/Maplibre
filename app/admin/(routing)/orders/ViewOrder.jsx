"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Pagination from "../../UI/common/Pagination";
import DataTable from "../../UI/common/DataTable copy";
import ProductSearch from "../product/ProductSearch";
import StatusChip from "../../UI/common/StatusChip";

/* ----------------------------------
   ROW ACTION MENU (SMART POSITION)
---------------------------------- */
function RowActions({ orderId }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("bottom");
  const ref = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    setPosition(spaceBelow < 120 && spaceAbove > spaceBelow ? "top" : "bottom");
  }, [open]);

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
      >
        ⋮
      </button>

      {open && (
        <div
          className={`
            absolute right-0 z-30 w-40 rounded-md border border-gray-200 bg-white shadow
            ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}
          `}
        >
          <Link
            href={`/admin/orders/${orderId}`}
            className="block px-4 py-2 text-sm hover:bg-gray-50"
          >
            View Order
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ViewOrder({
  orders,
  page,
  totalPages,
  searchParams,
}) {
  /* ----------------------------------
     TABLE COLUMNS
  ---------------------------------- */
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_, index) => (
        <span className="text-gray-600">
          {(page - 1) * (Number(searchParams.limit) || 10) + index + 1}
        </span>
      ),
    },
    {
      key: "order_number",
      label: "Order #",
      render: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.order_number}
        </Link>
      ),
    },
    {
      key: "customer_email",
      label: "Customer Email",
      render: (row) => row.customer?.email || "-",
    },
    {
      key: "order_items_count",
      label: "Items",
      render: (row) => row.order_items_count || 0,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusChip value={row.status} />,
    }
    ,
    {
      key: "delivery_method",
      label: "Delivery",
    },
    {
      key: "total",
      label: "Total",
      align: "text-right",
      render: (row) => (
        <span className="font-semibold">
          {row.currency} {row.total.toFixed(2)}
        </span>
      ),
    },
  {
  key: "created_at",
  label: "Date",
  render: (row) => {
    const d = new Date(row.created_at);

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


    {
      key: "actions",
      label: "",
      align: "text-right",
      render: (row) => <RowActions orderId={row.id} />,
    },
  ];

  /* ----------------------------------
     FILTERS
  ---------------------------------- */
  const filters = [
    {
      key: "status",
      label: "Status",
      showInline: true,
      options:[
  { value: "CREATED", label: "Created" },
  { value: "PENDING", label: "Pending" },
  { value: "PAYMENT_FAILED", label: "Payment Failed" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
],

    },
    {
      key: "delivery",
      label: "Delivery Method",
      showInline: true,
      options: [
        { value: "PICKUP", label: "Pickup" },
        { value: "DELIVERY", label: "Delivery" },
      ],
    },
      {
      key: "purchase_order",
      label: "Purchase Order",
      showInline: true,
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ];s

  return (
    <div className=" rounded-xl m-2 bg-white">
      <div className="flex items-center justify-between   gap-4 border-gray-200 px-2 py-1 mb-0">
        <div className="w-full flex items-center ">
          {/* 🔍 SEARCH + FILTER */}
          <ProductSearch
            title="Orders"
            searchPlaceholder="Search Order Number..."
            filters={filters}
          />
        </div></div>
      {/* 📋 TABLE */}
      <DataTable columns={columns} data={orders} />

      {/* 📄 PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
