"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { changePassword } from "./action";

/* ------------------------------------
  Password Strength & Rules
------------------------------------ */
const passwordRules = {
  length: (v) => v.length >= 8,
  upper: (v) => /[A-Z]/.test(v),
  lower: (v) => /[a-z]/.test(v),
  number: (v) => /[0-9]/.test(v),
  special: (v) => /[^A-Za-z0-9]/.test(v),
};

const getStrength = (password) => {
  const score = Object.values(passwordRules).filter((fn) => fn(password)).length;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
  return { label: "Strong", color: "bg-green-600", width: "100%" };
};

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const strength = getStrength(form.newPassword);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await changePassword(form);

    if (!res.success) {
      setErrors({ form: res.message });
    } else {
      setSuccess("Password updated successfully 🎉");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }

    setLoading(false);
  };

  const renderRule = (label, valid) => (
    <li className={`text-sm ${valid ? "text-green-600" : "text-gray-500"}`}>
      {valid ? "✔" : "✖"} {label}
    </li>
  );

  return (
    <div className=" mt-1  flex items-center justify-center  px-4">
      <div className="  bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Create a strong password to keep your account secure.
        </p>

        {errors.form && (
          <p className="mb-4 text-sm text-red-600">{errors.form}</p>
        )}

        {success && (
          <p className="mb-4 text-sm text-green-600">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OLD PASSWORD */}
          <div>
            <label className="text-sm font-medium">Old Password</label>
            <div className="relative mt-1">
              <input
                type={show.old ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, old: !show.old })}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {show.old ? <EyeSlashIcon className="h-5" /> : <EyeIcon className="h-5" />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="text-sm font-medium">New Password</label>
            <div className="relative mt-1">
              <input
                type={show.new ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, new: !show.new })}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {show.new ? <EyeSlashIcon className="h-5" /> : <EyeIcon className="h-5" />}
              </button>
            </div>

            {/* STRENGTH BAR */}
            {form.newPassword && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="text-xs mt-1">
                  Password strength: <b>{strength.label}</b>
                </p>
              </div>
            )}

            {/* RULES */}
            <ul className="mt-3 space-y-1">
              {renderRule("At least 8 characters", passwordRules.length(form.newPassword))}
              {renderRule("One uppercase letter", passwordRules.upper(form.newPassword))}
              {renderRule("One lowercase letter", passwordRules.lower(form.newPassword))}
              {renderRule("One number", passwordRules.number(form.newPassword))}
              {renderRule("One special character", passwordRules.special(form.newPassword))}
            </ul>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-sm font-medium">Confirm New Password</label>
            <div className="relative mt-1">
              <input
                type={show.confirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, confirm: !show.confirm })}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {show.confirm ? <EyeSlashIcon className="h-5" /> : <EyeIcon className="h-5" />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
