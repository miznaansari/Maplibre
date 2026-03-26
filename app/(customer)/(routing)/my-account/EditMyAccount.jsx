"use client";

import { useActionState, useState, useMemo, useEffect } from "react";
import {
  updateCustomerAction,
  changePasswordAction,
} from "./action";
import UploadImage from "./UploadImage";
import { useToast } from "@/app/admin/context/ToastProvider";

export default function EditMyAccount({ customer }) {
  const { showToast } = useToast();

  /* ACTION STATES */
  const [profileState, profileAction, profilePending] =
    useActionState(updateCustomerAction, {
      success: false,
      message: "",
      errors: {},
    });

  const [passwordState, passwordAction, passwordPending] =
    useActionState(changePasswordAction, {
      success: false,
      message: "",
      errors: {},
    });

  /* INITIAL STATES */
  const initialProfile = useMemo(
    () => ({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      phone: customer.phone || "",
      whatsapp: customer.whatsapp || "",
    }),
    [customer]
  );

  const initialImage = useMemo(
    () => (customer.image_gallery?.url ? [customer.image_gallery.url] : []),
    [customer]
  );

  /* FORM STATES */
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [imageUrls, setImageUrls] = useState(initialImage);

  /* CHANGE DETECTION */
  const isProfileChanged =
    JSON.stringify(profileForm) !== JSON.stringify(initialProfile);

  const isImageChanged =
    JSON.stringify(imageUrls) !== JSON.stringify(initialImage);

  const errors = profileState.errors || {};

  /* TOASTS */
  useEffect(() => {
    if (!profileState.message) return;

    showToast({
      type: profileState.success ? "success" : "error",
      message: profileState.message,
    });
  }, [profileState.success, profileState.message]);

  useEffect(() => {
    if (!passwordState.message) return;

    showToast({
      type: passwordState.success ? "success" : "error",
      message: passwordState.message,
    });
  }, [passwordState.success, passwordState.message]);

  return (
    <div className="space-y-10 p-6 text-white">

      {/* PROFILE */}
      <form
        action={profileAction}
        className="space-y-6 rounded-xl border border-white/10 bg-[#1a1a1a] pb-6"
      >
        <h2 className="border-b border-white/10 px-6 py-4 text-lg font-semibold">
          Personal Details
        </h2>

        <div className="grid grid-cols-1 gap-6 px-6 md:grid-cols-[220px_1fr]">

          {/* IMAGE */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-56 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#111827]">
              <img
                src={imageUrls?.[0] || "/images/not-found.png"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>

            <UploadImage
              uploadType="userImage"
              onSuccess={(urls) => setImageUrls(urls)}
            />
          </div>

          {/* FORM */}
          <div className="space-y-4">
            <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
            <input type="hidden" name="customerId" value={customer.id} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <InputDark
                label="First Name"
                name="first_name"
                value={profileForm.first_name}
                error={errors.first_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, first_name: e.target.value })
                }
              />

              <InputDark
                label="Last Name"
                name="last_name"
                value={profileForm.last_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, last_name: e.target.value })
                }
              />

              {/* EMAIL */}
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <input
                  value={customer.email}
                  disabled
                  className="w-full rounded border border-white/10 bg-[#111827] px-3 py-2 text-sm text-gray-400"
                />
              </div>

              <InputDark
                label="Phone"
                name="phone"
                value={profileForm.phone}
                error={errors.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
              />

              <InputDark
                label="WhatsApp"
                name="whatsapp"
                value={profileForm.whatsapp}
                error={errors.whatsapp}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, whatsapp: e.target.value })
                }
              />
            </div>

            <button
              disabled={profilePending || (!isProfileChanged && !isImageChanged)}
              className="mt-4 rounded-lg bg-[#347eb3] px-6 py-2 text-sm font-medium text-white"
            >
              {profilePending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* PASSWORD */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <h2 className="border-b border-white/10 px-6 py-4 text-lg font-semibold">
          Reset Password
        </h2>

        <form action={passwordAction} className="space-y-4 px-6 py-6">
          <PasswordDark
            label="Current Password"
            name="current_password"
            error={passwordState.errors.current_password}
          />

          <PasswordDark
            label="New Password"
            name="new_password"
            error={passwordState.errors.new_password}
          />

          <PasswordDark
            label="Confirm Password"
            name="confirm_password"
            error={passwordState.errors.confirm_password}
          />

          <button
            disabled={passwordPending}
            className="rounded-lg bg-[#347eb3] px-6 py-2 text-sm font-medium text-white"
          >
            {passwordPending ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* INPUT */
function InputDark({ label, name, value, onChange, error }) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* PASSWORD */
function PasswordDark({ label, name, error }) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type="password"
        name={name}
        className="w-full rounded border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
