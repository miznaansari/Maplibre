"use client";

import { useState } from "react";

export default function CustomerImport() {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const jsonData = JSON.parse(text);

    setLoading(true);

    await fetch("/api/import-customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    setLoading(false);
    alert("Customers imported successfully");
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Import Customers (JSON)</h2>

      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="border p-2"
      />

      {loading && <p className="mt-3">Importing customers...</p>}
    </div>
  );
}
