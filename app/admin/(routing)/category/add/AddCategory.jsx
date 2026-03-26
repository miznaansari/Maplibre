"use client";

import React, { useEffect } from "react";
import { addCategory } from "./actions";
import { useToast } from "@/app/admin/context/ToastProvider";

const initialState = {
    success: false,
    errors: {},
    values: {},
};

// 🔹 Reusable error text
const ErrorText = ({ message }) =>
    message ? (
        <p className="mt-1 text-sm text-red-500">{message}</p>
    ) : null;

export default function AddCategory({ categories }) {
    const [state, action, pending] = React.useActionState(
        addCategory,
        initialState
    );

    const { showToast } = useToast();

    /* ================= TOAST HANDLING ================= */
    useEffect(() => {
        // ✅ SUCCESS
        if (state.success) {
            showToast({
                type: "success",
                message: "Category added successfully",
            });
        }

        // ❌ GLOBAL ERROR ONLY
        if (state.errors && Object.keys(state.errors).length > 0) {
            showToast({
                type: "error",
                message: state.errors.general || "Failed to add category    ",
            });
        }
    }, [state.success, state.errors, showToast]);

    return (
        <form
            action={action}
            className="m-2 rounded-lg border border-gray-200 bg-white  shadow-sm"
        >
            {/* ================= HEADER ================= */}
            <div className="mb-6 border-b border-gray-200 p-6 pb-4 ">
                <h2 className="text-xl font-semibold text-gray-800">Add Category</h2>

            </div>

            {/* ================= BASIC INFO ================= */}
            <div className="mb-8 p-6 pt-0">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* NAME */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            placeholder="e.g. Electronics"
                            defaultValue={state.values?.name || ""}
                            className={`w-full rounded-md border p-2.5 text-sm focus:outline-none ${state.errors?.name
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        <ErrorText message={state.errors?.name} />
                    </div>

                    {/* SLUG */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Slug
                        </label>
                        <input
                            name="slug"
                            placeholder="e.g. electronics"
                            defaultValue={state.values?.slug || ""}
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* PARENT */}
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Parent Category
                        </label>
                        <select
                            name="parent_id"
                            defaultValue={state.values?.parent_id || ""}
                            className={`w-full rounded-md border p-2.5 text-sm focus:outline-none ${state.errors?.parent_id
                                    ? "border-red-400"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                        >
                            <option value="">No Parent (Root Category)</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.path}
                                </option>
                            ))}
                        </select>
                        <ErrorText message={state.errors?.parent_id} />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Short description about this category..."
                            defaultValue={state.values?.description || ""}
                            className="h-24 w-full resize-none rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            <hr className="border-gray-200" />
            {/* ================= SEO META INFO ================= */}
            <div className="mb-8  rounded-lg   p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    SEO Meta Data
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* META TITLE */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Meta Title
                        </label>
                        <input
                            name="meta_title"
                            placeholder="SEO title for search engines"
                            defaultValue={state.values?.meta_title || ""}
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-gray-600 focus:outline-none"
                        />
                        <ErrorText message={state.errors?.meta_title} />
                    </div>

                    {/* FOCUS KEYWORD */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Focus Keyword
                        </label>
                        <input
                            name="focus_keyword"
                            placeholder="e.g. buy electronics online"
                            defaultValue={state.values?.focus_keyword || ""}
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-gray-600 focus:outline-none"
                        />
                    </div>

                    {/* META DESCRIPTION */}
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Meta Description
                        </label>
                        <textarea
                            name="meta_description"
                            placeholder="SEO description shown in search results..."
                            defaultValue={state.values?.meta_description || ""}
                            className="h-24 w-full resize-none rounded-md border border-gray-300 p-2.5 text-sm focus:border-gray-600 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="flex items-center justify-start p-6 gap-3 border-t border-gray-200 pt-4">
                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                    {pending ? "Saving..." : "Save Category"}
                </button>
            </div>
        </form>
    );

}
