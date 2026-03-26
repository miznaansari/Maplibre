"use client";

import { useState, useTransition } from "react";
import { syncTierPricing } from "./actions/syncTierPricing";

export default function SyncTierPricingPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  function handleSync() {
    setResult(null);
    startTransition(async () => {
      const res = await syncTierPricing();
      setResult(res);
    });
  }

  return (
    <div className="max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">Sync Tier Pricing</h1>

      <button
        onClick={handleSync}
        disabled={isPending}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
      >
        {isPending ? "Syncing... please wait" : "Sync Tier Pricing"}
      </button>

      {isPending && (
        <p className="text-sm text-gray-500">
          ⏳ Processing products one by one...
        </p>
      )}

      {result && (
        <>
          <div className="rounded-md border p-4 text-sm space-y-1">
            <p>📦 Total scanned: <b>{result.total}</b></p>
            <p>✅ Matched: <b>{result.matched}</b></p>
            <p>🆕 Inserted: <b>{result.inserted}</b></p>
            <p>🔄 Updated: <b>{result.updated}</b></p>
            <p>⏭️ Skipped: <b>{result.skipped}</b></p>
          </div>

          <div className="rounded-md border p-4 text-sm bg-gray-50 max-h-64 overflow-auto">
            <p className="font-medium mb-2">📝 Sync Log</p>
            <ul className="space-y-1">
              {result.logs.map((log, i) => (
                <li key={i}>• {log}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
