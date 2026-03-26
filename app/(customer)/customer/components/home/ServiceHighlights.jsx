import {
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export default function ServiceHighlights() {
  const items = [
    {
      icon: TruckIcon,
      title: "PAN INDIA DELIVERY",
      desc: "Fast shipping across India",
      color: "text-[#347eb3] border-[#347eb3]/30 bg-[#347eb3]/10",
    },
    {
      icon: ShieldCheckIcon,
      title: "PREMIUM QUALITY",
      desc: "High quality mobile accessories",
      color: "text-green-500 border-green-500/30 bg-green-500/10",
    },
    {
      icon: ArrowPathIcon,
      title: "EASY RETURNS",
      desc: "7-day hassle free returns",
      color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    },
    {
      icon: BoltIcon,
      title: "FAST DISPATCH",
      desc: "Quick order processing",
      color: "text-purple-500 border-purple-500/30 bg-purple-500/10",
    },
  ];

  return (
    <section className="py-16 hidden md:flex bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">

          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <div key={i} className="flex flex-col items-center">

                {/* ICON BOX */}
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl border ${item.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* TITLE */}
                <h4 className="mt-4 text-black text-sm tracking-widest font-semibold">
                  {item.title}
                </h4>

                {/* DESCRIPTION */}
                <p className="text-gray-500 text-sm mt-1">
                  {item.desc}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}