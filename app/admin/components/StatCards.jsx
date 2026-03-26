import {
  UsersIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { getDashboardStats } from "../actions";

export default async function StatCards() {
  const stats = await getDashboardStats();

  const customers = Number(stats?.customers ?? 0);
  const products = Number(stats?.products ?? 0);
  const orders = Number(stats?.orders ?? 0);
  const revenue = Number(stats?.revenue ?? 0);

  const cards = [
    {
      label: "Customers",
      value: customers,
      sub: "Total",
      icon: UsersIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Products",
      value: products,
      sub: "Active",
      icon: ShoppingBagIcon,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Orders",
      value: orders,
      sub: "All time",
      icon: ClipboardDocumentListIcon,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Revenue",
      value: `₹${revenue.toFixed(2)}`,
      sub: "Earnings",
      icon: BanknotesIcon,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="
            flex items-center gap-4
            bg-white
            border border-gray-200
            rounded-xl
            px-5 py-4
            shadow-sm
            hover:shadow-md
            transition
          "
        >
          {/* Icon */}
          <div
            className={`
              flex items-center justify-center
              w-11 h-11 rounded-lg
              ${card.color}
            `}
          >
            <card.icon className="w-6 h-6" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">
              {card.label}
            </p>

            <p className="text-xl font-semibold text-gray-900 leading-tight">
              {card.value}
              <span className="ml-2 text-sm font-normal text-gray-400">
                {card.sub}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
