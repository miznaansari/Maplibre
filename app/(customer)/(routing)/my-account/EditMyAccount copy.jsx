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
    console.log('customer', customer)
    /* ─────────────────────────────────────────────
       ACTION STATES
    ───────────────────────────────────────────── */
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

    /* ─────────────────────────────────────────────
       INITIAL STATES
    ───────────────────────────────────────────── */
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


    /* ─────────────────────────────────────────────
       FORM STATES
    ───────────────────────────────────────────── */
    const [profileForm, setProfileForm] = useState(initialProfile);
    const [imageUrls, setImageUrls] = useState(initialImage);

    /* ─────────────────────────────────────────────
       CHANGE DETECTION
    ───────────────────────────────────────────── */
    const isProfileChanged =
        JSON.stringify(profileForm) !== JSON.stringify(initialProfile);

    const isImageChanged =
        JSON.stringify(imageUrls) !== JSON.stringify(initialImage);

    const errors = profileState.errors || {};
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

    /* ─────────────────────────────────────────────
       JSX
    ───────────────────────────────────────────── */
    return (
        <div className="space-y-10 bg-white ">

            {/* ================= PROFILE + IMAGE ================= */}
            <form
                action={profileAction}
                className="space-y-6 rounded border-gray-200 bg-white pb-6"
            >
                <h2 className="text-lg border-b px-6 py-3 mb-4 border-gray-200 font-semibold text-gray-800">
                    Personal Details
                </h2>

                {/* IMAGE + FORM WRAPPER */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] px-6">

                    {/* PROFILE IMAGE SECTION */}
                    <div className="flex flex-col  items-center gap-3 ">
                        <div className="h-56 w-40 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm">
                            <img
                                src={imageUrls?.[0] || "/images/not-found.png"}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="mt-auto">

                            {/* IMAGE UPLOAD */}
                            <UploadImage
                                uploadType="userImage"
                                onSuccess={(urls) => setImageUrls(urls)}
                            />
                        </div>
                    </div>

                    {/* FORM SECTION */}
                    <div className="space-y-4 ">
                        <input
                            type="hidden"
                            name="imageUrls"
                            value={JSON.stringify(imageUrls)}
                        />
                        <input type="hidden" name="customerId" value={customer.id} />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2  md:pr-6">

                            {/* First Name */}
                            <div>
                                <label className="text-sm text-gray-600">First Name</label>
                                <input
                                    name="first_name"
                                    value={profileForm.first_name}
                                    placeholder="First Name"
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, first_name: e.target.value })
                                    }
                                    className={`w-full rounded border px-3 py-2 text-sm ${errors.first_name ? "border-red-500" : "border-gray-200"
                                        }`}
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="text-sm text-gray-600">Last Name</label>
                                <input
                                    name="last_name"
                                    value={profileForm.last_name}
                                    placeholder="Last Name"
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, last_name: e.target.value })
                                    }
                                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <input
                                    type="email"
                                    value={customer.email}
                                    disabled
                                    className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm text-gray-600">Phone</label>
                                <input
                                    name="phone"
                                    value={profileForm.phone}
                                    placeholder="Phone"
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, phone: e.target.value })
                                    }
                                    className={`w-full rounded border px-3 py-2 text-sm ${errors.phone ? "border-red-500" : "border-gray-200"
                                        }`}
                                />
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="text-sm text-gray-600">WhatsApp</label>
                                <input
                                    name="whatsapp"
                                    value={profileForm.whatsapp}
                                    placeholder="WhatsApp"
                                    onChange={(e) =>
                                        setProfileForm({ ...profileForm, whatsapp: e.target.value })
                                    }
                                    className={`w-full rounded border px-3 py-2 text-sm ${errors.whatsapp ? "border-red-500" : "border-gray-200"
                                        }`}
                                />
                                {errors.whatsapp && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.whatsapp}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button
                            disabled={profilePending || (!isProfileChanged && !isImageChanged)}
                            className="mt-4 rounded cursor-pointer bg-[#00AEEF] px-6 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {profilePending ? "Saving..." : "Save Changes"}
                        </button>

                        {/* MESSAGE */}

                    </div>
                </div>
            </form>


            {/* ================= CHANGE PASSWORD ================= */}
            <div className="rounded-lg  bg-white pb-6">
                <h2 className="border-b border-gray-200 p-6 py-3 text-lg font-semibold text-gray-800">
                    Reset Password
                </h2>

                <form action={passwordAction} className="px-6 py-4">

                    {/* Current Password */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="current_password"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm
                 focus:border-[#00AEEF] focus:outline-none focus:ring-1
                 focus:ring-[#00AEEF]"
                            />
                             {passwordState.currentPassword && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {passwordState.currentPassword}
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* New + Confirm Password */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">
                                New password
                            </label>
                            <input
                                type="password"
                                name="new_password"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm
                   focus:border-[#00AEEF] focus:outline-none focus:ring-1
                   focus:ring-[#00AEEF]"
                            />
                            {passwordState.new_password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {passwordState.new_password}
                                    </p>
                                )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-700">
                                Confirm New password
                            </label>
                            <input
                                type="password"
                                name="confirm_password"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm
                   focus:border-[#00AEEF] focus:outline-none focus:ring-1
                   focus:ring-[#00AEEF]"
                            />
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        disabled={passwordPending}
                        className="rounded bg-[#00AEEF] px-6 py-2 text-sm font-medium text-white
               hover:opacity-90 disabled:opacity-60"
                    >
                        {passwordPending ? "Updating..." : "Save Changes"}
                    </button>

                </form>

            </div>
        </div>
    );
}
