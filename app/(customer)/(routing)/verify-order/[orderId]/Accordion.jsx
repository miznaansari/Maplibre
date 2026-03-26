import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151515] overflow-hidden">

      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium">{title}</span>

        <ChevronDownIcon
          className={`h-5 w-5 transition-transform duration-300 ${
            open ? "rotate-180 text-[#38bdf8]" : "text-gray-400"
          }`}
        />
      </button>

      {/* CONTENT */}
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-4 pb-4 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}