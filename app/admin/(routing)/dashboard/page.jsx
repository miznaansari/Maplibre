import { Suspense } from "react";
import StatCards from "../../components/StatCards";
import OrdersChart from "../../components/OrdersChart";
import RevenueChart from "../../components/RevenueChart";
import NewCard from "../../components/NewCard";

export default function Page() {
  return (
    <div className="m-2 space-y-6">

      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded" />}>
        <StatCards />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
         <div className="lg:col-span-2">


          <Suspense fallback={<div className="h-80 animate-pulse bg-gray-100 rounded" />}>
            <RevenueChart />
          </Suspense>
        </div>
        <div>

          {/* <StatusCorner /> */}
          <NewCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">


        {/* <Suspense fallback={<div className="h-80 animate-pulse bg-gray-100 rounded" />}>
          <RevenueChart />
        </Suspense> */}

        <Suspense fallback={<div className="h-80 animate-pulse bg-gray-100 rounded" />}>
          <OrdersChart />
        </Suspense>
      </div>
    </div>
  );
}

