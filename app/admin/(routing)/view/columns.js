import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import StatusToggle from "./StatusToggle";

const statusStyles = {
  active: "bg-green-100 text-green-700 border-green-300",
  suspended: "bg-yellow-100 text-yellow-700 border-yellow-300",
  deleted: "bg-red-100 text-red-700 border-red-300",
};

export const adminColumns = ({ setOpenDelete, setSelectedAdmin }) => [
  {
    key: "serial",
    label: "S.No",
    className: "w-[56px] text-center px-2",
    render: (_row, index) => index + 1,
  },
    {
    key: "actions",
    label: "Action",
    align: "text-start",
    className: "w-[72px] px-0",
    render: (row) => (
      <div className="flex items-center justify-start gap-2 whitespace-nowrap">
        <Link
          href={`/admin/admins/view/${row.id}`}
          className="group relative rounded p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100"
        >
          <PencilSquareIcon className="h-5 w-5" />
          <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            Edit
          </span>
        </Link>

        <button
          onClick={() => {
            setSelectedAdmin(row);
            setOpenDelete(true);
          }}
          className="group relative cursor-pointer rounded p-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="h-5 w-5" />
          <span className="pointer-events-none z-90 absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            Delete
          </span>
        </button>
      </div>
    ),
  },

  {
    key: "name",
    label: "Name",
    className: "w-auto truncate",
  },

  {
    key: "email",
    label: "Email",
    className: "w-auto truncate",
  },

  {
  key: "status",
  label: "Status",
  className: "w-[120px] text-center px-2",
  render: (row) => <StatusToggle admin={row} />,
},
{
  key: "created_at",
  label: "Created",
  className: "w-[160px] whitespace-nowrap px-2",
  render: (row) => {
    if (!row?.created_at) return "-";

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


];
