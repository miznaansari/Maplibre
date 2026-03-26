"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { removeAddress, setAsPrimary } from "./actions";

export default function ViewAddress({ addresses }) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState({ id: null, type: null });

  const handleRemove = (id) => {
    setLoading({ id, type: "remove" });
    startTransition(async () => {
      await removeAddress(id);
      setLoading({ id: null, type: null });
    });
  };

  const handleSetDefault = (id) => {
    setLoading({ id, type: "default" });
    startTransition(async () => {
      await setAsPrimary(id);
      setLoading({ id: null, type: null });
    });
  };

return (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {addresses.map((addr) => (
      <div
        key={addr.id}
        className="
          flex h-full flex-col
          rounded-xl border border-white/10
          bg-[#1a1a1a] p-4
          shadow-[0_10px_30px_rgba(0,0,0,0.6)]
          transition hover:shadow-[0_10px_40px_rgba(0,0,0,0.9)]
        "
      >
        {/* ADDRESS */}
        <p className="font-medium text-white">
          {addr.address_1}
        </p>

        <div className="mt-1 text-sm text-gray-400">
          <p>
            {addr.city}, {addr.state}
          </p>
          <p>{addr.postal_code}</p>
        </div>

        {/* ACTIONS */}
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs">

          {/* REMOVE */}
          <button
            onClick={() => handleRemove(addr.id)}
            disabled={loading.id === addr.id && loading.type === "remove"}
            className="text-[#38bdf8] hover:text-[#7dd3fc] disabled:opacity-50"
          >
            {loading.id === addr.id && loading.type === "remove"
              ? "Removing..."
              : "Remove"}
          </button>

          <span className="text-gray-600">|</span>

          <Link
            href={`/my-account/addresses/edit/${addr.id}`}
            className="text-[#38bdf8] hover:text-[#7dd3fc]"
          >
            Edit
          </Link>

          <span className="text-gray-600">|</span>

          {/* DEFAULT */}
          {addr.is_default ? (
            <span
              className="
                rounded-full
                bg-[#347eb3]
                px-3 py-0.5
                text-white text-xs font-medium
                shadow-[0_0_12px_rgba(14,165,233,0.35)]
              "
            >
              Default
            </span>
          ) : (
            <button
              onClick={() => handleSetDefault(addr.id)}
              disabled={loading.id === addr.id && loading.type === "default"}
              className="text-[#38bdf8] hover:text-[#7dd3fc] disabled:opacity-50"
            >
              {loading.id === addr.id && loading.type === "default"
                ? "Saving..."
                : "Set as Default"}
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

}
