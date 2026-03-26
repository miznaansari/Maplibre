"use client";

import { useEffect, useState } from "react";
import { createAddress } from "./actions";

export default function AddressStep({ addresses, onNext }) {

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    email: "",
    country: "India"
  });

  /* =========================
     LOAD DEFAULT ADDRESS
  ========================= */

  useEffect(() => {

    const stored = localStorage.getItem("shipping_address_id");

    if (stored) {
      setSelected(Number(stored));
      return;
    }

    const primary = addresses.find((a) => a.is_default);

    if (primary) {
      setSelected(primary.id);
      localStorage.setItem("shipping_address_id", primary.id);
      localStorage.setItem("billing_address_id", primary.id);
    }

  }, [addresses]);

  const handleSelect = (id) => {
    setSelected(id);

    localStorage.setItem("shipping_address_id", id);
    localStorage.setItem("billing_address_id", id);
  };

  const handleNext = () => {

    if (!selected) return;

    localStorage.setItem("shipping_address_id", selected);
    localStorage.setItem("billing_address_id", selected);

    onNext();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await createAddress(form);

    if (res?.id) {
      setSelected(res.id);
      setShowForm(false);
      location.reload();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

      <h2 className="text-lg font-semibold mb-6 text-black">
        SELECT DELIVERY ADDRESS
      </h2>

      <div className="space-y-4">

        {addresses.map((a) => (

          <label
            key={a.id}
            className={`block p-4 rounded-xl border cursor-pointer transition
            ${
              selected === a.id
                ? "border-cyan-500 bg-cyan-50"
                : "border-gray-200 hover:border-cyan-400"
            }`}
          >

            <div className="flex justify-between gap-4">

              <div>

                <p className="font-semibold text-black">
                  {a.first_name} {a.last_name}
                </p>

                <p className="text-sm text-gray-600">
                  {a.address_1}
                </p>

                <p className="text-sm text-gray-600">
                  {a.city}, {a.state} - {a.postal_code}
                </p>

              </div>

              <input
                type="radio"
                checked={selected === a.id}
                onChange={() => handleSelect(a.id)}
                className="accent-cyan-500"
              />

            </div>

          </label>

        ))}

        {/* ADD ADDRESS CARD */}

        <div
          onClick={() => setShowForm(true)}
          className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-cyan-400"
        >
          <p className="text-sm text-gray-600 font-medium">
            + Add New Address
          </p>
        </div>

      </div>

      {/* ADDRESS FORM */}

      {showForm && (

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <input
            placeholder="First Name"
            required
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, first_name:e.target.value})}
          />

          <input
            placeholder="Last Name"
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, last_name:e.target.value})}
          />

          <input
            placeholder="Phone"
            required
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, phone:e.target.value})}
          />

          <input
            placeholder="Email"
            required
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, email:e.target.value})}
          />

          <input
            placeholder="Address"
            required
            className="border rounded-lg p-2 md:col-span-2"
            onChange={(e)=>setForm({...form, address_1:e.target.value})}
          />

          <input
            placeholder="City"
            required
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, city:e.target.value})}
          />

          <input
            placeholder="State"
            required
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, state:e.target.value})}
          />

          <input
            placeholder="Postal Code"
            required
            className="border rounded-lg p-2"
            onChange={(e)=>setForm({...form, postal_code:e.target.value})}
          />

          <button className="md:col-span-2 bg-cyan-500 text-white py-3 rounded-lg">
            Save Address
          </button>

        </form>

      )}

      {/* NEXT BUTTON */}

      <button
        onClick={handleNext}
        disabled={!selected}
        className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        CONTINUE TO REVIEW
      </button>

    </div>
  );
}