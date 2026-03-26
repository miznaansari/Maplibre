"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline";

export default function WhatsAppPage() {
  const [status, setStatus] = useState(null);

  async function loadStatus() {
    const res = await fetch("/admin/api/whatsapp/status");
    const data = await res.json();
    setStatus(data);
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true
    });

    const [datePart, timePart] = d.split(", ");
    const [day, month, year] = datePart.split("/");

    return `${day}-${month}-${year} ${timePart}`;
  };

  if (!status)
    return (
      <div className="p-10 text-gray-500">
        Loading WhatsApp status...
      </div>
    );

  const Badge = ({ connected }) => (
    <span
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        connected
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {connected ? (
        <CheckCircleIcon className="w-4 h-4" />
      ) : (
        <XCircleIcon className="w-4 h-4" />
      )}
      {connected ? "Connected" : "Disconnected"}
    </span>
  );

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between border-b py-3">
      <div className="flex items-center gap-2 text-gray-600">
        {Icon && <Icon className="w-5 h-5" />}
        <span>{label}</span>
      </div>
      <span className="font-medium text-gray-900">{value || "-"}</span>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        WhatsApp Session
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* QR SECTION */}
        {!status.is_connected && (
          <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <QrCodeIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Scan QR to Connect
              </h2>
            </div>

            {status.last_qr ? (
              <img
                src={status.last_qr}
                className="w-72 border rounded-lg"
              />
            ) : (
              <p className="text-gray-500">
                Generating QR Code...
              </p>
            )}

            <div className="mt-6 text-sm text-gray-500 text-center">
              <p>1. Open WhatsApp</p>
              <p>2. Tap Linked Devices</p>
              <p>3. Scan this QR code</p>
            </div>
          </div>
        )}

        {/* STATUS CARD */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Connection Status
            </h2>
            <Badge connected={status.is_connected} />
          </div>

          <InfoRow
            icon={DevicePhoneMobileIcon}
            label="Phone Number"
            value={`+${status.phone_number}`}
          />

          <InfoRow
            icon={DevicePhoneMobileIcon}
            label="Session Name"
            value={status.session_name}
          />

          <InfoRow
            icon={XCircleIcon}
            label="Disconnect Reason"
            value={status.disconnect_reason}
          />
        </div>

        {/* TIMELINE */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold">
              Connection Timeline
            </h2>
          </div>

          <InfoRow
            label="Last Connected"
            value={formatDate(status.last_connected_at)}
          />

          <InfoRow
            label="Last Disconnected"
            value={formatDate(status.last_disconnected_at)}
          />

          <InfoRow
            label="Created At"
            value={formatDate(status.created_at)}
          />

          <InfoRow
            label="Updated At"
            value={formatDate(status.updated_at)}
          />
        </div>

      </div>
    </div>
  );
}