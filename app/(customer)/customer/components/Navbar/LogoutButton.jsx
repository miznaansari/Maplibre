"use client";

import { useTransition } from "react";
import { logout } from "./server";
import {
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

/* SMALL SPINNER */
function Spinner() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        startTransition(async () => {
          await logout();
        });
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className={`
          flex w-full items-center  gap-3 px-4 py-3 text-left
          transition-colors
          ${pending
            ? "text-red-400 cursor-not-allowed"
            : "hover:bg-red-50 text-red-600 cursor-pointer"}
        `}
      >
        {pending ? (
          <Spinner />
        ) : (
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        )}

        <span className="font-medium">
          {pending ? "Logging out..." : "Log out"}
        </span>
      </button>
    </form>
  );
}
